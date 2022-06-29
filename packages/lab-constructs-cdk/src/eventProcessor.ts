/* eslint-disable import/no-unresolved,@typescript-eslint/no-unsafe-argument */
import { Logger } from '@aws-lambda-powertools/logger';
import moment from 'moment';
import {
    FirehoseTransformationEvent,
    FirehoseTransformationResult,
    FirehoseTransformationResultRecord,
    ScheduledEvent,
    SNSMessage
} from 'aws-lambda';

/* Extends the SNSMessage type to include select properties from an EventBridgeEvent
that are used in the glue table schema */
export interface ExtendedMessage extends SNSMessage {
    Detail: Record<string, unknown>,
    DetailType: string,
    Source: string,
}

/* The correct time format for AWS Glue */
const validTimeFormat = 'yyyy-MM-DD HH:mm:ss.SSS'

/* Add power tools */
const logger = new Logger();

/**
 * Flattens an object to a property map
 * @param {object} obj
 * @param {string} keySeparator
 * @returns {object}
 */
export const toFlatPropertyMap = (obj: object, keySeparator = '.') => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const flattenRecursive = (obj: object, parentProperty?: string, propertyMap: Record<string, unknown> = {}) => {
        for (const [key, value] of Object.entries(obj)) {
            const property = parentProperty ? `${parentProperty}${keySeparator}${key}` : key;
            if (value && typeof value === 'object') {
                flattenRecursive(value, property, propertyMap);
            } else {
                propertyMap[property] = value;
            }
        }
        return propertyMap;
    };
    return flattenRecursive(obj);
}

/**
 * Checks if the given string is valid JSON
 * @param {string} str
 * @returns {boolean}
 */
export const isValidJSON = (str: string) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * Transforms the event received by Firehose
 * @param {FirehoseTransformationEvent} event
 * @returns {Promise<FirehoseTransformationResult>} The transformed event
 */
export const handler = async (event: FirehoseTransformationEvent): Promise<FirehoseTransformationResult> => {

    try {

        const output = event.records.map((record) => {

            const payload = JSON.parse(
                Buffer.from(record.data, 'base64').toString('utf8')
            ) as ExtendedMessage;

            const timestamp = moment(payload.Timestamp).format(validTimeFormat);
            payload.Timestamp = timestamp;

            if (isValidJSON(payload.Message)) {
                const message = JSON.parse(payload.Message) as ScheduledEvent;

                if (message.source) {
                    payload.Source = message.source;
                }

                if (message['detail-type']) {
                    payload.DetailType = message['detail-type'];
                }

                if (message.detail) {
                    const msgObj = toFlatPropertyMap(message.detail as Record<string, unknown>);
                    payload.Detail = msgObj;
                    payload.Message = '';
                }
            }

            return {
                recordId: record.recordId,
                result: 'Ok',
                data: Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64'),
            } as FirehoseTransformationResultRecord;

        });

        await Promise.all(output);

        return {
            records: output,
        };

    } catch (error) {
        logger.error(JSON.stringify(error));
        throw error;
    }

};
