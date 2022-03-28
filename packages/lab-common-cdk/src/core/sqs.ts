import { Construct } from 'constructs';
import {
    Duration,
    aws_lambda as lambda,
    aws_sqs as sqs,
} from 'aws-cdk-lib';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { MergeAware, StageAware } from './defaults';
import { getStageAwareName, mergeProperties } from '../utils';

export const QUEUE_DEFAULTS = {
    deliveryDelay: Duration.seconds(1),
    receiveMessageWaitTime: Duration.seconds(5),
    visibilityTimeout: Duration.seconds(180),
} as Partial<sqs.QueueProps>;

/**
 * Additional parameters used by the Queue creation function.
 */
export interface QueueParams extends StageAware, MergeAware {

    /**
     * Optional QueueProps for the dead-letter queue
     */
    readonly dlq? : Partial<sqs.QueueProps>

    /**
     * The number of times a message can be unsuccessfully dequeued before being moved to the dead-letter queue.
     * Default: 3
     */
    readonly dlqMaxReceiveCount?: number;

    /**
     * An optional AWS Lambda that will process events in the queue.
     */
    readonly lambdaWorker?: lambda.IFunction;

    /**
     * The largest number of records that Lambda will retrieve at the time of invoking your function.
     * Default: 10
     */
    readonly lambdaBatchSize?: number;
}

/**
 * Creates a standard Queue, using sensible defaults where possible.
 * The optional custom QueueProps will override the default parameters.
 * @param scope - the stack
 * @param id - a meaningful name
 * @param props - Optional custom QueueProps to use with the Queue.
 * @param params - Optional additional parameters specific to this Queue.
 * @constructor
 */
export const Queue = (scope: Construct, id: string, props?:  Partial<sqs.QueueProps>,
    params?:Partial<QueueParams>): sqs.Queue => {

    const isFifo = props?.fifo ?? false;
    const queuePrefix = getStageAwareName(scope, id, params);
    const queueName = `${queuePrefix}-queue${isFifo?'.fifo':''}`
    const dlQName = `${queuePrefix}-dl-queue${isFifo?'.fifo':''}`

    // Create the dead letter queue
    const dlQueueProps: any = {
        queueName : dlQName,
        // 14 days is the maximum (we want to keep as long as possible).
        retentionPeriod: Duration.days(14),
        contentBasedDeduplication: props?.contentBasedDeduplication ?? false
    };

    // There is a bug with FIFO at the moment
    // https://github.com/aws/aws-cdk/issues/8550
    if (isFifo) {
        dlQueueProps.fifo = true
    }

    const createdDlq = new sqs.Queue(scope, dlQName, mergeProperties(dlQueueProps, params?.dlq));

    // Now create the main queue
    const queueProps: any = {
        queueName,
        deadLetterQueue: {
            maxReceiveCount: params?.dlqMaxReceiveCount ?? 3,
            queue: createdDlq,
        },
    };
    const defaultProps = mergeProperties(QUEUE_DEFAULTS, queueProps);
    const createdQueue = new sqs.Queue(scope, id, mergeProperties(defaultProps, props));

    // Optional processing lambda
    if (params?.lambdaWorker) {
        createdQueue.grantConsumeMessages(params.lambdaWorker);
        // Send queue events to the lambda
        params.lambdaWorker.addEventSource(new SqsEventSource(createdQueue, {
            batchSize: params.lambdaBatchSize ?? 10,
        }));
    }
    return createdQueue;
};

/**
 * Creates a FIFO Queue, using sensible defaults where possible.
 * The optional custom QueueProps will override the default parameters.
 * @param scope - the stack
 * @param id - a meaningful name
 * @param props - Optional custom QueueProps to use with the Queue.
 * @param params - Optional additional parameters specific to this Queue.
 * @constructor
 */
export const FifoQueue = (scope: Construct, id: string, props?:  Partial<sqs.QueueProps>,
    params?:Partial<QueueParams>): sqs.Queue => {
    const fifoProps : any = {
        fifo : true,
        contentBasedDeduplication : true
    };
    return Queue(scope, id, mergeProperties(fifoProps, props), params);
};
