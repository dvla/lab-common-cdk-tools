import { ServicePrincipal } from '@aws-cdk/aws-iam';

export const TEXTRACT = new ServicePrincipal('textract.amazonaws.com');
export const SNS = new ServicePrincipal('sns.amazonaws.com');
