import {DynamoDB} from 'aws-sdk'
import type {Todo} from 'customTypes/index'
import {httpResponse} from '../../handlers/httpResponse'

// (1) define & export a type for the response body,
export type GetResponseBody = {
  todos: Partial<Todo>[] | undefined
}

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

    const {Items} = await dynamoDB.scan({TableName: tableName}).promise()

    // (2) and use it in the Lambda Handler
    const response: GetResponseBody = {todos: Items}

    return httpResponse(200, JSON.stringify(response))
  } catch (error: any) {
    console.error(error)

    return httpResponse(400, JSON.stringify({message: error.message}))
  }
}
