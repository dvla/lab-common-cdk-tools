/* eslint-disable @typescript-eslint/no-unused-vars,max-classes-per-file */
import '@aws-cdk/assert/jest';
import { Construct } from 'constructs';
import { aws_s3 as s3, App, Stack, StackProps, Duration } from 'aws-cdk-lib';

import * as lab from '../..';

/**
 * Basic Test stack
 */
class TestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);
        const buck = lab.s3.Bucket(this, 'myBUCK');
    }
}

/**
 * More Advanced test stack
 */
class AdvancedTestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);
        const buck = lab.s3.Bucket(this, 'theBUCK', {}, { enableCors : true });
    }
}

/**
 * Customised test stack
 */
class CustomTestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);
        const buck = lab.s3.Bucket(this, 'theBUCK', {
            encryption: s3.BucketEncryption.KMS_MANAGED,
            bucketName : 'my-custom-bucket',
            lifecycleRules:  [{
                expiration: Duration.days(30),
            }]
        }, { expireContent : false, useStage : false } );
    }
}

describe('Tests bucket core functionality', () => {

    test('Tests basic bucket stack', () => {
        // Given
        process.env.CDK_STAGE = 'prod';
        const app = new App({
            context: { project: 'buckets' },
        });

        // When
        const stack = new TestStack(app, 'MyTestStack');

        // Then
        expect(stack).toHaveResourceLike('AWS::S3::Bucket', {
            BucketName: 'mybuck-prod',
            BucketEncryption: {
                ServerSideEncryptionConfiguration: [
                    {
                        ServerSideEncryptionByDefault: {
                            SSEAlgorithm: 'AES256'
                        }
                    }
                ]
            },
            LifecycleConfiguration: {
                Rules: [{ ExpirationInDays: 14, Status: 'Enabled' }]
            },
            Tags: [
                {
                    Key: 'lab_project',
                    Value: 'buckets'
                }
            ]
        }
        );
    });

    test('Tests advanced bucket stack', () => {
        // Given
        const app = new App({
            context: { project: 'bucketz', stage: 'not-prod' },
        });

        // When
        const stack = new AdvancedTestStack(app, 'MyAdvancedStack');

        // Then
        expect(stack).toHaveResourceLike('AWS::S3::Bucket', {
            BucketName: 'thebuck-not-prod',
            CorsConfiguration: {
                CorsRules: [{
                    'AllowedHeaders': ['*'],
                    'AllowedMethods': ['PUT', 'POST', 'GET'],
                    'AllowedOrigins': ['*'],
                    'MaxAge': 3600
                }]
            },
            LifecycleConfiguration: {
                Rules: [{ ExpirationInDays: 14, Status: 'Enabled' }]
            },
            Tags: [
                {
                    Key: 'lab_project',
                    Value: 'bucketz'
                }
            ]
        }
        );
    });

    test('Tests custom bucket stack', () => {
        // Given
        const app = new App();

        // When
        const stack = new CustomTestStack(app, 'MyCustomStack');

        // Then
        expect(stack).toHaveResourceLike('AWS::S3::Bucket', {
            BucketName: 'my-custom-bucket',
            LifecycleConfiguration: {
                Rules: [{ ExpirationInDays: 30, Status: 'Enabled' }]
            },
            BucketEncryption: {
                ServerSideEncryptionConfiguration: [
                    {
                        ServerSideEncryptionByDefault: {
                            SSEAlgorithm: 'aws:kms'
                        }
                    }
                ]
            },
            Tags: [
                {
                    Key: 'lab_project',
                    Value: 'dvla-emerging-tech'
                }
            ]
        }
        );
    });
});
