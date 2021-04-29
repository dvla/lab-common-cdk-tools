import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import * as logs from '@aws-cdk/aws-logs';
import { Logs } from 'cdk-iam-floyd';
import * as Path from 'path';
import { MergeAware, StageAware } from './defaults';
import { getStage, mergeProperties } from '../utils';

export const LAMBDA_DEFAULTS = {
    runtime: lambda.Runtime.NODEJS_12_X,
    handler: 'index.handler',
    memorySize: 128,
    timeout: cdk.Duration.seconds(60),
    tracing: lambda.Tracing.ACTIVE,
    logRetention: logs.RetentionDays.ONE_WEEK,
};

/**
 * Get the root path where the lambdas are stored.
 * @param scope
 */
const getAssetPath = (scope: cdk.IConstruct) => {
    const path = process.env.CDK_ASSET_PATH || scope.node.tryGetContext('assetPath') as string || '';
    return Path.normalize(path)
};

/**
 * Additional parameters used by the Lambda function creation utility.
 */
export interface FunctionParams extends StageAware, MergeAware {

}

/**
 * Creates a standard Lambda function, using sensible defaults where possible.
 * The optional custom FunctionProps will override the default parameters.
 * @param scope - the stack
 * @param id - a meaningful name
 * @param props - Optional custom FunctionProps to use with the lambda.
 * @param params - Optional additional parameters specific to this function.
 */
export const Function = (scope: cdk.Construct, id: string, props?:  Partial<lambda.FunctionProps>,
    params?:Partial<FunctionParams>): lambda.Function => {
    const stage = getStage(scope, params);
    const fullFunctionName = stage ? `${id}-${stage}` : id;
    const coreAssets = props?.code ?? lambda.Code.fromAsset(`${getAssetPath(scope)}/${id}`);
    const funcProps = {
        functionName: fullFunctionName,
        code: coreAssets,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    const defaultProps = mergeProperties(LAMBDA_DEFAULTS, funcProps);

    // Create a Node Lambda with conventions
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    const createdLambda = new lambda.Function(scope, fullFunctionName, mergeProperties(defaultProps, props));
    createdLambda.role?.addToPrincipalPolicy (new Logs()
        .toCreateLogGroup()
        .toCreateLogStream()
        .toPutLogEvents()
        .onLogGroup(
            `/aws/lambda/${fullFunctionName}:*`, cdk.Aws.ACCOUNT_ID, cdk.Aws.REGION, cdk.Aws.PARTITION,
        ));

    return createdLambda;
};
