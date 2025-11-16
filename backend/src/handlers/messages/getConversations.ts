import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { successResponse, errorResponse } from '../../utils/response.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // TODO: Implement get conversations logic
    return successResponse({ message: 'Get conversations - Not implemented yet' })
  } catch (error) {
    console.error('Error getting conversations:', error)
    return errorResponse('Failed to get conversations')
  }
}
