import { Template, Match } from 'aws-cdk-lib/assertions';
import { Construct } from 'constructs';
import { aws_iam as iam, App, Stack, StackProps } from 'aws-cdk-lib';
import * as lab from '../..';

/**
 * Basic Test stack
 */
class TestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const role = new iam.Role(this, 'MyTestRole', {
            assumedBy: lab.constants.service.SNS,
        });
    }
}

describe('Tests root core functionality', () => {

    test('Tests basic stack', () => {
        // Given
        const app = new App({
            context: { stage: 'basicstack' },
        });

        // When
        const stack = new TestStack(app, 'MyTestCoreStack');
        const template = Template.fromStack(stack);

        // Then
        expect(lab.utils.getStage(app)).toBe('basicstack');

        template.hasResourceProperties('AWS::IAM::Role', {
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
            Tags: Match.arrayWith([
                {
                    Key: 'lab_project',
                    Value: 'dvla-emerging-tech'
                }
            ])
        });

        lab.utils.copyStackTemplate(app, stack);
    });
});
