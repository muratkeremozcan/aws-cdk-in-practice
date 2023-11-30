import {DynamoDB} from 'aws-sdk'
import {DeleteEvent} from 'customTypes/index' // Assuming DeleteEvent is exported from here
import {ResponseBody} from 'api-specs/v1/deleteTodo'
import {httpResponse} from '../../handlers/httpResponse'

export const handler = async (event: DeleteEvent) => {
  try {
    const {id} = event.pathParameters
    const tableName = process.env.TABLE_NAME as string
    const awsRegion = process.env.REGION || 'us-east-1'

    // By default, LocalStack's DynamoDB service runs on port 4588.
    // To ensure that your local server communicates with this local instance instead of the actual AWS DynamoDB service,
    //  you need to set a custom endpoint.
    const dynamoDB = new DynamoDB.DocumentClient({
      region: awsRegion,
      endpoint:
        process.env.DYNAMODB_ENDPOINT ||
        `https://dynamodb.${awsRegion}.amazonaws.com`,
    })

    await dynamoDB
      .delete({
        TableName: tableName,
        Key: {
          id,
        },
      })
      .promise()

    // (2) Use the Response Type in the Lambda Handler
    const response: ResponseBody = {
      message: 'Todo deleted successfully.',
    }

    return httpResponse(200, JSON.stringify(response))
  } catch (error: any) {
    console.error(error)

    return httpResponse(400, JSON.stringify({message: error.message}))
  }
}
