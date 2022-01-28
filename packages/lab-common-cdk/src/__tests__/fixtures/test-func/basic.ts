// eslint-disable-next-line @typescript-eslint/require-await
export const lambdaHandler = async (event: any): Promise<any> => {
    const queries = JSON.stringify(event.queryStringParameters);
    return {
        statusCode: 200,
        body: `Queries: ${queries}`
    }
}
