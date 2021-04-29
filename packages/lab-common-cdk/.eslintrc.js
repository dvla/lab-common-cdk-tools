module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module',
        tsconfigRootDir: __dirname,
    },
    plugins: ['@typescript-eslint', 'jest'],
    extends: [
        "airbnb-typescript/base",
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/typescript',
        'plugin:jest/recommended',
        'prettier'
    ],
    env: {
        node: true,
        browser: false,
        jest: true,
    },
    ignorePatterns: ['dist', 'coverage', 'node_modules', '.*.js', '*.d.ts', '*config.js'],
    rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-use-before-define': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        'import/no-extraneous-dependencies': ['error'],
        'import/no-self-import': 'error',
        'import/no-useless-path-segments': ['error', { noUselessIndex: true }],
        'import/prefer-default-export': 'off',
        'max-len': ["warn", { "code": 120 }],
        'indent': ["error", 4],
        "quotes": ["warn", "single", { "avoidEscape": true }],
        "object-curly-spacing": ["warn", "always"]
    },
};
