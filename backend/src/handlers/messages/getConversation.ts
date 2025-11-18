import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE!
const USERS_TABLE = process.env.USERS_TABLE!
const JOBS_TABLE = process.env.JOBS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const conversationId = event.pathParameters?.conversationId
    const userId = event.requestContext.authorizer?.claims?.sub

    if (!conversationId || !userId) {
      return errorResponse('Missing required parameters', 400)
    }

    // Get conversation
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
      return errorResponse('You are not authorized to view this conversation', 403)
    }

    // Get user info to determine user type
    const userResult = await docClient.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId },
      })
    )

    if (!userResult.Item) {
      return errorResponse('User not found', 404)
    }

    const userType = userResult.Item.userType

    // Get job and other user info
    const [jobResult, otherUserResult] = await Promise.all([
      docClient.send(
        new GetCommand({
          TableName: JOBS_TABLE,
          Key: { jobId: conversation.jobId },
        })
      ),
      docClient.send(
        new GetCommand({
          TableName: USERS_TABLE,
          Key: {
            userId: userType === 'engineer' ? conversation.companyId : conversation.engineerId,
          },
        })
      ),
    ])

    const enrichedConversation = {
      ...conversation,
      jobTitle: jobResult.Item?.title,
      otherUser: otherUserResult.Item
        ? {
            userId: otherUserResult.Item.userId,
            displayName:
              otherUserResult.Item.profile?.displayName ||
              otherUserResult.Item.profile?.companyName ||
              otherUserResult.Item.email,
            avatar: otherUserResult.Item.profile?.avatar || otherUserResult.Item.profile?.logo,
          }
        : null,
    }

    return successResponse(enrichedConversation)
  } catch (error) {
    console.error('Error getting conversation:', error)
    return errorResponse('Failed to get conversation')
  }
}
