import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const NOTIFICATIONS_TABLE = process.env.NOTIFICATIONS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub

    if (!userId) {
      return errorResponse('Unauthorized', 401)
    }

    // Get notifications for the user
    const result = await docClient.send(
      new QueryCommand({
        TableName: NOTIFICATIONS_TABLE,
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        ScanIndexForward: false, // Sort by createdAt descending (newest first)
      })
    )

    const notifications = result.Items || []

    return successResponse(notifications)
  } catch (error) {
    console.error('Error getting notifications:', error)
    return errorResponse('Failed to get notifications')
  }
}
