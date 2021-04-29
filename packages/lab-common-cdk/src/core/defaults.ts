/**
 * A general type for stage aware functionality.
 */
export interface StageAware {
    /**
     * Should the stage be used.
     */
    readonly useStage?: boolean;
}

/**
 * Understands property merging
 */
export interface MergeAware {
    /**
     * Should property arrays be concatenated together?
     * @Default true
     */
    readonly concatArrays?: boolean;
}
