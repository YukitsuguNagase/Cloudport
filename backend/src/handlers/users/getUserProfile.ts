import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const USERS_TABLE = process.env.USERS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId

    if (!userId) {
      return errorResponse('User ID is required', 400)
    }

    const result = await docClient.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId },
      })
    )

    if (!result.Item) {
      return errorResponse('User not found', 404)
    }

    const user = result.Item

    // Return public profile only (exclude private information)
    const publicProfile = {
      userId: user.userId,
      email: user.email,
      userType: user.userType,
      profile: user.profile ? {
        ...user.profile,
        // Remove private information for engineer profiles
        privateInfo: undefined,
      } : undefined,
      createdAt: user.createdAt,
    }

    return successResponse(publicProfile)
  } catch (error) {
    console.error('Error getting user profile:', error)
    return errorResponse('Failed to get user profile')
  }
}
