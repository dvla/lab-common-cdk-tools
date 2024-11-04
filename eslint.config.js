const tseslint = require("typescript-eslint");
const importPlugin = require("eslint-plugin-import");
const jest = require("eslint-plugin-jest");
const eslintConfigPrettier = require("eslint-config-prettier");
const typescriptEslintParser = require("@typescript-eslint/parser");
const globals = require("globals");

module.exports = [
    ...tseslint.configs.recommendedTypeChecked,
    tseslint.configs.eslintRecommended,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    eslintConfigPrettier,
    {
        ignores: [
            "dist",
            "coverage",
            "node_modules",
            ".*.js",
            "*.d.ts",
            "*config.js",
        ],
    },
    {
        languageOptions: {
            parser: typescriptEslintParser,
            parserOptions: {
                projectService: true
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest
            },
        },
    },
    {
        files: ["**/*.ts", "**/*.js"],
        ...jest.configs["flat/recommended"],
        rules: {
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-unused-vars": "warn",
            "import/no-self-import": "error",
            "import/no-extraneous-dependencies": "warn",
            "import/no-useless-path-segments": [
                "error",
                {
                    noUselessIndex: true,
                },
            ],
            "import/prefer-default-export": "off",
            "max-len": [
                "warn",
                {
                    code: 120,
                },
            ],
            indent: ["error", 4],
            quotes: [
                "warn",
                "single",
                {
                    avoidEscape: true,
                },
            ],
            "object-curly-spacing": ["warn", "always"],
        }
    },
];