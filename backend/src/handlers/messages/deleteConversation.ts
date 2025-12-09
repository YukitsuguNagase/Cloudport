import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse, forbiddenResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub
    const conversationId = event.pathParameters?.conversationId

    if (!userId) {
      return errorResponse('Unauthorized', 401)
    }

    if (!conversationId) {
      return errorResponse('Missing conversationId', 400)
    }

    // Get the conversation to verify ownership
    const getResult = await docClient.send(
      new GetCommand({
        TableName: CONVERSATIONS_TABLE,
        Key: { conversationId },
      })
    )

    if (!getResult.Item) {
      return errorResponse('Conversation not found', 404)
    }

    const conversation = getResult.Item

    // Verify that the user is a participant in this conversation
    if (conversation.engineerId !== userId && conversation.companyId !== userId) {
      return forbiddenResponse('You can only delete your own conversations')
    }

    // Delete the conversation
    await docClient.send(
      new DeleteCommand({
        TableName: CONVERSATIONS_TABLE,
        Key: { conversationId },
      })
    )

    return successResponse({
      message: 'Conversation deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return errorResponse('Failed to delete conversation')
  }
}
