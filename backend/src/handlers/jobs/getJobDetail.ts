import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { docClient, TABLE_NAMES, GetCommand } from '../../utils/dynamodb.js'
import { successResponse, errorResponse, notFoundResponse } from '../../utils/response.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const jobId = event.pathParameters?.jobId

    if (!jobId) {
      return errorResponse('Job ID is required', 400)
    }

    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAMES.JOBS,
        Key: { jobId },
      })
    )

    if (!result.Item) {
      return notFoundResponse('Job not found')
    }

    return successResponse(result.Item)
  } catch (error) {
    console.error('Error getting job detail:', error)
    return errorResponse('Failed to get job detail')
  }
}
