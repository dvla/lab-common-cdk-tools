import '@aws-cdk/assert/jest';
import * as cdk from '@aws-cdk/core';
import { labutil } from '../..';

describe('Tests root core functionality', () => {
    test('Tests get default stage', () => {
        // Given
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'MyTestStack');

        // Then
        expect(labutil.getStage(app)).toBe('dev');
        expect(labutil.getStage(stack)).toBe('dev');
    });

    test('Tests get default stage from process', () => {
        // Given
        const testStage = 'testStage';
        process.env.CDK_STAGE = testStage;
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'MyTestStack');

        // Then
        expect(labutil.getStage(app)).toBe(testStage);
        expect(labutil.getStage(stack)).toBe(testStage);
    });

    test('Tests get default stage with context', () => {
        // Given
        const testStage = 'testStageCtx';
        const app = new cdk.App({
            context: { stage: testStage },
        });
        const stack = new cdk.Stack(app, 'MyTestStack');

        // Then
        expect(labutil.getStage(app)).toBe(testStage);
        expect(labutil.getStage(stack)).toBe(testStage);
    });

    test('Tests stage aware', () => {
        // Given
        const app = new cdk.App();

        // Then
        expect(labutil.getStage(app, { useStage : false })).toBe('');
    });
});
