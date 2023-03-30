import { App, Stack } from 'aws-cdk-lib';
import * as lab from '../..';
import { CaseStyle } from '../../utils';

describe('Tests root core functionality', () => {
    test('Tests get default stage', () => {
        // Given
        const app = new App();
        const stack = new Stack(app, 'MyTestStack');

        // Then
        expect(lab.utils.getStage(app)).toBe('dev');
        expect(lab.utils.getStage(stack)).toBe('dev');
    });

    test('Tests get default stage from process', () => {
        // Given
        const testStage = 'testStage';
        process.env.CDK_STAGE = testStage;
        const app = new App();
        const stack = new Stack(app, 'MyTestStack');

        // Then
        expect(lab.utils.getStage(app)).toBe(testStage);
        expect(lab.utils.getStage(stack)).toBe(testStage);
    });

    test('Tests get default stage with context', () => {
        // Given
        const testStage = 'testStageCtx';
        const app = new App({
            context: { stage: testStage },
        });
        const stack = new Stack(app, 'MyTestStack');

        // Then
        expect(lab.utils.getStage(app)).toBe(testStage);
        expect(lab.utils.getStage(stack)).toBe(testStage);
    });

    test('Tests stage aware', () => {
        // Given
        const app = new App();

        // Then
        expect(lab.utils.getStage(app, { useStage : false })).toBe('');
    });

    test('Tests stage aware name', () => {
        // Given
        const app = new App();
        const bStr = 'myName is BOB';

        // Then
        expect(lab.utils.getStageAwareName(app, bStr, { useStage : false })).toBe(bStr);
        expect(lab.utils.getStageAwareName(app, bStr)).toBe('testStage-myName is BOB');
        expect(lab.utils.getStageAwareName(app, bStr,
            { useStage : false }, CaseStyle.KEBAB)).toBe('my-name-is-bob');
        expect(lab.utils.getStageAwareName(app, bStr,
            { useStage : true }, CaseStyle.KEBAB)).toBe('test-stage-my-name-is-bob');
        expect(lab.utils.getStageAwareName(app, bStr,
            { useStage : false }, CaseStyle.CAMEL)).toBe('myNameIsBob');
        expect(lab.utils.getStageAwareName(app, bStr,
            { useStage : true }, CaseStyle.CAMEL)).toBe('testStageMyNameIsBob');
        expect(lab.utils.getStageAwareName(app, bStr,
            { useStage : false }, CaseStyle.SNAKE)).toBe('my_name_is_bob');
        expect(lab.utils.getStageAwareName(app, bStr,
            { useStage : true }, CaseStyle.SNAKE)).toBe('test_stage_my_name_is_bob');
    });
});
