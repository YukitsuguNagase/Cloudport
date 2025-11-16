import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { successResponse, errorResponse } from '../../utils/response.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // TODO: Implement apply job logic
    return successResponse({ message: 'Apply job - Not implemented yet' })
  } catch (error) {
    console.error('Error applying to job:', error)
    return errorResponse('Failed to apply to job')
  }
}
