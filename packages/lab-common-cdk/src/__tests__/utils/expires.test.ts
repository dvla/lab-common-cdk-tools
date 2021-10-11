/* eslint-disable @typescript-eslint/no-unused-vars,max-classes-per-file */
import '@aws-cdk/assert/jest';
import { Construct } from 'constructs';
import { App, Stack, StackProps, Duration } from 'aws-cdk-lib';
import moment from 'moment';
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
 * Custom Test stack
 */
class CustomTestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this, {
            expires: Duration.days(50)
        });
        const buck = lab.s3.Bucket(this, 'myBUCK');
    }
}

describe('Tests expires tag is assigned', () => {
    test('Tests the default expires tag is assigned', () => {
        // Given
        process.env.CDK_STAGE = 'prod';
        const app = new App({
            context: { project: 'buckets' },
        });

        const expires = Duration.days(100);

        // When
        const stack = new TestStack(app, 'MyTestStack');

        let now = moment().minute(0);
        const addedHours = expires.toHours();
        now = now.add(addedHours, 'hours').day(1);
        const expiresDate = now.format(lab.utils.EXPIRES_FORMAT);

        // Then
        expect(stack).toHaveResourceLike('AWS::S3::Bucket', {
            BucketName: 'mybuck-prod',
            Tags: [
                {
                    Key: 'lab_project',
                    Value: 'buckets'
                },
                {
                    Key: 'stack_expires',
                    Value: expiresDate
                }
            ]
        }
        );
    });

    test('Tests when a expires parameter given, the corresponding tag is produced', () => {
        // Given
        process.env.CDK_STAGE = 'prod';
        const app = new App({
            context: { project: 'buckets' },
        });

        const expires = Duration.days(50);

        // When
        const stack = new CustomTestStack(app, 'MyTestStack');

        let now = moment().minute(0);
        const addedHours = expires.toHours();
        now = now.add(addedHours, 'hours').day(1);
        const expiresDate = now.format(lab.utils.EXPIRES_FORMAT);

        // Then
        expect(stack).toHaveResourceLike('AWS::S3::Bucket', {
            BucketName: 'mybuck-prod',
            Tags: [
                {
                    Key: 'lab_project',
                    Value: 'buckets'
                },
                {
                    Key: 'stack_expires',
                    Value: expiresDate
                }
            ]
        }
        );
    });
});
