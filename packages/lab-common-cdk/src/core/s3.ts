import { Construct } from 'constructs';
import { aws_s3 as s3, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { MergeAware, StageAware } from './defaults';
import { getStage, mergeProperties, nagSuppress } from '../utils';

export const BUCKET_DEFAULTS = {
    encryption: s3.BucketEncryption.S3_MANAGED,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    removalPolicy: RemovalPolicy.DESTROY,
} as Partial<s3.BucketProps>;

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
export const Bucket = (scope: Construct, id: string, props?:  Partial<s3.BucketProps>,
    params?:Partial<BucketParams>): s3.Bucket => {

    const stage = getStage(scope, params);
    const bucketName = stage ? `${id}-${stage}` : id;

    const bucketProps: any = {
        bucketName: bucketName.toLowerCase(),
    };
    const enableCors = params?.enableCors ?? false;
    const expireContent = params?.expireContent ?? true;

    if (enableCors) {
        bucketProps.cors = [{
            allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.GET],
            allowedOrigins: ['*'],
            allowedHeaders: ['*'],
            maxAge: 3600,
        }]
    }

    if (expireContent) {
        bucketProps.lifecycleRules = [{
            expiration: Duration.days(14),
        }]
    }
    const defaultProps = mergeProperties(BUCKET_DEFAULTS, bucketProps);
    const createdBucket = new s3.Bucket(scope, id, mergeProperties(defaultProps, props));
    nagSuppress(createdBucket, [
        { id: 'W35', reason: 'We are not concerned about access logging for this bucket' },
    ]);
    return createdBucket;
};
