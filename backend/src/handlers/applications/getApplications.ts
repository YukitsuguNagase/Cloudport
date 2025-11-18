import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE!
const USERS_TABLE = process.env.USERS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub
    const jobId = event.pathParameters?.jobId

    if (!userId) {
      return errorResponse('Unauthorized', 401)
    }

    let applications

    if (jobId) {
      // Get applications for a specific job (for company to see applicants)
      const result = await docClient.send(
        new QueryCommand({
          TableName: APPLICATIONS_TABLE,
          IndexName: 'JobIdIndex',
          KeyConditionExpression: 'jobId = :jobId',
          ExpressionAttributeValues: {
            ':jobId': jobId,
          },
        })
      )
      applications = result.Items || []
    } else {
      // Get engineer's own applications
      const result = await docClient.send(
        new QueryCommand({
          TableName: APPLICATIONS_TABLE,
          IndexName: 'EngineerIdIndex',
          KeyConditionExpression: 'engineerId = :engineerId',
          ExpressionAttributeValues: {
            ':engineerId': userId,
          },
        })
      )
      applications = result.Items || []
    }

    // Sort by creation date (newest first)
    applications.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // If getting applications for a job, enrich with engineer info
    if (jobId) {
      const enrichedApplications = await Promise.all(
        applications.map(async (application) => {
          try {
            const engineerResult = await docClient.send(
              new GetCommand({
                TableName: USERS_TABLE,
                Key: { userId: application.engineerId },
              })
            )

            return {
              ...application,
              engineerName: engineerResult.Item?.profile?.displayName || engineerResult.Item?.email || '不明',
            }
          } catch (error) {
            console.error('Error fetching engineer info:', error)
            return {
              ...application,
              engineerName: '不明',
            }
          }
        })
      )

      return successResponse(enrichedApplications)
    }

    return successResponse(applications)
  } catch (error) {
    console.error('Error getting applications:', error)
    return errorResponse('Failed to get applications')
  }
}
