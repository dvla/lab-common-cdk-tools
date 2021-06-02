/* eslint-disable @typescript-eslint/no-unused-vars,max-classes-per-file */
import '@aws-cdk/assert/jest';
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import { lab, labutil } from '../..';

/**
 * Basic Test stack
 */
class TestStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        labutil.tag(this);

        const lamb = lab.lambda.NodejsFunction(this, 'simple-func');
    }
}

/**
 * More Adanced test stack
 */
class AdvancedTestStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        labutil.tag(this);

        const lamb = lab.lambda.NodejsFunction(this, 'test-func', {
            functionName: 'nice-func',
            entry: './src/utils/index.ts',
            handler: 'my.handle',
            memorySize: 256,
        }, { useStage : false });
    }
}

describe('Tests NodeJs lambda core functionality', () => {


    test('Tests basic lambda stack', () => {

        // Given
        const app = new cdk.App({
            context: { stage: 'basicstack', assetPath: './src/__tests__/fixtures' },
        });

        // When
        const stack = new TestStack(app, 'MyTestStack');

        // Then
        expect(labutil.getStage(app)).toBe('basicstack');
        expect(stack).toHaveResourceLike('AWS::Lambda::Function', {
            Handler: 'index.handler',
            MemorySize: 128,
            Runtime: 'nodejs14.x',
            Tags: [
                {
                    Key: 'lab_project',
                    Value: 'dvla-emerging-tech'
                }
            ]
        }
        );
    });

    test('Tests advanced lambda stack', () => {

        // Given
        const app = new cdk.App({
            context: { stage: 'betterstack', project: 'nicer' },
        });

        // When
        const stack = new AdvancedTestStack(app, 'MyAdvancedTestStack');

        // Then
        expect(stack).toHaveResourceLike('AWS::Lambda::Function', {
            FunctionName: 'nice-func',
            Handler: 'index.my.handle',
            MemorySize: 256,
            Runtime: 'nodejs14.x',
            Tags: [
                {
                    Key: 'lab_project',
                    Value: 'nicer'
                }
            ]
        });

        expect(stack).toHaveResourceLike('Custom::LogRetention', {
            RetentionInDays: 7
        });
    });
});
