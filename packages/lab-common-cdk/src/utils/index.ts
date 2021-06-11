import * as cdk from '@aws-cdk/core';
import * as _ from 'lodash';
import * as constants from '../constants';
import { StageAware } from '../core/defaults';

const DEFAULT_STAGE = 'dev';

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
export const getStage = (scope: cdk.IConstruct, stageAware? : StageAware): string => {
    if (stageAware && stageAware.useStage === false) {
        return '';
    }
    let stage = scope.node.tryGetContext('stage') as string;
    if (!stage) {
        stage = process.env.CDK_STAGE  || DEFAULT_STAGE;
    }
    return stage;
};

/**
 * Returns a unique name, taking account of the stage if required.
 * Concatenates the stage to the id, otherwise just returns the id.
 * @param scope - a cdk stack
 * @param id - a unique id
 * @param stageAware - should the stage be used
 */
export const getStageAwareName = (scope: cdk.IConstruct, id: string, stageAware? : StageAware): string => {
    const stage = getStage(scope, stageAware);
    return stage ? `${id}-${stage}` : id;
};

/**
 * Add default tags to a stack.
 * @param scope - a stack or construct
 */
export const tag = (scope: cdk.IConstruct) => {
    cdk.Tags.of(scope).add(
        constants.PROJECT,
        scope.node.tryGetContext('project') || 'dvla-emerging-tech',
    );
};

/**
 * Choose to concatenate an array or returns undefined.
 * @param source1
 * @param source2
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const arrayConcat : any = (source1: any, source2: any) => {
    if(Array.isArray(source1)){
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return source1.concat(source2)
    }
    return undefined;
};

/**
 * Recursively merge the properties from the 3 sources.  The latter sources will overwrite the former.
 * Array and plain object properties are merged recursively. Other objects and value types are overridden by assignment.
 * @param source1
 * @param source2
 * @param shouldConcat - by default arrays will be concatenated together, disable this by setting shouldConcat to false.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mergeProperties : any =  (source1: any, source2: any, shouldConcat = true) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    _.mergeWith({}, source1, source2, shouldConcat ? arrayConcat : undefined);
