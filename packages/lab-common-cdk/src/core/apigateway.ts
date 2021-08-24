import { Construct } from 'constructs';
import { aws_apigateway as apigateway } from 'aws-cdk-lib';
import { MergeAware, StageAware } from './defaults';
import { getStage, mergeProperties } from '../utils';

export const RESTAPI_DEFAULTS = {
} as Partial<apigateway.RestApi>;

/**
 * Additional parameters used by the RestApi creation function.
 */
export interface RestApiParams extends StageAware, MergeAware {
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
    const stage = getStage(scope, params);
    const apiGatewayName = stage ? `${id}-${stage}` : id;

    const restApiProps: any = {
        restApiName: apiGatewayName.toLowerCase(),
    };

    const defaultProps = mergeProperties(RESTAPI_DEFAULTS, restApiProps);
    const createdRestApi = new apigateway.RestApi(scope, id, mergeProperties(defaultProps, props))

    return createdRestApi;
}