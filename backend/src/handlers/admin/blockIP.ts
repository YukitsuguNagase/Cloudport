import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const BLOCKED_IPS_TABLE = process.env.BLOCKED_IPS_TABLE!
const ADMIN_EMAIL = 'yukinag@dotqinc.com'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userEmail = event.requestContext.authorizer?.claims?.email

    if (userEmail !== ADMIN_EMAIL) {
      return errorResponse('Admin access only', 403)
    }

    if (!event.body) {
      return errorResponse('Request body is required', 400)
    }

    const { ipAddress, reason, durationHours } = JSON.parse(event.body)

    if (!ipAddress) {
      return errorResponse('IP address is required', 400)
    }

    // IPアドレスの形式チェック（簡易）
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(ipAddress)) {
      return errorResponse('Invalid IP address format', 400)
    }

    const now = Math.floor(Date.now() / 1000)
    const duration = durationHours ? durationHours * 3600 : 0 // 0 = 永久ブロック

    await docClient.send(
      new PutCommand({
        TableName: BLOCKED_IPS_TABLE,
        Item: {
          ipAddress,
          reason: reason || 'Suspicious activity detected',
          blockedAt: new Date().toISOString(),
          blockedBy: userEmail,
          ttl: duration > 0 ? now + duration : undefined,
        },
      })
    )

    console.log(`IP ${ipAddress} blocked by ${userEmail}. Reason: ${reason || 'Not specified'}`)

    return successResponse({
      message: 'IP address blocked successfully',
      ipAddress,
      blockedUntil: duration > 0 ? new Date((now + duration) * 1000).toISOString() : 'Permanent',
    })
  } catch (error) {
    console.error('Error blocking IP:', error)
    return errorResponse('Failed to block IP address')
  }
}
