import {DynamoDB} from 'aws-sdk'
import type {ResponseBody} from 'api-specs/v1/getTodos'
import {httpResponse} from '../../handlers/httpResponse'

export const handler = async () => {
  try {
    const tableName = process.env.TABLE_NAME as string
    const awsRegion = process.env.REGION || 'us-east-1'

    // By default, LocalStack's DynamoDB service runs on port 4588.
    // To ensure that your local server communicates with this local instance instead of the actual AWS DynamoDB service,
    //  you need to set a custom endpoint.
    // In the lambda functions for both POST and GET methods,
    //  the endpoint for the DynamoDB client (`DocumentClient()`) is conditionally
    // set based on the presence of an environment variable `DYNAMODB_ENDPOINT`.
    // If this environment variable exists, it will use that (which in the local context points to LocalStack).
    // Otherwise, it defaults to the real AWS DynamoDB endpoint.
    const dynamoDB = new DynamoDB.DocumentClient({
      region: awsRegion,
      endpoint:
        process.env.DYNAMODB_ENDPOINT ||
        `https://dynamodb.${awsRegion}.amazonaws.com`,
    })

    const {Items}: DynamoDB.ScanOutput = await dynamoDB
      .scan({TableName: tableName})
      .promise()

    // @ts-expect-error haven't found a no-code or low-code way to make TS happy
    // and making TS with a transformation function happy breaks the feature
    const response: ResponseBody = {todos: Items}

    return httpResponse(200, JSON.stringify(response))
  } catch (error: any) {
    console.error(error)

    return httpResponse(400, JSON.stringify({message: error.message}))
  }
}
