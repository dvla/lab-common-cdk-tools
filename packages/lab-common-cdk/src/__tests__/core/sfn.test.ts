/* eslint-disable @typescript-eslint/no-unused-vars,max-classes-per-file */
import { Template, Match } from 'aws-cdk-lib/assertions';
import { Construct } from 'constructs';
import {
    aws_stepfunctions as sfn,
    aws_logs as logs,
    App,
    Stack,
    StackProps,
    Duration,
    RemovalPolicy
} from 'aws-cdk-lib';
import * as lab from '../..';

/**
 * Basic Test stack
 */
class TestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        const stateMachine = lab.sfn.StateMachine(this, 'test-machine', {
            definition: new sfn.Pass(this, 'StartS')
        });
    }
}

/**
 * More Advanced test stack
 */
class AdvancedTestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        const stateMachineLogGroup : logs.LogGroup = new logs.LogGroup(this, 'StateMachineLogGroup', {
            logGroupName: 'my/logs',
            removalPolicy: RemovalPolicy.RETAIN,
            retention: logs.RetentionDays.ONE_MONTH,
        });

        const stateMachine = lab.sfn.StateMachine(this, 'test-machine', {
            definition: new sfn.Pass(this, 'PassS'),
            stateMachineType: sfn.StateMachineType.EXPRESS,
            logs: {
                destination: stateMachineLogGroup
            },
            timeout: Duration.hours(1),
        }, {
            useStage: false
        });
    }
}

describe('Tests State Machine core functionality', () => {

    test('Tests default State Machine stack', () => {
        // Given
        const app = new App({
            context: { project: 'steps', stage: 'testing' },
        });

        // When
        const stack = new TestStack(app, 'MyTestSfnStack');
        const template = Template.fromStack(stack);

        // Then
        template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
            LoggingConfiguration: {
                Level: 'ERROR'
            },
            StateMachineType: 'STANDARD',
            DefinitionString:'{"StartAt":"StartS","States":{"StartS":{"Type":"Pass","End":true}},"TimeoutSeconds":300}',
            Tags: Match.arrayWith([
                {
                    Key: 'lab_project',
                    Value: 'steps'
                }
            ])
        });
        template.hasResourceProperties('AWS::Logs::LogGroup', {
            RetentionInDays: 7
        });

        lab.utils.copyStackTemplate(app, stack);
    });

    test('Tests Advanced State Machine stack', () => {
        // Given
        const app = new App({
            context: { project: 'steps', stage: 'testing' },
        });

        // When
        const stack = new AdvancedTestStack(app, 'MyTestAdvancedSfnStack');
        const template = Template.fromStack(stack);

        // Then
        template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
            LoggingConfiguration: {
                Level: 'ERROR'
            },
            StateMachineType: 'EXPRESS',
            DefinitionString: '{"StartAt":"PassS","States":{"PassS":{"Type":"Pass","End":true}},"TimeoutSeconds":3600}'
        });

        template.hasResourceProperties('AWS::Logs::LogGroup', {
            RetentionInDays: 30,
            LogGroupName: 'my/logs',
        });

        lab.utils.copyStackTemplate(app, stack);
    });
});
