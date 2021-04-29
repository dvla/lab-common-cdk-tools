import { labconst } from '../..';

describe('Tests Policy statements', () => {
    test('Tests services', () => {
        expect(labconst.policy.COMPREHEND_ALLOW.toStatementJson()).toMatchSnapshot();
        expect(labconst.policy.REKOGNITION_ALLOW.toStatementJson()).toMatchSnapshot();
        expect(labconst.policy.TEXTRACT_ALLOW.toStatementJson()).toMatchSnapshot();
    });
});
