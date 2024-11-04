const baseConfig = require('../../eslint.config.js');

module.exports = [
    ...baseConfig,
    {
        ignores: [
            "**/__tests__/"
        ]
    },
    {
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.eslint.json",
                tsconfigRootDir: __dirname
            }
        }
    }
];