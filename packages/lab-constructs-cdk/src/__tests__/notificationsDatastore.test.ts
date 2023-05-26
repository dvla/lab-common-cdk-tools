/* eslint-disable import/no-extraneous-dependencies,jest/expect-expect */
import { App, Stack, StackProps  } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { Construct } from 'constructs';
import * as lab from '@dvla/lab-common-cdk';
import * as labcon from '..';

/**
 * Basic Test stack
 */
class TestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);
        const buck = lab.s3.Bucket(this, 'myBUCK');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const notify = new labcon.notify.NotificationsDatastore(this, 'notifications-untaxed', buck)
    }
}

describe('Tests notifications core functionality', () => {

    // Given
    const app = new App({
        context: { stage: 'basicstack', project : 'con-test' },
    });

    // When
    const stack = new TestStack(app, 'MyTestNotifyStack');

    test('The database, topic and table are created', () => {

        Template.fromStack(stack).resourceCountIs('AWS::Glue::Database', 1);

        // Then
        Template.fromStack(stack).hasResourceProperties('AWS::Glue::Database', {
            'DatabaseInput': {
                'Name': 'basicstack-con-test-notifications-untaxed-db'
            },
        });

        Template.fromStack(stack).hasResourceProperties('AWS::Glue::Table', {
            'TableInput': {
                'Name': 'basicstack-notifications-untaxed',
            },
        });

        Template.fromStack(stack).hasResourceProperties('AWS::SNS::Topic', {
            TopicName: 'basicstack-con-test-notifications-untaxed-topic',
            Tags: Match.arrayWith([{
                Key: 'lab_project',
                Value: 'con-test'
            }])
        });

    });

    test('The Kinesis Firehose delivery stream is created', () => {

        // Then
        expect(lab.utils.getStage(app)).toBe('basicstack');
        Template.fromStack(stack).hasResourceProperties('AWS::KinesisFirehose::DeliveryStream', {
            ExtendedS3DestinationConfiguration: {
                BufferingHints: {
                    IntervalInSeconds: 60,
                    SizeInMBs: 1
                },
                ErrorOutputPrefix: 'errors/notifications-untaxed/',
                Prefix: 'notifications-untaxed/',
                ProcessingConfiguration: {
                    Enabled: true,
                    Processors: [
                        {
                            Type: 'Lambda'
                        }
                    ]
                },
            }
        });
        lab.utils.copyStackTemplate(app, stack);
    });

    test('The lambda event processor is created', () => {

        // Then
        Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', {
            FunctionName: 'basicstack-notifications-untaxed-eventProcessor',
            Handler: 'index.handler',
            Runtime: 'nodejs18.x',
            Tags: Match.arrayWith([{
                Key: 'lab_project',
                Value: 'con-test'
            }])
        });

    });

    test('The custom role for kinesis firehose is created', () => {

        // Then
        Template.fromStack(stack).hasResourceProperties('AWS::IAM::Role', {
            AssumeRolePolicyDocument : {
                Statement: [
                    {
                        Action: 'sts:AssumeRole',
                        Effect: 'Allow',
                        Principal: {
                            Service: 'firehose.amazonaws.com'
                        }
                    }
                ],
            },
            Description: 'Custom firehose role for S3 destinations',
            Tags: Match.arrayWith([{
                Key: 'lab_project',
                Value: 'con-test'
            }])
        });

        Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
            PolicyDocument : {
                Statement: Match.arrayWith([ Match.objectLike(
                    {
                        Action: 'glue:GetTableVersions',
                        Effect: 'Allow'
                    })])
            }
        });

        Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
            PolicyDocument : {
                Statement: [
                    {
                        Action: 'firehose:PutRecord',
                        Effect: 'Allow'
                    }
                ],
            }
        });

    });

    test('The custom role for the sns topic to read from firehose is created', () => {

        // Then
        Template.fromStack(stack).hasResourceProperties('AWS::IAM::Role', {
            AssumeRolePolicyDocument : {
                Statement: [
                    {
                        Action: 'sts:AssumeRole',
                        Effect: 'Allow',
                        Principal: {
                            Service: 'sns.amazonaws.com'
                        }
                    }
                ],
            },
            Description: 'Custom firehose role for SNS subscriptions',
            Tags: Match.arrayWith([{
                Key: 'lab_project',
                Value: 'con-test'
            }])
        });
    })

});
