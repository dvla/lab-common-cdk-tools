import { IConstruct } from 'constructs';
import { Tags, Duration, CfnResource } from 'aws-cdk-lib';
import moment from 'moment';

import * as _ from 'lodash';
import * as constants from '../constants';
import { StageAware } from '../core/defaults';

const DEFAULT_STAGE = 'dev';
export const EXPIRES_FORMAT = 'YYYYMMDDHHmm';

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
export const getStage = (scope: IConstruct, stageAware? : StageAware): string => {
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
export const getStageAwareName = (scope: IConstruct, id: string, stageAware? : StageAware): string => {
    const stage = getStage(scope, stageAware);
    return stage ? `${stage}-${id}` : id;
};

/**
 * Additional properties to be used when tagging.
 */
export interface TagProps {
    /**
     * Duration from now until the stack should be considered expired.
     * @Default Duration.days(100)
     */
    readonly expires : Duration;
};

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
        scope.node.tryGetContext('project') || 'dvla-emerging-tech',
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
export const nagSuppress = (scope: IConstruct, rules: any) => {
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
const arrayConcat : any = (source1: any, source2: any) => {
    if(Array.isArray(source1)){
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
export const mergeProperties : any =  (source1: any, source2: any, shouldConcat = true) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    _.mergeWith({}, source1, source2, shouldConcat ? arrayConcat : undefined);
