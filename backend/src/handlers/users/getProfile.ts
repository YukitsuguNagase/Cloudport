import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { successResponse, errorResponse } from '../../utils/response.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // TODO: Implement get profile logic
    return successResponse({ message: 'Get profile - Not implemented yet' })
  } catch (error) {
    console.error('Error getting profile:', error)
    return errorResponse('Failed to get profile')
  }
}
