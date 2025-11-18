import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { docClient, TABLE_NAMES, GetCommand, PutCommand } from '../../utils/dynamodb.js'
import { getUserFromEvent } from '../../utils/auth.js'
import { successResponse, errorResponse } from '../../utils/response.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authUser = getUserFromEvent(event)

    // Get user from DynamoDB
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAMES.USERS,
        Key: { userId: authUser.userId },
      })
    )

    // If user doesn't exist in DB, create a new profile
    if (!result.Item) {
      const defaultProfile = authUser.userType === 'engineer'
        ? {
            displayName: authUser.email.split('@')[0],
          }
        : {
            companyName: authUser.email.split('@')[0],
          }

      const newUser = {
        userId: authUser.userId,
        email: authUser.email,
        userType: authUser.userType,
        profile: defaultProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAMES.USERS,
          Item: newUser,
        })
      )

      return successResponse(newUser)
    }

    return successResponse(result.Item)
  } catch (error) {
    console.error('Error getting profile:', error)
    return errorResponse('Failed to get profile')
  }
}
