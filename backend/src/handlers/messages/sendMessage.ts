import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'
import { v4 as uuidv4 } from 'uuid'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const MESSAGES_TABLE = process.env.MESSAGES_TABLE!
const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE!
const USERS_TABLE = process.env.USERS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const conversationId = event.pathParameters?.conversationId
    const userId = event.requestContext.authorizer?.claims?.sub

    if (!conversationId || !userId) {
      return errorResponse('Missing required parameters', 400)
    }

    if (!event.body) {
      return errorResponse('Request body is required', 400)
    }

    const { content } = JSON.parse(event.body)

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return errorResponse('Message content is required', 400)
    }

    // Get conversation to verify user is participant
    const conversationResult = await docClient.send(
      new GetCommand({
        TableName: CONVERSATIONS_TABLE,
        Key: { conversationId },
      })
    )

    if (!conversationResult.Item) {
      return errorResponse('Conversation not found', 404)
    }

    const conversation = conversationResult.Item

    // Verify user is participant
    if (userId !== conversation.engineerId && userId !== conversation.companyId) {
      return errorResponse('You are not authorized to send messages in this conversation', 403)
    }

    // Get user info to determine sender type
    const userResult = await docClient.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId },
      })
    )

    if (!userResult.Item) {
      return errorResponse('User not found', 404)
    }

    const senderType = userResult.Item.userType

    // Create message
    const messageId = uuidv4()
    const now = new Date().toISOString()

    const message = {
      messageId,
      conversationId,
      senderId: userId,
      senderType,
      content: content.trim(),
      isRead: false,
      createdAt: now,
    }

    await docClient.send(
      new PutCommand({
        TableName: MESSAGES_TABLE,
        Item: message,
      })
    )

    // Update conversation lastMessageAt and increment unread count for the other user
    const updateExpression =
      senderType === 'engineer'
        ? 'SET lastMessageAt = :now, unreadCountCompany = unreadCountCompany + :inc'
        : 'SET lastMessageAt = :now, unreadCountEngineer = unreadCountEngineer + :inc'

    await docClient.send(
      new UpdateCommand({
        TableName: CONVERSATIONS_TABLE,
        Key: { conversationId },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: {
          ':now': now,
          ':inc': 1,
        },
      })
    )

    return successResponse(message)
  } catch (error) {
    console.error('Error sending message:', error)
    return errorResponse('Failed to send message')
  }
}
