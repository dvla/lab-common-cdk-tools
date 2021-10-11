import { Construct } from 'constructs';
import { aws_apigateway as apigateway } from 'aws-cdk-lib';
import { MergeAware, StageAware } from './defaults';
import { getStageAwareName, mergeProperties, getStage } from '../utils';

export const RESTAPI_DEFAULTS = {
    deployOptions: {
        tracingEnabled: true,
        metricsEnabled: true,
    }
} as Partial<apigateway.RestApi>;

/**
 * Additional parameters used by the RestApi creation function.
 */
export interface RestApiParams extends StageAware, MergeAware {
    /**
     * Should Cors be enabled.
     * @Default false
     */
    readonly enableCors: boolean;
}

/**
 * Create a standard API Gateway. using sensible defaults where possible.
 * The optional custom BucketProps will override the default parameters.
 * @param scope - the stack
 * @param id - a meaningful name
 * @param props - Optional custom v to use with the bucket.
 * @param params - Optional additional parameters specific to this function.
 * @constructor
 */
export const RestApi = (
    scope: Construct,
    id: string,
    props?:  Partial<apigateway.RestApiProps>,
    params?:Partial<RestApiParams>): apigateway.RestApi =>
{
    const enableCors = params?.enableCors ?? false;
    const apiGatewayName = getStageAwareName(scope, id, params);
    const restApiProps: any = {
        restApiName: apiGatewayName.toLowerCase(),
    };

    if (!params || params.useStage) {
        restApiProps.deployOptions = {
            stageName: getStage(scope)
        };
    }

    if (enableCors) {
        restApiProps.defaultCorsPreflightOptions = {
            allowOrigins: apigateway.Cors.ALL_ORIGINS,
            allowMethods: apigateway.Cors.ALL_METHODS // this is also the default
        }
    }

    const defaultProps = mergeProperties(RESTAPI_DEFAULTS, restApiProps);
    const createdRestApi = new apigateway.RestApi(scope, id, mergeProperties(defaultProps, props))
    return createdRestApi;
}
