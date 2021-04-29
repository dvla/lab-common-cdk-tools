/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call */
import * as lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import { labutil, lab } from '../..';

describe('Tests Merging strategies', () => {

    test('Tests basics', () => {
        let result = labutil.mergeProperties(lab.lambda.LAMBDA_DEFAULTS, {});
        expect(result).toMatchObject( {
            runtime: lambda.Runtime.NODEJS_12_X,
            tracing: lambda.Tracing.ACTIVE,
            logRetention: logs.RetentionDays.ONE_WEEK,
        });
        result = labutil.mergeProperties(lab.lambda.LAMBDA_DEFAULTS, {
            runtime: lambda.Runtime.NODEJS_14_X,
            memorySize: 256,
            functionName: 'testFunc',
            tracing: lambda.Tracing.DISABLED,
        });
        expect(result).toMatchObject( {
            runtime: lambda.Runtime.NODEJS_14_X,
            memorySize: 256,
            functionName: 'testFunc',
            tracing: lambda.Tracing.DISABLED,
            logRetention: logs.RetentionDays.ONE_WEEK,
        });
    });

    test('Tests adding nested nodes', () => {
        let result = labutil.mergeProperties(lab.lambda.LAMBDA_DEFAULTS, {
            logRetentionRetryOptions : { maxRetries : 3 }
        });
        expect(result).toMatchObject( {
            runtime: lambda.Runtime.NODEJS_12_X,
            logRetentionRetryOptions : { maxRetries : 3 }
        });
        // Pass in the result of the previous merge, so its now a 3 way merge.
        result = labutil.mergeProperties(result, {
            logRetentionRetryOptions : { maxRetries : 5 }
        });
        expect(result).toMatchObject( {
            runtime: lambda.Runtime.NODEJS_12_X,
            logRetentionRetryOptions : { maxRetries : 5 }
        });
    });

    test('Merge arrays', () => {
        let result = labutil.mergeProperties({ a: true, values: [10, 20] }, { b: true, values: [15, 35] });
        expect(result).toMatchObject({ a: true, b: true, values: [10, 20, 15, 35] });

        result = labutil.mergeProperties({ a: true, values: [10, 20] }, { b: true, values: [15, 35] }, false);
        expect(result).toMatchObject({ a: true, b: true, values: [15, 35] });
    });
});
