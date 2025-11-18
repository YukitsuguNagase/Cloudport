import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'
import { v4 as uuidv4 } from 'uuid'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE!
const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE!
const JOBS_TABLE = process.env.JOBS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const applicationId = event.pathParameters?.applicationId
    const userId = event.requestContext.authorizer?.claims?.sub

    if (!applicationId || !userId) {
      return errorResponse('Missing required parameters', 400)
    }

    // Get application to verify it exists and get engineerId/jobId
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
    const { engineerId, jobId } = application

    // Get job to verify companyId
    const jobResult = await docClient.send(
      new GetCommand({
        TableName: JOBS_TABLE,
        Key: { jobId },
      })
    )

    if (!jobResult.Item) {
      return errorResponse('Job not found', 404)
    }

    const { companyId } = jobResult.Item

    // Verify user is either the engineer or the company
    if (userId !== engineerId && userId !== companyId) {
      return errorResponse('You are not authorized to create this conversation', 403)
    }

    // Check if conversation already exists for this application
    const existingConversations = await docClient.send(
      new QueryCommand({
        TableName: CONVERSATIONS_TABLE,
        IndexName: 'EngineerIdIndex',
        KeyConditionExpression: 'engineerId = :engineerId',
        FilterExpression: 'applicationId = :applicationId',
        ExpressionAttributeValues: {
          ':engineerId': engineerId,
          ':applicationId': applicationId,
        },
      })
    )

    if (existingConversations.Items && existingConversations.Items.length > 0) {
      // Return existing conversation
      return successResponse(existingConversations.Items[0])
    }

    // Create new conversation
    const conversationId = uuidv4()
    const now = new Date().toISOString()

    const conversation = {
      conversationId,
      applicationId,
      jobId,
      engineerId,
      companyId,
      lastMessageAt: now,
      unreadCountEngineer: 0,
      unreadCountCompany: 0,
      createdAt: now,
    }

    await docClient.send(
      new PutCommand({
        TableName: CONVERSATIONS_TABLE,
        Item: conversation,
      })
    )

    return successResponse(conversation)
  } catch (error) {
    console.error('Error creating conversation:', error)
    return errorResponse('Failed to create conversation')
  }
}
