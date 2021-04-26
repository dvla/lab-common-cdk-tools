import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as logs from '@aws-cdk/aws-logs';

const LAMBDA_DEFAULTS = {
    runtime: lambda.Runtime.NODEJS_12_X,
    memorySize: 512,
    timeout: cdk.Duration.seconds(10),
    tracing: lambda.Tracing.ACTIVE,
    logRetention: logs.RetentionDays.ONE_WEEK,
};