# DVLA Emerging Tech Lab Common CDK

## Getting Started

This module provides:

* lab - Core functions to create CDK constructs with sensible defaults following best practice.
* labconst - Constants for use with the CDK, e.g. policy statements or services.
* labutil - Utility functions, e.g `getStage`, `tag`.

### Quick Start

1. Install the module `npm install @dvla/lab-common-cdk`
2. In your CDK stack definition `import * as lab from '@dvla/lab-common-cdk';`
3. Start with a standard construct, e.g. `new s3.Bucket`
4. Remove the `new` and add the lab prefix. , e.g. `lab.s3.Bucket`

You should now be able to use the function.

### Implementation
Functions are implemented to match the style of the default contructs, i.e.
`(scope, id, props)`.  The 3rd parameter `props` will match the `props` parameter of the construct.
You can specify values in `props` specific to your project that will override the defaults.
e.g. to change the lambda handler and memory settings you could specify:
```
{
    handler: 'index.specialFunc',
    memorySize: 512,
}
```

For each function, there may be a 4th parameter to configure additional features which are specific to that
construct, e.g. to enable cors.
```
{ enableCors : true }
```

#### Available Utilities

| Function | Description |
| --- | --- |
| `getStage` | Gets the 'stage' from the stack context or uses default. |
| `getStageAwareName` | Returns a unique name, taking account of the stage if required. |
| `tag` | Add default tags to a stack. |

#### Available Constructs

| Function | Returns
| --- | --- |
| `lab.s3.Bucket(scope, id, props, params)`| `s3.Bucket` |
| `lab.lambda.Function(scope, id, props, params)`| `lambda.Function` |
| `lab.lambda.NodejsFunction(scope, id, props, params)`| `nodejs.NodejsFunction` |
| `lab.sfn.StateMachine(scope, id, props, params)`| `sfn.StateMachine` |
| `lab.apigateway.RestApi(scope, id, props, params)`| `apigateway.RestApi` |
| `lab.sqs.Queue(scope, id, props, params)`| `sqs.Queue` |
| `lab.sqs.FifoQueue(scope, id, props, params)`| `sqs.Queue` |
