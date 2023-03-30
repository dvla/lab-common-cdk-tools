import * as lab from '../..';
import { CaseStyle } from '../../utils';

describe('Tests apply case functionality', () => {

    test('Tests Defaults', () => {
        expect(lab.utils.applyCase('bob')).toBe('bob');
        expect(lab.utils.applyCase('King-Kong')).toBe('King-Kong');
        expect(lab.utils.applyCase('DonaldDuck')).toBe('DonaldDuck');
    });

    test('Tests Kebab', () => {
        expect(lab.utils.applyCase('bob', CaseStyle.KEBAB)).toBe('bob');
        expect(lab.utils.applyCase('King-Kong', CaseStyle.KEBAB)).toBe('king-kong');
        expect(lab.utils.applyCase('King Kong', CaseStyle.KEBAB)).toBe('king-kong');
        expect(lab.utils.applyCase('_King_Kong_Again', CaseStyle.KEBAB)).toBe('king-kong-again');
        expect(lab.utils.applyCase('DonaldDuck', CaseStyle.KEBAB)).toBe('donald-duck');
    });

    test('Tests Camel', () => {
        expect(lab.utils.applyCase('bob', CaseStyle.CAMEL)).toBe('bob');
        expect(lab.utils.applyCase('King-Kong', CaseStyle.CAMEL)).toBe('kingKong');
        expect(lab.utils.applyCase('King Kong', CaseStyle.CAMEL)).toBe('kingKong');
        expect(lab.utils.applyCase('_King_Kong_Again', CaseStyle.CAMEL)).toBe('kingKongAgain');
        expect(lab.utils.applyCase('DonaldDuck', CaseStyle.CAMEL)).toBe('donaldDuck');
    });

    test('Tests Snake', () => {
        expect(lab.utils.applyCase('bob', CaseStyle.SNAKE)).toBe('bob');
        expect(lab.utils.applyCase('King-Kong', CaseStyle.SNAKE)).toBe('king_kong');
        expect(lab.utils.applyCase('King Kong', CaseStyle.SNAKE)).toBe('king_kong');
        expect(lab.utils.applyCase('_King_Kong_Again', CaseStyle.SNAKE)).toBe('king_kong_again');
        expect(lab.utils.applyCase('DonaldDuck', CaseStyle.SNAKE)).toBe('donald_duck');
    });
});
