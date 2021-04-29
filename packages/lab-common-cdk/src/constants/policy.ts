import { Textract, Comprehend, Rekognition } from 'cdk-iam-floyd';
import { PolicyStatement } from '@aws-cdk/aws-iam';

export const TEXTRACT_ALLOW : PolicyStatement = new Textract()
    .allow()
    .onAllResources()
    .allActions();

export const COMPREHEND_ALLOW: PolicyStatement = new Comprehend()
    .allow()
    .onAllResources()
    .allActions();

export const REKOGNITION_ALLOW: PolicyStatement = new Rekognition()
    .allow()
    .onAllResources()
    .allActions();
