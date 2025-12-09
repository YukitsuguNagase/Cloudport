import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const USERS_TABLE = process.env.USERS_TABLE!
const ADMIN_EMAIL = 'yukinag@dotqinc.com'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub
    const userEmail = event.requestContext.authorizer?.claims?.email

    if (!userId || !userEmail) {
      return errorResponse('Unauthorized', 401)
    }

    // Check if user is admin
    if (userEmail !== ADMIN_EMAIL) {
      return errorResponse('Admin access required', 403)
    }

    // Scan all users
    const usersResult = await docClient.send(
      new ScanCommand({
        TableName: USERS_TABLE,
      })
    )

    if (!usersResult.Items || usersResult.Items.length === 0) {
      return successResponse([])
    }

    // Map users to admin-friendly format
    const adminUsers = usersResult.Items.map((user) => ({
      userId: user.userId,
      email: user.email,
      displayName: user.profile?.displayName || user.profile?.name || user.profile?.companyName,
      userType: user.userType,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      mfaEnabled: user.mfaEnabled || false,
      accountStatus: user.accountStatus || 'active',
    }))

    // Sort by creation date (newest first)
    adminUsers.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return successResponse(adminUsers)
  } catch (error) {
    console.error('Error fetching all users:', error)
    return errorResponse('Failed to fetch users')
  }
}
