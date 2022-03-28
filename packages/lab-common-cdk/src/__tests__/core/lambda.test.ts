/* eslint-disable @typescript-eslint/no-unused-vars,max-classes-per-file */
import '@aws-cdk/assert/jest';
import { Construct } from 'constructs';
import { aws_lambda as lambda, aws_logs as logs, App, Stack, StackProps, Duration } from 'aws-cdk-lib';
import * as lab from '../..';
/**
 * Basic Test stack
 */
class TestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        const lamb = lab.lambda.Function(this, 'test-func');
    }
}

/**
 * More Advanced test stack
 */
class AdvancedTestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        const lamb = lab.lambda.Function(this, 'test-func', {
            handler: 'index.specialFunc',
            memorySize: 256,
            code: lambda.Code.fromAsset('src/__tests__/fixtures/test-func'),
            runtime: lambda.Runtime.NODEJS_14_X,
            logRetention: logs.RetentionDays.ONE_YEAR,
        }, { useStage : false });
    }
}

/**
 * Customised Test stack
 */
class CustomTestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        const lamb = lab.lambda.Function(this, 'src');
    }
}

describe('Tests lambda core functionality', () => {

    // Given
    const app = new App({
        context: { stage: 'basicstack', assetPath: './src/__tests__/fixtures' },
    });

    test('Tests basic lambda stack', () => {

        // When
        const stack = new TestStack(app, 'MyTestLambdaStack');

        // Then
        expect(lab.utils.getStage(app)).toBe('basicstack');
        expect(stack).toHaveResourceLike('AWS::Lambda::Function', {
            FunctionName: 'basicstack-test-func',
            Handler: 'index.handler',
            MemorySize: 128,
            Runtime: 'nodejs12.x',
            Tags: [
                {
                    Key: 'lab_project',
                    Value: 'dvla-emerging-tech'
                }
            ]
        }
        );

        lab.utils.copyStackTemplate(app, stack);
    });

    test('Tests asset path lambda stack', () => {

        // Given
        const anotherApp = new App({
            context: { stage: 'mystack' },
        });

        // When
        const stack = new CustomTestStack(anotherApp, 'MyAssetTestStack');

        // Then
        expect(stack).toHaveResourceLike('AWS::Lambda::Function', {
            FunctionName: 'mystack-src',
        });
    });

    test('Tests advanced lambda stack', () => {

        // When
        const stack = new AdvancedTestStack(app, 'MyAdvancedTestLambdaStack');

        // Then
        expect(stack).toHaveResourceLike('AWS::Lambda::Function', {
            FunctionName: 'test-func',
            Handler: 'index.specialFunc',
            MemorySize: 256,
            Runtime: 'nodejs14.x',
        });

        expect(stack).toHaveResourceLike('Custom::LogRetention', {
            RetentionInDays: 365
        });

        lab.utils.copyStackTemplate(app, stack);
    });
});
