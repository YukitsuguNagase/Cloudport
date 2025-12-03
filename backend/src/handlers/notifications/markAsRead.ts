import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const NOTIFICATIONS_TABLE = process.env.NOTIFICATIONS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub
    const notificationId = event.pathParameters?.notificationId

    if (!userId) {
      return errorResponse('Unauthorized', 401)
    }

    if (!notificationId) {
      return errorResponse('Notification ID is required', 400)
    }

    // Get notification to verify ownership
    const notification = await docClient.send(
      new GetCommand({
        TableName: NOTIFICATIONS_TABLE,
        Key: { notificationId },
      })
    )

    if (!notification.Item) {
      return errorResponse('Notification not found', 404)
    }

    if (notification.Item.userId !== userId) {
      return errorResponse('Forbidden', 403)
    }

    // Mark as read
    const result = await docClient.send(
      new UpdateCommand({
        TableName: NOTIFICATIONS_TABLE,
        Key: { notificationId },
        UpdateExpression: 'SET isRead = :true',
        ExpressionAttributeValues: {
          ':true': true,
        },
        ReturnValues: 'ALL_NEW',
      })
    )

    return successResponse(result.Attributes)
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return errorResponse('Failed to mark notification as read')
  }
}
