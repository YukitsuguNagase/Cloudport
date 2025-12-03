import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, DeleteCommand, QueryCommand, BatchWriteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse, forbiddenResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const JOBS_TABLE = process.env.JOBS_TABLE!
const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE!
const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE!

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

    // Get all applications for this job
    const applicationsResult = await docClient.send(
      new QueryCommand({
        TableName: APPLICATIONS_TABLE,
        IndexName: 'JobIdIndex',
        KeyConditionExpression: 'jobId = :jobId',
        ExpressionAttributeValues: {
          ':jobId': jobId,
        },
      })
    )

    const applications = applicationsResult.Items || []

    // Delete all applications in batches (max 25 per batch)
    if (applications.length > 0) {
      const batchSize = 25
      for (let i = 0; i < applications.length; i += batchSize) {
        const batch = applications.slice(i, i + batchSize)
        await docClient.send(
          new BatchWriteCommand({
            RequestItems: {
              [APPLICATIONS_TABLE]: batch.map((app) => ({
                DeleteRequest: {
                  Key: {
                    applicationId: app.applicationId,
                  },
                },
              })),
            },
          })
        )
      }
    }

    // Mark all related conversations as job deleted
    const conversationsResult = await docClient.send(
      new QueryCommand({
        TableName: CONVERSATIONS_TABLE,
        IndexName: 'JobIdIndex',
        KeyConditionExpression: 'jobId = :jobId',
        ExpressionAttributeValues: {
          ':jobId': jobId,
        },
      })
    )

    const conversations = conversationsResult.Items || []

    // Update all conversations to mark job as deleted
    for (const conversation of conversations) {
      await docClient.send(
        new UpdateCommand({
          TableName: CONVERSATIONS_TABLE,
          Key: { conversationId: conversation.conversationId },
          UpdateExpression: 'SET isJobDeleted = :isJobDeleted',
          ExpressionAttributeValues: {
            ':isJobDeleted': true,
          },
        })
      )
    }

    // Delete the job
    await docClient.send(
      new DeleteCommand({
        TableName: JOBS_TABLE,
        Key: { jobId },
      })
    )

    return successResponse({
      message: 'Job deleted successfully',
      deletedApplications: applications.length,
      updatedConversations: conversations.length
    })
  } catch (error) {
    console.error('Error deleting job:', error)
    return errorResponse('Failed to delete job')
  }
}
