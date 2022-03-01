/* eslint-disable @typescript-eslint/no-unused-vars,max-classes-per-file */
import '@aws-cdk/assert/jest';
import {
    App, Stack, StackProps,
    aws_dynamodb as dynamodb,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lab from '../..';

/**
 * Basic Test stack
 */
class TestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        const table = lab.dynamodb.Table(this, 'test-ing', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'sk', type: dynamodb.AttributeType.NUMBER },
        });
    }
}

class AdvancedStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);

        const table = lab.dynamodb.Table(this, 'test-ing-more', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PROVISIONED
        });
    }
}
describe('Tests Basic dynamo table creation functionality', () => {

    test('Tests default stack', () => {
        // Given
        const app = new App({
            context: { project: 'testdb', stage: 'testing' },
        });

        // When
        const stack = new TestStack(app, 'MyTestDynamoStack');

        // Then
        expect(stack).toHaveResourceLike('AWS::DynamoDB::Table', {
            BillingMode: 'PAY_PER_REQUEST',
            PointInTimeRecoverySpecification: {
                PointInTimeRecoveryEnabled : true
            }
        });

        lab.utils.copyStackTemplate(app, stack);
    });

    test('Tests Advanced stack', () => {
        // Given
        const app = new App({
            context: { project: 'testdb', stage: 'testing' },
        });

        // When
        const stack = new AdvancedStack(app, 'MyTestAdvancedDynamoStack');

        // Then
        expect(stack).toHaveResourceLike('AWS::DynamoDB::Table', {
            ProvisionedThroughput: {
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        });

        lab.utils.copyStackTemplate(app, stack);
    });
});
