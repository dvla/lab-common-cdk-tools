import '@aws-cdk/assert/jest';
import * as cdk from '@aws-cdk/core';
import { Role } from '@aws-cdk/aws-iam';
import * as lab from '../..';

/**
 * Basic Test stack
 */
class TestStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const role = new Role(this, 'MyTestRole', {
            assumedBy: lab.constants.service.SNS,
        });
    }
}

describe('Tests root core functionality', () => {

    test('Tests basic stack', () => {
        // Given
        const app = new cdk.App({
            context: { stage: 'basicstack' },
        });

        // When
        const stack = new TestStack(app, 'MyTestStack');

        // Then
        expect(lab.utils.getStage(app)).toBe('basicstack');
        expect(stack).toHaveResourceLike('AWS::IAM::Role', {
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
