import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
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

    // Get all users with their last login information
    const usersResult = await docClient.send(
      new ScanCommand({
        TableName: USERS_TABLE,
      })
    )

    if (!usersResult.Items || usersResult.Items.length === 0) {
      return successResponse({ accessLogs: [], recentLogins: [] })
    }

    // Filter users with login history
    const usersWithLogins = usersResult.Items.filter((user) => user.lastLoginAt).map((user) => ({
      userId: user.userId,
      email: user.email,
      displayName:
        user.profile?.displayName || user.profile?.name || user.profile?.companyName || 'Unknown',
      userType: user.userType,
      lastLoginAt: user.lastLoginAt,
      lastLoginIp: user.lastLoginIp || 'Unknown',
      loginCount: user.loginCount || 0,
      deviceInfo: user.lastLoginDevice || 'Unknown',
    }))

    // Sort by last login (most recent first)
    usersWithLogins.sort((a, b) => {
      return new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime()
    })

    // Get recent logins (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const recentLogins = usersWithLogins.filter((user) => user.lastLoginAt > twentyFourHoursAgo)

    // Get new device logins (users who logged in from a new IP in the last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const newDeviceLogins = usersWithLogins.filter((user) => {
      // Simple heuristic: if last login is recent and login count is low, might be new device
      return user.lastLoginAt > sevenDaysAgo && user.loginCount <= 3
    })

    return successResponse({
      accessLogs: usersWithLogins,
      recentLogins,
      newDeviceLogins,
      statistics: {
        totalUsers: usersResult.Items.length,
        usersWithLoginHistory: usersWithLogins.length,
        recentLoginsCount: recentLogins.length,
        newDeviceLoginsCount: newDeviceLogins.length,
      },
    })
  } catch (error) {
    console.error('Error fetching access logs:', error)
    return errorResponse('Failed to fetch access logs')
  }
}
