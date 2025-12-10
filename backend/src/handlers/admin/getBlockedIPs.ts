import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
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

    const result = await docClient.send(
      new ScanCommand({
        TableName: BLOCKED_IPS_TABLE,
      })
    )

    const now = Math.floor(Date.now() / 1000)

    // Filter out expired blocks and format response
    const blockedIPs = (result.Items || [])
      .filter((item) => !item.ttl || item.ttl > now)
      .map((item) => ({
        ipAddress: item.ipAddress,
        reason: item.reason,
        blockedAt: item.blockedAt,
        blockedBy: item.blockedBy,
        expiresAt: item.ttl ? new Date(item.ttl * 1000).toISOString() : null,
      }))
      .sort((a, b) => new Date(b.blockedAt).getTime() - new Date(a.blockedAt).getTime())

    return successResponse({
      blockedIPs,
      total: blockedIPs.length,
    })
  } catch (error) {
    console.error('Error getting blocked IPs:', error)
    return errorResponse('Failed to get blocked IPs')
  }
}
