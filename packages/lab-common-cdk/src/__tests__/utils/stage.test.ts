import '@aws-cdk/assert/jest';
import * as cdk from '@aws-cdk/core';
import * as lab from '../..';

describe('Tests root core functionality', () => {
    test('Tests get default stage', () => {
        // Given
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'MyTestStack');

        // Then
        expect(lab.utils.getStage(app)).toBe('dev');
        expect(lab.utils.getStage(stack)).toBe('dev');
    });

    test('Tests get default stage from process', () => {
        // Given
        const testStage = 'testStage';
        process.env.CDK_STAGE = testStage;
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'MyTestStack');

        // Then
        expect(lab.utils.getStage(app)).toBe(testStage);
        expect(lab.utils.getStage(stack)).toBe(testStage);
    });

    test('Tests get default stage with context', () => {
        // Given
        const testStage = 'testStageCtx';
        const app = new cdk.App({
            context: { stage: testStage },
        });
        const stack = new cdk.Stack(app, 'MyTestStack');

        // Then
        expect(lab.utils.getStage(app)).toBe(testStage);
        expect(lab.utils.getStage(stack)).toBe(testStage);
    });

    test('Tests stage aware', () => {
        // Given
        const app = new cdk.App();

        // Then
        expect(lab.utils.getStage(app, { useStage : false })).toBe('');
    });
});
