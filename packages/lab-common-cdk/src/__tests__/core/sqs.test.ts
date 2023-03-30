/* eslint-disable @typescript-eslint/no-unused-vars,max-classes-per-file,@typescript-eslint/no-unsafe-assignment */
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Construct } from 'constructs';
import {
    App,
    Stack,
    StackProps,
    aws_lambda as lambda,
    Duration, aws_sqs as sqs
} from 'aws-cdk-lib';
import * as lab from '../..';

/**
 * Basic Test stack
 */
class TestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        const basicQueue = lab.sqs.Queue(this, 'test');
    }
}

/**
 * Basic Test stack
 */
class DLQTestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        const basicQueue = lab.sqs.DLQueue(this, 'test');
    }
}

/**
 * FIFO stack
 */
class TestFifoStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        const basicQueue = lab.sqs.FifoQueue(this, 'testq', {
            deliveryDelay: Duration.seconds(8)
        }, {
            dlqMaxReceiveCount: 2
        });
    }
}

/**
 * FIFO stack via props
 */
class TestFifoPropsStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        const fifoQueue = lab.sqs.Queue(this, 'testfq', {
            fifo: true,
            deliveryDelay: Duration.seconds(6)
        }, {
            dlq: {
                retentionPeriod : Duration.days(5)
            },
            dlqMaxReceiveCount: 1
        });
    }
}

/**
 * A stack with a Lambda worker
 */
class WorkerStack extends Stack {

    public readonly worker: lambda.Function;

    public readonly queue: sqs.Queue;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);
        this.worker = lab.lambda.Function(this, 'test-func');
        this.queue = lab.sqs.Queue(this, 'lam', {}, {
            lambdaWorker: this.worker,
            lambdaBatchSize: 5
        });
    }
}

describe('Tests Queue core functionality', () => {

    test('Tests default Queue stack', () => {
        // Given
        const app = new App({
            context: { project: 'my-test-queue', stage: 'sqstest' },
        });

        // When
        const stack = new TestStack(app, 'MyTestSQSStack');
        const template = Template.fromStack(stack);

        // Then
        template.resourceCountIs('AWS::SQS::Queue', 2);
        template.hasResourceProperties('AWS::SQS::Queue', {
            QueueName: 'sqstest-test-queue',
            DelaySeconds: 1,
            ReceiveMessageWaitTimeSeconds: 5,
            VisibilityTimeout: 180,
            RedrivePolicy: {
                maxReceiveCount: 3,
            },
            Tags: Match.arrayWith([
                {
                    Key: 'lab_project',
                    Value: 'my-test-queue'
                }
            ])
        });
        template.hasResourceProperties('AWS::SQS::Queue', {
            QueueName: 'sqstest-test-dl-queue',
            MessageRetentionPeriod: 1209600,
            Tags: Match.arrayWith([
                {
                    Key: 'lab_project',
                    Value: 'my-test-queue'
                }
            ])
        });

        template.hasResourceProperties('AWS::CloudWatch::Alarm', {
            AlarmName: 'sqstest-test-dl-queue-messages',
            MetricName: 'ApproximateNumberOfMessagesVisible'
        });
        lab.utils.copyStackTemplate(app, stack);
    });

    test('Tests Fifo Queue stack', () => {
        // Given
        const app = new App({
            context: { project: 'my-test-queue', stage: 'testing' },
        });

        // When
        const stack = new TestFifoStack(app, 'FiTestStack');
        const template = Template.fromStack(stack);

        // Then
        template.resourceCountIs('AWS::SQS::Queue', 2);
        template.hasResourceProperties('AWS::SQS::Queue', {
            QueueName: 'testing-testq-queue.fifo',
            DelaySeconds: 8,
            FifoQueue: true,
            ContentBasedDeduplication: true,
            RedrivePolicy: {
                maxReceiveCount: 2,
            },
            Tags: Match.arrayWith([
                {
                    Key: 'lab_project',
                    Value: 'my-test-queue'
                }
            ])
        });
        template.hasResourceProperties('AWS::SQS::Queue', {
            QueueName: 'testing-testq-dl-queue.fifo',
            MessageRetentionPeriod: 1209600,
            FifoQueue: true,
            ContentBasedDeduplication: true,
            Tags: Match.arrayWith([
                {
                    Key: 'lab_project',
                    Value: 'my-test-queue'
                }
            ])
        });

        lab.utils.copyStackTemplate(app, stack);
    });

    test('Tests Fifo Queue configured via props stack', () => {
        // Given
        const app = new App({
            context: { project: 'my-t-queue', stage: 'testing' },
        });

        // When
        const stack = new TestFifoPropsStack(app, 'FiFoTestStack');
        const template = Template.fromStack(stack);

        // Then
        template.resourceCountIs('AWS::SQS::Queue', 2);
        template.hasResourceProperties('AWS::SQS::Queue', {
            QueueName: 'testing-testfq-queue.fifo',
            DelaySeconds: 6,
            FifoQueue: true,
            ContentBasedDeduplication: true,
            RedrivePolicy: {
                maxReceiveCount: 1,
            },
            Tags: Match.arrayWith([
                {
                    Key: 'lab_project',
                    Value: 'my-t-queue'
                }
            ])
        });
        template.hasResourceProperties('AWS::SQS::Queue', {
            QueueName: 'testing-testfq-dl-queue.fifo',
            MessageRetentionPeriod: 432000,
            FifoQueue: true,
            ContentBasedDeduplication: true,
            Tags: Match.arrayWith([
                {
                    Key: 'lab_project',
                    Value: 'my-t-queue'
                }
            ])
        });

        lab.utils.copyStackTemplate(app, stack);
    });

    test('Tests DLQ Queue stack', () => {
        // Given
        const app = new App({
            context: { project: 'my-test-queue', stage: 'sqstest' },
        });

        // When
        const stack = new DLQTestStack(app, 'MyTestDLQSQSStack');
        const template = Template.fromStack(stack);

        // Then
        template.resourceCountIs('AWS::SQS::Queue', 1);
        template.hasResourceProperties('AWS::SQS::Queue', {
            QueueName: 'sqstest-test-dl-queue',
            MessageRetentionPeriod: 1209600,
            Tags: Match.arrayWith([
                {
                    Key: 'lab_project',
                    Value: 'my-test-queue'
                }
            ])
        });

        template.hasResourceProperties('AWS::CloudWatch::Alarm', {
            AlarmName: 'sqstest-test-dl-queue-messages',
            AlarmDescription: 'The dead letter queue is filling up with messages',
            MetricName: 'ApproximateNumberOfMessagesVisible',
            Threshold: 5
        });
        lab.utils.copyStackTemplate(app, stack);
    });

    test('Tests Lambda worker Queue stack', () => {
        // Given
        const app = new App({
            context: { project: 'my-lamb-queue', stage: 'testing', assetPath: './src/__tests__/fixtures' },
        });

        // When
        const stack = new WorkerStack(app, 'WorkingStack');
        const template = Template.fromStack(stack);

        // Then
        template.resourceCountIs('AWS::SQS::Queue', 2);
        template.hasResourceProperties('AWS::SQS::Queue', {
            QueueName: 'testing-lam-queue',
            Tags: Match.arrayWith([
                {
                    Key: 'lab_project',
                    Value: 'my-lamb-queue'
                }
            ])
        });
        template.hasResourceProperties('AWS::SQS::Queue', {
            QueueName: 'testing-lam-dl-queue',
        });
        template.hasResourceProperties('AWS::Lambda::EventSourceMapping', {
            FunctionName: stack.resolve(stack.worker.functionName),
            EventSourceArn: stack.resolve(stack.queue.queueArn),
            BatchSize: 5
        });

        lab.utils.copyStackTemplate(app, stack);
    });
});
