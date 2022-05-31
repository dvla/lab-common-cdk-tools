// eslint-disable-next-line @typescript-eslint/require-await
interface APIGatewayProxyEvent {
    body: string | null;
    httpMethod: string;
    isBase64Encoded: boolean;
    path: string
    queryStringParameters: string | undefined;
    resource: string;
}
 interface APIGatewayProxyResult {
    statusCode: number;
    body: string;
}

export const lambdaHandler = (event: APIGatewayProxyEvent): APIGatewayProxyResult => {
    const queries = JSON.stringify(event.queryStringParameters);
    return {
        statusCode: 200,
        body: `Queries: ${queries}`
    }
}
