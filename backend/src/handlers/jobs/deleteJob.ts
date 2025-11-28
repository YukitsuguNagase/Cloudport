import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse, forbiddenResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const JOBS_TABLE = process.env.JOBS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub
    const jobId = event.pathParameters?.jobId

    if (!userId) {
      return errorResponse('Unauthorized', 401)
    }

    if (!jobId) {
      return errorResponse('Missing jobId', 400)
    }

    // Get existing job to verify ownership
    const getResult = await docClient.send(
      new GetCommand({
        TableName: JOBS_TABLE,
        Key: { jobId },
      })
    )

    if (!getResult.Item) {
      return errorResponse('Job not found', 404)
    }

    // Verify ownership
    if (getResult.Item.companyId !== userId) {
      return forbiddenResponse('You can only delete your own jobs')
    }

    // Delete the job
    await docClient.send(
      new DeleteCommand({
        TableName: JOBS_TABLE,
        Key: { jobId },
      })
    )

    return successResponse({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Error deleting job:', error)
    return errorResponse('Failed to delete job')
  }
}
