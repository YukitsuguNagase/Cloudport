import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { successResponse, errorResponse } from '../../utils/response.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // TODO: Implement mark as read logic
    return successResponse({ message: 'Mark as read - Not implemented yet' })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return errorResponse('Failed to mark messages as read')
  }
}
