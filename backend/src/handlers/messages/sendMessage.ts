import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { successResponse, errorResponse } from '../../utils/response.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // TODO: Implement send message logic
    return successResponse({ message: 'Send message - Not implemented yet' })
  } catch (error) {
    console.error('Error sending message:', error)
    return errorResponse('Failed to send message')
  }
}
