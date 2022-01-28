import * as fs from 'fs';
import { join } from 'path';
import { App, Stack } from 'aws-cdk-lib';

const templateDir = 'coverage/templates';

/**
 * Copies the stack template used to a 'templates' directory.
 */
export const copyStackTemplate = (app: App, stack: Stack) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    !fs.existsSync(templateDir) && fs.mkdirSync(templateDir, { recursive: true });
    fs.copyFileSync(join(app.outdir, stack.templateFile), join(templateDir, stack.templateFile))
};
