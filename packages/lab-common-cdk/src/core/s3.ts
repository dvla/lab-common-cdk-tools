import * as s3 from '@aws-cdk/aws-s3';

export const BUCKET_DEFAULTS = {
    encryption: s3.BucketEncryption.S3_MANAGED,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
}