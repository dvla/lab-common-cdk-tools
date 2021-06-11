import * as lab from '../..';

describe('Tests Policy statements', () => {
    test('Tests services', () => {
        expect(lab.constants.policy.COMPREHEND_ALLOW.toStatementJson()).toMatchSnapshot();
        expect(lab.constants.policy.REKOGNITION_ALLOW.toStatementJson()).toMatchSnapshot();
        expect(lab.constants.policy.TEXTRACT_ALLOW.toStatementJson()).toMatchSnapshot();
    });
});
