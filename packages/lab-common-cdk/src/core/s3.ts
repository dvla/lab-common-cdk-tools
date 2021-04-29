import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { MergeAware, StageAware } from './defaults';
import { getStage, mergeProperties } from '../utils';

export const BUCKET_DEFAULTS = {
    encryption: s3.BucketEncryption.S3_MANAGED,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
};

/**
 * Additional parameters used by the Bucket creation function.
 */
export interface BucketParams extends StageAware, MergeAware {
    /**
     * Should Cors be enabled.
     * @Default false
     */
    readonly enableCors: boolean;

    /**
     * Should content be removed after 14 days?
     * @Default true
     */
    readonly expireContent: boolean;
}

/**
 *
 * Creates a standard s3 bucket, using sensible defaults where possible.
 * The optional custom BucketProps will override the default parameters.
 * @param scope - the stack
 * @param id - a meaningful name
 * @param props - Optional custom v to use with the bucket.
 * @param params - Optional additional parameters specific to this function.
 * @constructor
 */
export const Bucket = (scope: cdk.Construct, id: string, props?:  Partial<s3.BucketProps>,
    params?:Partial<BucketParams>): s3.Bucket => {

    const stage = getStage(scope, params);
    const bucketName = stage ? `${id}-${stage}` : id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bucketProps: any = {
        bucketName: bucketName.toLowerCase(),
    };
    const enableCors = params?.enableCors ?? false;
    const expireContent = params?.expireContent ?? true;

    if (enableCors) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        bucketProps.cors = [{
            allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
            allowedOrigins: ['*'],
            allowedHeaders: ['*'],
            maxAge: 3600,
        }]
    }

    if (expireContent) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        bucketProps.lifecycleRules = [{
            expiration: cdk.Duration.days(14),
        }]
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    const defaultProps = mergeProperties(BUCKET_DEFAULTS, bucketProps);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    const createdBucket = new s3.Bucket(scope, id, mergeProperties(defaultProps, props));
    return createdBucket;
};
