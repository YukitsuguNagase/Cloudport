import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'
import { ApplicationStatus } from '../../models/Application.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE!
const JOBS_TABLE = process.env.JOBS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const applicationId = event.pathParameters?.applicationId
    const userId = event.requestContext.authorizer?.claims?.sub

    if (!applicationId || !userId) {
      return errorResponse('Missing required parameters', 400)
    }

    if (!event.body) {
      return errorResponse('Request body is required', 400)
    }

    const { status } = JSON.parse(event.body)

    if (!status || !['pending', 'interested', 'passed'].includes(status)) {
      return errorResponse('Invalid status value', 400)
    }

    // Get application
    const applicationResult = await docClient.send(
      new GetCommand({
        TableName: APPLICATIONS_TABLE,
        Key: { applicationId },
      })
    )

    if (!applicationResult.Item) {
      return errorResponse('Application not found', 404)
    }

    const application = applicationResult.Item

    // Get job to verify user is the company owner
    const jobResult = await docClient.send(
      new GetCommand({
        TableName: JOBS_TABLE,
        Key: { jobId: application.jobId },
      })
    )

    if (!jobResult.Item) {
      return errorResponse('Job not found', 404)
    }

    if (jobResult.Item.companyId !== userId) {
      return errorResponse('You are not authorized to update this application', 403)
    }

    // Update application status
    const now = new Date().toISOString()
    const result = await docClient.send(
      new UpdateCommand({
        TableName: APPLICATIONS_TABLE,
        Key: { applicationId },
        UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status as ApplicationStatus,
          ':updatedAt': now,
        },
        ReturnValues: 'ALL_NEW',
      })
    )

    return successResponse(result.Attributes)
  } catch (error) {
    console.error('Error updating application status:', error)
    return errorResponse('Failed to update application status')
  }
}
