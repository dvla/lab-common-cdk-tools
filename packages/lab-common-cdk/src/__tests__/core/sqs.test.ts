/* eslint-disable @typescript-eslint/no-unused-vars,max-classes-per-file */
import '@aws-cdk/assert/jest';
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

        // Then
        expect(stack).toCountResources('AWS::SQS::Queue', 2);
        expect(stack).toHaveResourceLike('AWS::SQS::Queue', {
            QueueName: 'sqstest-test-queue',
            DelaySeconds: 1,
            ReceiveMessageWaitTimeSeconds: 5,
            VisibilityTimeout: 180,
            RedrivePolicy: {
                maxReceiveCount: 3,
            },
            Tags: [
                {
                    Key: 'lab_project',
                    Value: 'my-test-queue'
                }
            ]
        });
        expect(stack).toHaveResourceLike('AWS::SQS::Queue', {
            QueueName: 'sqstest-test-dl-queue',
            MessageRetentionPeriod: 1209600,
            Tags: [
                {
                    Key: 'lab_project',
                    Value: 'my-test-queue'
                }
            ]
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

        // Then
        expect(stack).toCountResources('AWS::SQS::Queue', 2);
        expect(stack).toHaveResourceLike('AWS::SQS::Queue', {
            QueueName: 'testing-testq-queue.fifo',
            DelaySeconds: 8,
            FifoQueue: true,
            ContentBasedDeduplication: true,
            RedrivePolicy: {
                maxReceiveCount: 2,
            },
            Tags: [
                {
                    Key: 'lab_project',
                    Value: 'my-test-queue'
                }
            ]
        });
        expect(stack).toHaveResourceLike('AWS::SQS::Queue', {
            QueueName: 'testing-testq-dl-queue.fifo',
            MessageRetentionPeriod: 1209600,
            FifoQueue: true,
            ContentBasedDeduplication: true,
            Tags: [
                {
                    Key: 'lab_project',
                    Value: 'my-test-queue'
                }
            ]
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
        // Then
        expect(stack).toCountResources('AWS::SQS::Queue', 2);
        expect(stack).toHaveResourceLike('AWS::SQS::Queue', {
            QueueName: 'testing-lam-queue',
            Tags: [
                {
                    Key: 'lab_project',
                    Value: 'my-lamb-queue'
                }
            ]
        });
        expect(stack).toHaveResourceLike('AWS::SQS::Queue', {
            QueueName: 'testing-lam-dl-queue',
        });
        expect(stack).toHaveResourceLike('AWS::Lambda::EventSourceMapping', {
            FunctionName: stack.resolve(stack.worker.functionName),
            EventSourceArn: stack.resolve(stack.queue.queueArn),
            BatchSize: 5
        });

        lab.utils.copyStackTemplate(app, stack);
    });
});
