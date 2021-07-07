import { Construct } from 'constructs';
import {
    Duration,
    RemovalPolicy,
    aws_logs as logs,
    aws_stepfunctions as sfn
} from 'aws-cdk-lib';
import { MergeAware, StageAware } from './defaults';
import { getStageAwareName, mergeProperties } from '../utils';

export const STATE_MACHINE_DEFAULTS = {
    logs: {
        level: sfn.LogLevel.ERROR,
    },
    stateMachineType: sfn.StateMachineType.STANDARD,
    timeout: Duration.minutes(5),
} as Partial<sfn.StateMachineProps>;

/**
 * Additional parameters used by the StateMachine creation function.
 */
export interface StateMachineParams extends StageAware, MergeAware {
}

/**
 * Creates a standard State Machine, using sensible defaults where possible.
 * The optional custom FunctionProps will override the default parameters.
 * @param scope - the stack
 * @param id - a meaningful name
 * @param props - Optional custom FunctionProps to use with the StateMachine.
 * @param params - Optional additional parameters specific to this StateMachine.
 * @constructor
 */
export const StateMachine = (scope: Construct, id: string, props?:  Partial<sfn.StateMachineProps>,
    params?:Partial<StateMachineParams>): sfn.StateMachine => {

    const stateMachineName = getStageAwareName(scope, id, params);
    const machineProps: any = {
        stateMachineName
    };

    // Setup default log group if its not been specified already
    if (!props?.logs?.destination) {
        machineProps.logs = mergeProperties(STATE_MACHINE_DEFAULTS.logs, {
            destination : new logs.LogGroup(scope, `${stateMachineName}LogGroup`, {
                removalPolicy: RemovalPolicy.DESTROY,
                retention: logs.RetentionDays.ONE_WEEK,
            })
        })
    }

    const defaultProps = mergeProperties(STATE_MACHINE_DEFAULTS, machineProps);
    const createdStateMachine = new sfn.StateMachine(scope, id, mergeProperties(defaultProps, props));
    return createdStateMachine;
};
