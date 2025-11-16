import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { successResponse, errorResponse } from '../../utils/response.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // TODO: Implement delete job logic
    return successResponse({ message: 'Delete job - Not implemented yet' })
  } catch (error) {
    console.error('Error deleting job:', error)
    return errorResponse('Failed to delete job')
  }
}
