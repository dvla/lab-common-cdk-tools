/* eslint-disable @typescript-eslint/no-unused-vars,max-classes-per-file */
import '@aws-cdk/assert/jest';
import { Construct } from 'constructs';
import {
    App,
    Stack,
    StackProps
} from 'aws-cdk-lib';
import * as lab from '../..';

/**
 * Basic Test stack
 */
class TestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        const restapi = lab.apigateway.RestApi(this,'test-restapi');

        // Add a /test resource
        const test = restapi.root.addResource('test');

        test.addMethod('GET');
    }
}

describe('Tests API Gateway RestAPI core functionality', () => {

    test('Tests default RestAPI stack', () => {
        // Given
        const app = new App({
            context: { project: 'restapi', stage: 'testing' },
        });

        // When
        const stack = new TestStack(app, 'MyTestStack');

        // Then
        expect(stack).toHaveResourceLike('AWS::ApiGateway::RestApi', {
            Name: 'testing-test-restapi',
        });
    });
});
