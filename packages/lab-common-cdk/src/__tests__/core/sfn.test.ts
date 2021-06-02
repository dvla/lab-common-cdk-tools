/* eslint-disable @typescript-eslint/no-unused-vars,max-classes-per-file */
import '@aws-cdk/assert/jest';
import * as cdk from '@aws-cdk/core';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import { LogGroup, RetentionDays } from '@aws-cdk/aws-logs';
import { lab, labutil } from '../..';

/**
 * Basic Test stack
 */
class TestStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        labutil.tag(this);

        const stateMachine = lab.sfn.StateMachine(this, 'test-machine', {
            definition: new sfn.Pass(this, 'StartS')
        });
    }
}

/**
 * More Advanced test stack
 */
class AdvancedTestStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        labutil.tag(this);

        const stateMachineLogGroup : LogGroup = new LogGroup(this, 'StateMachineLogGroup', {
            logGroupName: 'my/logs',
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            retention: RetentionDays.ONE_MONTH,
        });

        const stateMachine = lab.sfn.StateMachine(this, 'test-machine', {
            definition: new sfn.Pass(this, 'PassS'),
            stateMachineType: sfn.StateMachineType.EXPRESS,
            logs: {
                destination: stateMachineLogGroup
            },
            timeout: cdk.Duration.hours(1),
        }, {
            useStage: false
        });
    }
}

describe('Tests State Machine core functionality', () => {

    test('Tests default State Machine stack', () => {
        // Given
        const app = new cdk.App({
            context: { project: 'steps', stage: 'testing' },
        });

        // When
        const stack = new TestStack(app, 'MyTestStack');

        // Then
        expect(stack).toHaveResourceLike('AWS::StepFunctions::StateMachine', {
            LoggingConfiguration: {
                Level: 'ERROR'
            },
            StateMachineType: 'STANDARD',
            DefinitionString:'{"StartAt":"StartS","States":{"StartS":{"Type":"Pass","End":true}},"TimeoutSeconds":300}',
            Tags: [
                {
                    Key: 'lab_project',
                    Value: 'steps'
                }
            ]
        });
        expect(stack).toHaveResourceLike('AWS::Logs::LogGroup', {
            RetentionInDays: 7
        });
    });

    test('Tests Advanced State Machine stack', () => {
        // Given
        const app = new cdk.App({
            context: { project: 'steps', stage: 'testing' },
        });

        // When
        const stack = new AdvancedTestStack(app, 'MyTestStack');

        // Then
        expect(stack).toHaveResourceLike('AWS::StepFunctions::StateMachine', {
            LoggingConfiguration: {
                Level: 'ERROR'
            },
            StateMachineType: 'EXPRESS',
            DefinitionString: '{"StartAt":"PassS","States":{"PassS":{"Type":"Pass","End":true}},"TimeoutSeconds":3600}'
        });

        expect(stack).toHaveResourceLike('AWS::Logs::LogGroup', {
            RetentionInDays: 30,
            LogGroupName: 'my/logs',
        });
    });
});
