/* eslint-disable @typescript-eslint/no-unused-vars,max-classes-per-file */
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Construct } from 'constructs';
import { App, aws_lambda as lambda, aws_logs as logs, Duration, Stack, StackProps } from 'aws-cdk-lib';
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
            entry: './src/__tests__/fixtures/test-func/basic.ts',
            handler: 'my.handle',
            memorySize: 256,
        }, { useStage : false });
    }
}

class CustomBundledTestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        const lamb = lab.lambda.NodejsFunction(this, 'test-func', {
            functionName: 'nice-func',
            entry: './src/__tests__/fixtures/test-func/basic.ts',
            handler: 'my.handle',
            timeout: Duration.seconds(30),
            environment: {},
            tracing: lambda.Tracing.ACTIVE,
            bundling: {
                minify: false,
                sourceMap: false,
                externalModules: [ 'nothing-to-see-here' ]
            },
            logRetention: logs.RetentionDays.ONE_WEEK,
        }, {
            concatArrays : false
        });
    }
}

describe('Tests NodeJs lambda core functionality', () => {

    test('Tests basic lambda stack', () => {

        // Given
        const app = new App({
            context: { stage: 'basicstack', assetPath: './src/__tests__/fixtures' },
        });

        // When
        const stack = new TestStack(app, 'MyTestNodeJSStack');
        const template = Template.fromStack(stack);

        // Then
        expect(lab.utils.getStage(app)).toBe('basicstack');
        template.hasResourceProperties('AWS::Lambda::Function', {
            Handler: 'index.handler',
            MemorySize: 128,
            Runtime: 'nodejs14.x',
            Tags: Match.arrayWith([
                {
                    Key: 'lab_project',
                    Value: 'dvla-emerging-tech'
                }
            ])
        }
        );
    });

    test('Tests advanced lambda stack', () => {

        // Given
        const app = new App({
            context: { stage: 'betterstack', project: 'nicer' },
        });

        // When
        const stack = new AdvancedTestStack(app, 'MyAdvancedTestNodeJSStack');
        const template = Template.fromStack(stack);

        // Then
        template.hasResourceProperties('AWS::Lambda::Function', {
            FunctionName: 'nice-func',
            Handler: 'my.handle',
            MemorySize: 256,
            Runtime: 'nodejs14.x',
            Timeout: 30,
            Architectures: [
                'arm64'
            ],
            Tags: Match.arrayWith([
                {
                    Key: 'lab_project',
                    Value: 'nicer'
                }
            ])
        });

        template.hasResourceProperties('Custom::LogRetention', {
            RetentionInDays: 7
        });

        lab.utils.copyStackTemplate(app, stack);
    });

    test('Tests custom bundled lambda stack', () => {

        // Given
        const app = new App({
            context: { stage: 'bundlestack', assetPath: './src/__tests__/fixtures' },
        });

        // When
        const stack = new CustomBundledTestStack(app, 'MyBundledTestNodeJSStack');
        const template = Template.fromStack(stack);

        // Then
        template.hasResourceProperties('AWS::Lambda::Function', {
            Handler: 'my.handle',
            MemorySize: 128,
            Runtime: 'nodejs14.x',
            Tags: Match.arrayWith([
                {
                    Key: 'lab_project',
                    Value: 'dvla-emerging-tech'
                }
            ])
        }
        );
        lab.utils.copyStackTemplate(app, stack);
    });
});
