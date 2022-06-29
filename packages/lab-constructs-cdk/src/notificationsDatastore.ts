/* eslint-disable import/no-extraneous-dependencies */
import { Construct } from 'constructs';
import { Stack, aws_s3 as s3,
    aws_iam as iam, aws_kinesisfirehose as kinesisFirehose,
    aws_sns as sns, CfnOutput, aws_logs as logs, RemovalPolicy } from 'aws-cdk-lib';
import * as lab from '@dvla/lab-common-cdk';
import * as glue from '@aws-cdk/aws-glue-alpha';

/**
 * Save incoming messages on a topic to a S3 bucket using Kinesis Firehose, queryable with Athena.
 * @param {Construct} scope - the construct scope
 * @param {string} id - name of topic
 * @param {s3.IBucket} bucket - S3 bucket to save data to
 * @param {glue.IDatabase} database - Glue database to save data to
 */
export class NotificationsDatastore extends Construct {

    public readonly database: glue.IDatabase;

    public readonly topic: sns.ITopic;

    constructor(scope: Construct, id: string, bucket: s3.IBucket, topic?: sns.ITopic, database?: glue.IDatabase) {
        super(scope, id);
        const stage = lab.utils.getStage(this);
        const stack = Stack.of(this)
        const S3_PREFIX = `${id}/`;

        if (!database) {
            database = NotificationsDatastore.createDatabase(stack, id, stage);
        }
        this.database = database;

        if (!topic) {
            topic = NotificationsDatastore.createTopic(stack, id, stage);
        }
        this.topic = topic;

        // create a lambda for event processing
        const eventProcessorLambda = lab.lambda.NodejsFunction(this, `${id}-EventProcessorLambda`, {
            entry: `${__dirname}/eventProcessor.ts`,
            functionName: `${stage}-${id}-eventProcessor`,
        });

        // create the role and grant permission for kinesis to access the bucket.
        const firehoseRoleS3 = new iam.Role(this, 's3-firehose-role', {
            assumedBy: new iam.ServicePrincipal('firehose.amazonaws.com'),
            description: 'Custom firehose role for S3 destinations'
        });
        bucket.grantReadWrite(firehoseRoleS3);

        // Create glue table with schema for SNS notifications
        const glueTable = new glue.Table(stack, `${id}-table`, {
            database,
            tableName: `${lab.utils.getStage(stack)}-${id}`,
            columns: [
                { name: 'MessageId', type: glue.Schema.STRING },
                { name: 'Message', type: glue.Schema.STRING },
                { name: 'Detail', type: glue.Schema.map(glue.Schema.STRING, glue.Schema.STRING) },
                { name: 'Timestamp', type: glue.Schema.TIMESTAMP },
                { name: 'DetailType', type: glue.Schema.STRING },
                { name: 'Source', type: glue.Schema.STRING },
                { name: 'Type', type: glue.Schema.STRING },
            ],
            dataFormat: glue.DataFormat.JSON,
            bucket,
            s3Prefix: S3_PREFIX,
        });

        firehoseRoleS3.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: [glueTable.tableArn],
            actions: [
                'glue:GetTableVersions',
            ],
        }));

        firehoseRoleS3.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: [eventProcessorLambda.functionArn],
            actions: [
                'lambda:InvokeFunction',
            ],
        }));

        glueTable.grantReadWrite(firehoseRoleS3);

        // creates a log group for the firehose delivery stream
        const deliveryLogGroup = new logs.LogGroup(stack, `${id}-DeliveryStreamLogGroup`, {
            removalPolicy: RemovalPolicy.DESTROY,
            retention: logs.RetentionDays.ONE_WEEK,
        })
        const deliveryLogStream = new logs.LogStream(stack, `${id}-DeliveryStreamLogSteam`, {
            logGroup: deliveryLogGroup
        });
        deliveryLogGroup.grantWrite(firehoseRoleS3);

        // create a firehose delivery stream
        const deliveryStream = new kinesisFirehose.CfnDeliveryStream(this, `${id}-deliveryStream`, {
            extendedS3DestinationConfiguration: {
                roleArn: firehoseRoleS3.roleArn,
                bucketArn: bucket.bucketArn,
                prefix: S3_PREFIX,
                errorOutputPrefix: 'errors/' + S3_PREFIX,
                cloudWatchLoggingOptions: {
                    enabled: true,
                    logGroupName: deliveryLogGroup.logGroupName,
                    logStreamName: deliveryLogStream.logStreamName
                },
                bufferingHints: {
                    sizeInMBs: 1, // must be at least 64 when data format conversion is enabled
                    intervalInSeconds: 60,
                },
                processingConfiguration: {
                    enabled: true,
                    processors: [
                        {
                            type: 'Lambda',
                            parameters: [
                                {
                                    parameterName: 'LambdaArn',
                                    parameterValue: eventProcessorLambda.functionArn,
                                }
                            ]
                        },
                    ],
                },
                dataFormatConversionConfiguration: {
                    enabled: false,
                },
            },
        });
        deliveryStream.node.addDependency(firehoseRoleS3);

        // create the role for the sns topic to read from firehose
        const snsTopicRole = new iam.Role(this, 'sns-topic-role', {
            assumedBy: new iam.ServicePrincipal('sns.amazonaws.com'),
            description: 'Custom firehose role for SNS subscriptions',
        });
        snsTopicRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: [deliveryStream.attrArn],
            actions: [
                'firehose:PutRecord',
            ],
        }));

        // subscribe to the sns topic
        new sns.Subscription(this, 'notificationsDatastoreSubscription', {
            topic,
            endpoint: deliveryStream.attrArn,
            protocol: sns.SubscriptionProtocol.FIREHOSE,
            subscriptionRoleArn: snsTopicRole.roleArn
        });
    }

    /**
     * Creates a SNS topic
     * @param {Stack} stack
     * @param {string} id
     * @param {string} stage
     * @returns {sns.ITopic}
     */
    public static createTopic = (stack: Stack, id: string, stage: string): sns.ITopic => {

        const project = lab.utils.getProject(stack);
        const topic = new sns.Topic(stack, `${id}-topic`, {
            topicName: lab.utils.getStageAwareName(stack, `${project}-${id}-topic`),
        });

        new CfnOutput(stack, `${id}-topic-arn`, {
            value: topic.topicArn,
            exportName: `${stage}-${project}-${id}-topic-arn`
        });

        return topic
    }

    /**
     * Creates a Glue database
     * @param {stack} stack
     * @param {string} id
     * @param {string} stage
     * @returns {sns.IDatabase}
     */
    public static createDatabase = (stack: Stack, id: string, stage: string): glue.IDatabase => {

        const project = lab.utils.getProject(stack);
        const glueDatabase = new glue.Database(stack, `${id}-db`, {
            databaseName: `${stage}-${project}-${id}-db`,
        });

        new CfnOutput(stack, `${id}-db-arn`, {
            value: glueDatabase.databaseArn,
            exportName: `${stage}-${project}-${id}-db-arn`
        });

        return glueDatabase;
    }

}
