import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE!
const USERS_TABLE = process.env.USERS_TABLE!
const JOBS_TABLE = process.env.JOBS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub

    if (!userId) {
      return errorResponse('Unauthorized', 401)
    }

    // Get user to check userType
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

    // Query conversations based on user type
    const indexName = userType === 'engineer' ? 'EngineerIdIndex' : 'CompanyIdIndex'
    const keyName = userType === 'engineer' ? 'engineerId' : 'companyId'

    const result = await docClient.send(
      new QueryCommand({
        TableName: CONVERSATIONS_TABLE,
        IndexName: indexName,
        KeyConditionExpression: `${keyName} = :userId`,
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
    )

    const conversations = result.Items || []

    // Enrich conversations with job and other user info
    const enrichedConversations = await Promise.all(
      conversations.map(async (conversation) => {
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
                userId:
                  userType === 'engineer' ? conversation.companyId : conversation.engineerId,
              },
            })
          ),
        ])

        return {
          ...conversation,
          jobTitle: jobResult.Item?.title,
          jobDescription: jobResult.Item?.description,
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
      })
    )

    // Sort by lastMessageAt descending
    enrichedConversations.sort(
      (a: any, b: any) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )

    return successResponse(enrichedConversations)
  } catch (error) {
    console.error('Error getting conversations:', error)
    return errorResponse('Failed to get conversations')
  }
}
