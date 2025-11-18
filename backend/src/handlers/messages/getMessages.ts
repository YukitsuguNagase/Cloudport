import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const MESSAGES_TABLE = process.env.MESSAGES_TABLE!
const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const conversationId = event.pathParameters?.conversationId
    const userId = event.requestContext.authorizer?.claims?.sub

    if (!conversationId || !userId) {
      return errorResponse('Missing required parameters', 400)
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
      return errorResponse('You are not authorized to view messages in this conversation', 403)
    }

    // Get messages for this conversation
    const result = await docClient.send(
      new QueryCommand({
        TableName: MESSAGES_TABLE,
        IndexName: 'ConversationIdIndex',
        KeyConditionExpression: 'conversationId = :conversationId',
        ExpressionAttributeValues: {
          ':conversationId': conversationId,
        },
        ScanIndexForward: true, // Sort by createdAt ascending (oldest first)
      })
    )

    return successResponse(result.Items || [])
  } catch (error) {
    console.error('Error getting messages:', error)
    return errorResponse('Failed to get messages')
  }
}
