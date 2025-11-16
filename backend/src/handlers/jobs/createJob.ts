import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import { docClient, TABLE_NAMES, PutCommand } from '../../utils/dynamodb.js'
import { getUserFromEvent, verifyUserType } from '../../utils/auth.js'
import { successResponse, errorResponse, forbiddenResponse } from '../../utils/response.js'
import { Job } from '../../models/Job.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromEvent(event)

    // Only companies can create jobs
    try {
      verifyUserType(user, ['company'])
    } catch {
      return forbiddenResponse('Only companies can create jobs')
    }

    const body = JSON.parse(event.body || '{}')

    const job: Job = {
      jobId: uuidv4(),
      companyId: user.userId,
      title: body.title,
      description: body.description,
      requirements: body.requirements,
      duration: body.duration,
      budget: body.budget,
      status: 'open',
      applicationCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAMES.JOBS,
        Item: job,
      })
    )

    return successResponse(job, 201)
  } catch (error) {
    console.error('Error creating job:', error)
    return errorResponse('Failed to create job')
  }
}
