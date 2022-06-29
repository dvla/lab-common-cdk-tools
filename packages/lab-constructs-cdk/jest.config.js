module.exports = {
  displayName: 'lab-constructs-cdk',
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testEnvironment: 'node',
  collectCoverage: true,
  coveragePathIgnorePatterns: ['(test/.*.mock).(jsx?|tsx?)$', '<rootDir>/node_modules/'],
  coverageDirectory: '<rootDir>/coverage/',
};
