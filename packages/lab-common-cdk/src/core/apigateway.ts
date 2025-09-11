import { Construct } from 'constructs';
import { aws_apigateway as apigateway, aws_logs as logs, RemovalPolicy } from 'aws-cdk-lib';
import { MergeAware, StageAware } from './defaults';
import { getStage, getStageAwareName, mergeProperties, PartialWritable } from '../utils';

export const RESTAPI_DEFAULTS = {
    deployOptions: {
        tracingEnabled: true,
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
    }
} as Partial<apigateway.RestApiProps>;

/**
 * Additional parameters used by the RestApi creation function.
 */
export interface RestApiParams extends StageAware, MergeAware {
    /**
     * Should Cors be enabled.
     * Default: false
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
    const restApiProps: PartialWritable<apigateway.RestApiProps> = {
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
    let effectiveDefaultProps = defaultProps;

    if (!props?.deployOptions?.accessLogDestination) {
        const logDestination = new logs.LogGroup(scope, `${id}AccessLogGroup`, {
            removalPolicy: RemovalPolicy.DESTROY,
            retention: logs.RetentionDays.ONE_WEEK,
        });

        const mergedDeployOptions = mergeProperties(defaultProps.deployOptions, {
            accessLogDestination: new apigateway.LogGroupLogDestination(logDestination),
            accessLogFormat: apigateway.AccessLogFormat.custom(JSON.stringify({
                stage: '$context.stage',
                request_id: '$context.requestId',
                api_id: '$context.apiId',
                resource_path: '$context.resourcePath',
                resource_id: '$context.resourceId',
                http_method: '$context.httpMethod',
                source_ip: '$context.identity.sourceIp',
                user_agent: '$context.identity.userAgent',
                account_id: '$context.identity.accountId',
                api_key: '$context.identity.apiKey',
                caller: '$context.identity.caller',
                user: '$context.identity.user',
                user_arn: '$context.identity.userArn',
                integration_latency: '$context.integration.latency'
            }))
        });

        effectiveDefaultProps = {
            ...defaultProps,
            deployOptions: mergedDeployOptions,
        };
    }
    return new apigateway.RestApi(scope, id, mergeProperties(effectiveDefaultProps, props));
}
