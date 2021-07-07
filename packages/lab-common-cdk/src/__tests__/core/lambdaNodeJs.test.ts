/* eslint-disable @typescript-eslint/no-unused-vars,max-classes-per-file */
import '@aws-cdk/assert/jest';
import { Construct } from 'constructs';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as lab from '../..';

/**
 * Basic Test stack
 */
class TestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        const lamb = lab.lambda.NodejsFunction(this, 'simple-func');
    }
}

/**
 * More Adanced test stack
 */
class AdvancedTestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

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
        const app = new App({
            context: { stage: 'basicstack', assetPath: './src/__tests__/fixtures' },
        });

        // When
        const stack = new TestStack(app, 'MyTestStack');

        // Then
        expect(lab.utils.getStage(app)).toBe('basicstack');
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
        const app = new App({
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
