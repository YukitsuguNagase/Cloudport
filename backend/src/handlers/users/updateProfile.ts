import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { docClient, TABLE_NAMES, UpdateCommand, GetCommand } from '../../utils/dynamodb.js'
import { getUserFromEvent } from '../../utils/auth.js'
import { successResponse, errorResponse } from '../../utils/response.js'
import { UserProfile } from '../../models/User.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authUser = getUserFromEvent(event)

    if (!event.body) {
      return errorResponse('Request body is required', 400)
    }

    const profileUpdates: Partial<UserProfile> = JSON.parse(event.body)

    // Get existing user to merge updates
    const existingUser = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAMES.USERS,
        Key: { userId: authUser.userId },
      })
    )

    if (!existingUser.Item) {
      return errorResponse('User not found', 404)
    }

    // Merge existing profile with updates
    const updatedProfile = {
      ...existingUser.Item.profile,
      ...profileUpdates,
    }

    // Update user profile in DynamoDB
    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAMES.USERS,
        Key: { userId: authUser.userId },
        UpdateExpression: 'SET profile = :profile, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':profile': updatedProfile,
          ':updatedAt': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
      })
    )

    return successResponse(result.Attributes)
  } catch (error) {
    console.error('Error updating profile:', error)
    return errorResponse('Failed to update profile')
  }
}
