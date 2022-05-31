import * as _ from 'lodash';
import * as constants from '../constants';
import * as fs from 'fs';
import moment from 'moment';
import { StageAware } from '../core/defaults';
import { join } from 'path';
import { IConstruct } from 'constructs';
import { App, Stack, Tags, Duration, CfnResource } from 'aws-cdk-lib';

const DEFAULT_STAGE = 'dev';
const DEFAULT_PROJECT = 'dvla-emerging-tech';
export const EXPIRES_FORMAT = 'YYYYMMDDHHmm';
const DEFAULT_TEMPLATE_DIRECTORY = 'coverage/templates';

/**
 * Case styles to use.
 */
export enum CaseStyle {
    CAMEL = 'CAMEL',
    KEBAB = 'KEBAB',
    SNAKE = 'SNAKE',
}

/**
 * A type that is writable and partial
 */
export type PartialWritable<T> = {
    -readonly [P in keyof T]+?: T[P]
}

/**
 * Format the txt using the specified case, e.g. CaseStyle.CAMEL
 * @param txt the text to format
 * @param style the style to apply.
 */
export const applyCase = (txt: string, style?: CaseStyle): string => {
    switch (style) {
    case CaseStyle.CAMEL:
        return _.camelCase(txt);
    case CaseStyle.KEBAB:
        return _.kebabCase(txt);
    case CaseStyle.SNAKE:
        return _.snakeCase(txt);
    default:
        return txt;
    }
}
/**
 * Gets the 'stage' from the stack context or uses default.
 * Attempts to find a stage in the following order:
 *  1) A "stage" variable in the CDK context.
 *  2) An environment variable called "CDK_STAGE".
 *  3) Falls back to use a stage called 'dev'.
 *
 * @param scope - a cdk stack
 * @param stageAware - should the stage be used
 */
export const getStage = (scope: IConstruct, stageAware?: StageAware): string => {
    if (stageAware && stageAware.useStage === false) {
        return '';
    }
    let stage = scope.node.tryGetContext('stage') as string;
    if (!stage) {
        stage = process.env.CDK_STAGE || DEFAULT_STAGE;
    }
    return stage;
};

/**
 * Returns a unique name, taking account of the stage if required.
 * Concatenates the stage to the id, otherwise just returns the id.
 * @param scope - a cdk stack
 * @param id - a unique id
 * @param stageAware - should the stage be used
 * @param nameCase The case to use for the name
 */
export const getStageAwareName =
    (scope: IConstruct, id: string, stageAware?: StageAware, nameCase?: CaseStyle): string => {
        const stage = getStage(scope, stageAware);
        return applyCase(stage ? `${stage}-${id}` : id, nameCase);
    };

/**
 * Gets the name of the current project
 * @param scope - a cdk stack
 */
export const getProject = _.memoize((scope: IConstruct): string => {
    let project = scope.node.tryGetContext('project') as string;
    if (!project) {
        project = process.env.CDK_PROJECT || DEFAULT_PROJECT;
    }
    return project;
});

/**
 * Additional properties to be used when tagging.
 */
export interface TagProps {
    /**
     * Duration from now until the stack should be considered expired.
     * @Default Duration.days(100)
     */
    readonly expires: Duration;
}

/**
 * Add default tags to a stack.
 * Calculates the expiration date either using 100 days from today or the expiration duration passed in.
 * It defaults to the first Monday of the week.
 * @param scope - a stack or construct
 * @param properties - additional properties to be tagged
 */
export const tag = (scope: IConstruct, properties?: TagProps) => {
    const tags = Tags.of(scope);

    const expires = properties?.expires ?? Duration.days(100);

    let now = moment().minute(0);
    now = now.add(expires.toHours(), 'hours').day(1);
    const expiresDate = now.format(EXPIRES_FORMAT);

    tags.add(
        constants.PROJECT,
        getProject(scope),
    );
    tags.add(
        constants.EXPIRES,
        expiresDate,
    );
};

/**
 * Add metadata to the Construct node to suppress cfn_nag messages.
 * @param scope - a resource
 * @param rules - and array of suppression messages.
 */
export const nagSuppress = (scope: IConstruct, rules: object) => {
    (scope.node.defaultChild as CfnResource).addMetadata('cfn_nag', {
        rules_to_suppress: rules
    });
};

/**
 * Choose to concatenate an array or returns undefined.
 * @param source1
 * @param source2
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const arrayConcat = <T>(source1: T, source2: T) => {
    if (Array.isArray(source1)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return source1.concat(source2)
    }
    return undefined;
};

/**
 * Recursively merge the properties from the 2 sources.  The latter sources will overwrite the former.
 * Array and plain object properties are merged recursively. Other objects and value types are overridden by assignment.
 * @param source1
 * @param source2
 * @param shouldConcat - by default arrays will be concatenated together, disable this by setting shouldConcat to false.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mergeProperties = <T>(source1: T, source2: T, shouldConcat = true): T => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return _.mergeWith({}, source1, source2, shouldConcat ? arrayConcat : undefined);
}

/**
 * Copies the stack template used to a 'templates' directory.
 * @param app - the app
 * @param stack - the stack to which the templates belong to
 * @param templateDir - by default stack templates will be copied to the coverage/templates directory.
 * Can override default by passing a custom path
 */
export const copyStackTemplate = (app: App, stack: Stack, templateDir = DEFAULT_TEMPLATE_DIRECTORY) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    !fs.existsSync(templateDir) && fs.mkdirSync(templateDir, { recursive: true });
    fs.copyFileSync(join(app.outdir, stack.templateFile), join(templateDir, stack.templateFile))
};
