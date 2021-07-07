import { aws_iam as iam } from 'aws-cdk-lib';

export const TEXTRACT = new iam.ServicePrincipal('textract.amazonaws.com');
export const SNS = new iam.ServicePrincipal('sns.amazonaws.com');
