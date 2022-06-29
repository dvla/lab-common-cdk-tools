/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { isValidJSON, toFlatPropertyMap, handler, ExtendedMessage } from '../eventProcessor'
import awsProxyEvent from './__fixtures__/aws-proxy.json'
import snsEvent from './__fixtures__/notification.json'
import scheduledEvent from './__fixtures__/scheduled-event.json'
import transformEvent from './__fixtures__/tranformationEvent.json'
import badTransformEvent from './__fixtures__/badTranformationEvent.json'
import awsProxyResult from './__results__/aws-proxy.json'
import snsResult from './__results__/notification.json'
import scheduledResult from './__results__/scheduled-event.json'

describe('Tests for the Event Processor', () => {

    test('Should return true if the json is valid', () => {
        // GIVEN
        const jsonExamples = [
            '{}',
            '{"a":"b"}',
            '{"a":1}',
            '{"a":{"b":1}}',
            '{"a":[1,2]}',
            '{"a":[{"b":1}]}',
            '{"a":[{"b":1},{"c":{}}]}',
        ];

        // WHEN
        const result = jsonExamples.map(json => isValidJSON(json));
        // THEN
        expect(result).toEqual([true, true, true, true, true, true, true]);
    });

    test('Should return false if the json is invalid', () => {
        // GIVEN
        const notJsonExamples = [
            '{a:"b"}',
            'hello',
            '{a:1}',
            '{a:1,b:2}',
            '{a=1}',
            '{1}',
        ];
        // WHEN
        const result = notJsonExamples.map(notJson => isValidJSON(notJson));

        expect(result).toEqual([false, false, false, false, false, false]);
    });

    test('Should flatten the nested object to a property map', () => {
        // GIVEN
        const jsonExamples = [
            { 'a': { 'b': 1 }, 'c': [1, 2] },
            { 'a': [{ 'b': 1 }, { 'c': { 'd': 1 } }] },
        ]
        // WHEN
        const result = jsonExamples.map(json => toFlatPropertyMap(json));
        // THEN
        expect(result).toEqual([
            { 'a.b': 1, 'c.0': 1, 'c.1': 2 },
            { 'a.0.b': 1, 'a.1.c.d': 1 }
        ]);
    })

    test('Should flatten an AWS Proxy event', () => {
        // GIVEN & WHEN
        const result = toFlatPropertyMap(awsProxyEvent);

        // THEN
        expect(result).toEqual(awsProxyResult);
    });

    test('Should flatten a SNS Notification event', () => {
        // GIVEN & WHEN
        const result = toFlatPropertyMap(snsEvent);

        // THEN
        expect(result).toEqual(snsResult);

    });

    test('Should flatten a Scheduled Event', () => {
        // GIVEN & WHEN
        const result = toFlatPropertyMap(scheduledEvent);

        // THEN
        expect(result).toEqual(scheduledResult);

    });

});

describe('Test calling the handler', () => {

    test('Should handle Event', async () => {
        // GIVEN & WHEN
        const result = await handler(transformEvent);

        // THEN
        expect(result.records).toBeDefined()
        expect(result.records[0].recordId).toBeDefined()
        expect(result.records[0].result).toBe('Ok')
        expect(result.records[0].data).toBeDefined()

        const data = JSON.parse(
            Buffer.from(result.records[0].data, 'base64').toString('utf8')
        ) as ExtendedMessage;
        expect(data.Type).toEqual('Notification');
        expect(data.Subject).toEqual('example subject');
        expect(data.Signature).toEqual('EXAMPLE');
        expect(data.Detail).toEqual({
            'ScheduledEventId': 1,
            'Time': '1970-01-01T00:00:00Z',
            'RuleName': 'ExampleRule',
            'RuleArn': 'arn:aws:events:us-east-1:123456789012:rule/ExampleRule',
            'State': 'ENABLED',
            'Description': 'This is an example rule.',
            'ScheduleExpression': 'rate(5 minutes)',
            'Targets.0.Id': 'ExampleTargetId',
            'Targets.0.Arn': 'arn:aws:lambda:us-east-1:123456789012:function:ExampleFunction',
            'Targets.0.Input': '',
            'Targets.0.InputPath': '$',
            'Targets.0.InputTransformer.InputPathsMap.$': '/',
            'Targets.0.InputTransformer.InputTemplate': '<![CDATA[{"key1": {"key2": "value"}}]]>'
        })
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    test('Should handle invalid Event', async () => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises,jest/valid-expect
        expect(handler(badTransformEvent)).rejects.toThrow()
    });

});
