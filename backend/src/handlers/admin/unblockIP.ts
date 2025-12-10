import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb'
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

    const ipAddress = event.pathParameters?.ipAddress

    if (!ipAddress) {
      return errorResponse('IP address is required', 400)
    }

    await docClient.send(
      new DeleteCommand({
        TableName: BLOCKED_IPS_TABLE,
        Key: { ipAddress },
      })
    )

    console.log(`IP ${ipAddress} unblocked by ${userEmail}`)

    return successResponse({
      message: 'IP address unblocked successfully',
      ipAddress,
    })
  } catch (error) {
    console.error('Error unblocking IP:', error)
    return errorResponse('Failed to unblock IP address')
  }
}
