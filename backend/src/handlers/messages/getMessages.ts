import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { successResponse, errorResponse } from '../../utils/response.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // TODO: Implement get messages logic
    return successResponse({ message: 'Get messages - Not implemented yet' })
  } catch (error) {
    console.error('Error getting messages:', error)
    return errorResponse('Failed to get messages')
  }
}
