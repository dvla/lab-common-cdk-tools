import '@aws-cdk/assert/jest';
import { App, Stack } from 'aws-cdk-lib';
import * as lab from '../..';

describe('Tests root core functionality', () => {
    test('Tests get default project', () => {
        // Given
        const app = new App();
        const stack = new Stack(app, 'MyTestStack');

        // Then
        expect(lab.utils.getProject(app)).toBe('dvla-emerging-tech');
        expect(lab.utils.getProject(stack)).toBe('dvla-emerging-tech');
        const theProject : string = lab.utils.getProject(stack);
        expect(theProject).toBe('dvla-emerging-tech');
    });

    test('Tests get default project from process', () => {
        // Given
        const testproject = 'testproject';
        process.env.CDK_PROJECT = testproject;
        const app = new App();
        const stack = new Stack(app, 'MyTestStack');

        // Then
        expect(lab.utils.getProject(app)).toBe(testproject);
        expect(lab.utils.getProject(stack)).toBe(testproject);
    });

    test('Tests get default project with context', () => {
        // Given
        const testproject = 'testprojectCtx';
        const app = new App({
            context: { project: testproject },
        });
        const stack = new Stack(app, 'MyTestStack');

        // Then
        expect(lab.utils.getProject(app)).toBe(testproject);
        expect(lab.utils.getProject(stack)).toBe(testproject);
    });

});
