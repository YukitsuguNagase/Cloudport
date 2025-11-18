import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
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

    // Get existing job
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
      return forbiddenResponse('You can only edit your own jobs')
    }

    const body = JSON.parse(event.body || '{}')

    // Validate duration type if provided
    if (body.duration?.type && !['short', 'long', 'spot'].includes(body.duration.type)) {
      return errorResponse('Invalid duration type. Must be short, long, or spot', 400)
    }

    // Build update expression
    const updateExpressions: string[] = []
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, any> = {}

    if (body.title) {
      updateExpressions.push('#title = :title')
      expressionAttributeNames['#title'] = 'title'
      expressionAttributeValues[':title'] = body.title
    }

    if (body.description) {
      updateExpressions.push('#description = :description')
      expressionAttributeNames['#description'] = 'description'
      expressionAttributeValues[':description'] = body.description
    }

    if (body.requirements) {
      updateExpressions.push('#requirements = :requirements')
      expressionAttributeNames['#requirements'] = 'requirements'
      expressionAttributeValues[':requirements'] = body.requirements
    }

    if (body.duration) {
      updateExpressions.push('#duration = :duration')
      expressionAttributeNames['#duration'] = 'duration'
      expressionAttributeValues[':duration'] = body.duration
    }

    if (body.budget !== undefined) {
      updateExpressions.push('#budget = :budget')
      expressionAttributeNames['#budget'] = 'budget'
      expressionAttributeValues[':budget'] = body.budget
    }

    if (body.status) {
      updateExpressions.push('#status = :status')
      expressionAttributeNames['#status'] = 'status'
      expressionAttributeValues[':status'] = body.status
    }

    // Always update updatedAt
    updateExpressions.push('#updatedAt = :updatedAt')
    expressionAttributeNames['#updatedAt'] = 'updatedAt'
    expressionAttributeValues[':updatedAt'] = new Date().toISOString()

    if (updateExpressions.length === 1) {
      // Only updatedAt would be updated, meaning no actual changes
      return errorResponse('No fields to update', 400)
    }

    // Update job
    const result = await docClient.send(
      new UpdateCommand({
        TableName: JOBS_TABLE,
        Key: { jobId },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    )

    return successResponse(result.Attributes)
  } catch (error) {
    console.error('Error updating job:', error)
    return errorResponse('Failed to update job')
  }
}
