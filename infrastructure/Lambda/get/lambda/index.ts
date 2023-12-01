import {DynamoDB} from 'aws-sdk'
import type {ResponseBody} from 'api-specs/v1/getTodos'
import type {Todo} from 'customTypes/index'
import {httpResponse} from '../../handlers/httpResponse'

/**
 * Transforms a list of DynamoDB items into an array of Todo objects.
 *
 * This function maps over the DynamoDB items, converting each item's
 * attributes into a Todo object. If the items parameter is undefined,
 * the function returns undefined, indicating no items were found.
 *
 * @param {DynamoDB.DocumentClient.ItemList | undefined} items - The list of DynamoDB items to transform.
 * @returns {Todo[] | undefined} An array of Todo objects or undefined if no items were provided.
 */
function transformDynamoDBItems(
  items: DynamoDB.DocumentClient.ItemList | undefined,
): Todo[] | undefined {
  if (!items) return undefined

  return items.map(item => ({
    id: item.id?.S || '',
    todo_name: item.todo_name?.S || '',
    todo_description: item.todo_description?.S || '',
    todo_completed: item.todo_completed?.BOOL || false,
  }))
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

    const scanOutput = await dynamoDB.scan({TableName: tableName}).promise()
    // Use the transformation function to make TS happy
    const todos = transformDynamoDBItems(scanOutput.Items)
    // (2) Use the Response Type in the Lambda Handler
    const response: ResponseBody = {todos}

    return httpResponse(200, JSON.stringify(response))
  } catch (error: any) {
    console.error(error)

    return httpResponse(400, JSON.stringify({message: error.message}))
  }
}
