import { aws_iam as iam } from 'aws-cdk-lib';

const etlTexttractPolicy = new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    resources: ['*'],
    actions: ['textract:*'],
});

export const TEXTRACT_ALLOW : iam.PolicyStatement = etlTexttractPolicy;

const etlComprehendPolicy = new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    resources: ['*'],
    actions: ['comprehend:*'],
});

export const COMPREHEND_ALLOW: iam.PolicyStatement = etlComprehendPolicy;

const etlRekognitionPolicy = new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    resources: ['*'],
    actions: ['rekognition:*'],
});

export const REKOGNITION_ALLOW: iam.PolicyStatement = etlRekognitionPolicy;

const etlSecretsmanagerPolicy = new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    resources: ['*'],
    actions: ['secretsmanager:GetSecretValue', 'secretsmanager:ListSecrets'],
});

export const SECRETSMANAGER_READ: iam.PolicyStatement = etlSecretsmanagerPolicy;
