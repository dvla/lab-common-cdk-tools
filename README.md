# DVLA Emerging Tech Lab CDK Tools

## Projects

- [Lab Common CDK](packages/lab-common-cdk): The main cdk tools.
- [Lab Constructs](packages/lab-constructs-cdk) - Higher Level constructs similar to [CDK Patterns](https://cdkpatterns.com/).

### Quick Start
This is a monorepo that uses [NPM workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) and [Lerna](https://lerna.js.org/docs/introduction).

- When you run `npm install` in the root folder, all dependencies of all packages are installed.
- To install dependencies for a package use `npm i <the-dependency> -w <package-name>`.
- Run a script using `npm run <script> -w <package-name>`, e.g `npm run lint -w @dvla/lab-constructs-cdk`
- To run tests `npm run test` in the root folder. It will use the `test` script to run `npm run test --workspaces`, which runs the script in each workspace.

### Some useful reference CDK resources

- [Open CDK Guide](https://github.com/kevinslin/open-cdk)
- [Awesome CDK](https://github.com/kolomied/awesome-cdk)
- [CDK Patterns](https://cdkpatterns.com/)
- [CDK dependencies in L3 constructs](https://dev.to/udondan/correctly-defining-dependencies-in-l3-cdk-constructs-45p)

## Commiting to Repository
Standardised commit messages are used on this repo using commitizen with a jira NPM package. Do the following to set it up:

1. Install pre-commit hooks
```bash
brew install pre-commit
pre-commit install
```
2. To commit to repository run `npm run commit` then follow the menu in the CLI
3. To skip false positive rules `SKIP=[hook-type] npm run commit`

## License
The MIT License (MIT)

Copyright (c) 2021 DVLA

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
