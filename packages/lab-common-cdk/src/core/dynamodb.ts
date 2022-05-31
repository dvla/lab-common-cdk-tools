import { Construct } from 'constructs';
import { aws_dynamodb as dynamodb, RemovalPolicy } from 'aws-cdk-lib';
import { MergeAware, StageAware } from './defaults';
import { getStageAwareName, mergeProperties } from '../utils';

export const TABLE_DEFAULTS = {
    pointInTimeRecovery: true,
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy: RemovalPolicy.DESTROY,
    encryption: dynamodb.TableEncryption.AWS_MANAGED,
} as Partial<dynamodb.TableProps>;

/**
 * Additional parameters used by the Table creation function.
 */
export interface TableParams extends StageAware, MergeAware {
}

/**
 * Creates a standard dynamodb table, using sensible defaults where possible.
 * The optional custom TableProps will override the default parameters.
 * @param scope - the stack
 * @param id - a meaningful name
 * @param props - Optional custom values to use with the table.
 * @param params - Optional additional parameters specific to this function.
 * @constructor
 */
export const Table = (scope: Construct, id: string, props?:  Partial<dynamodb.TableProps>,
    params?:Partial<TableParams>): dynamodb.Table => {

    const tableName = getStageAwareName(scope, id, params);
    return new dynamodb.Table(scope, tableName, <dynamodb.TableProps> mergeProperties(TABLE_DEFAULTS, props));
};
