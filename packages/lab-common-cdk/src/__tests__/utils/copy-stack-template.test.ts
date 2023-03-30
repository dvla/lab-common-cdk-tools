import { Template } from 'aws-cdk-lib/assertions';
import * as lab from '../..';
import * as fs from 'fs';
import { Construct } from 'constructs';
import { App, Stack, StackProps } from 'aws-cdk-lib';

/**
 * Basic Test Stack with an S3 Bucket
 */
class TestStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        lab.utils.tag(this);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const buck = lab.s3.Bucket(this, 'myBUCK');
    }
}

describe('Tests stack template copying functionality', () => {
    test('Tests copying stack template using default directory', () => {
        // Given
        const app = new App();
        const stack = new TestStack(app, 'MyCopyTemplateStack');
        const template = Template.fromStack(stack);

        // Then
        template.resourceCountIs('AWS::S3::Bucket', 1);
        lab.utils.copyStackTemplate(app, stack)
        expect(fs.existsSync(`coverage/templates/${stack.templateFile}`)).toBe(true)
    });

    test('Tests copying stack template using custom templateDir path within the coverage directory', () => {
        // Given
        const app = new App();
        const stack = new TestStack(app, 'MyCustomCopyTemplateStack');
        const template = Template.fromStack(stack);
        const customTempDir = 'coverage/custom_temp_dir'

        // Then
        template.resourceCountIs('AWS::S3::Bucket', 1);
        lab.utils.copyStackTemplate(app, stack, customTempDir)
        expect(fs.existsSync(`${customTempDir}/${stack.templateFile}`)).toBe(true)
    });

    test('Tests copying stack template using custom templateDir path with a complex path', () => {
        // Given
        const app = new App();
        const stack = new TestStack(app, 'MyCustomComplexCopyTemplateStack');
        const template = Template.fromStack(stack);
        const customTempDir = 'coverage/dir1/dir2/custom_temp_dir'

        // Then
        template.resourceCountIs('AWS::S3::Bucket', 1);
        lab.utils.copyStackTemplate(app, stack, customTempDir)
        expect(fs.existsSync(`${customTempDir}/${stack.templateFile}`)).toBe(true)
    });
});
