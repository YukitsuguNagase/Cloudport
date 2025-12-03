import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { docClient, TABLE_NAMES, GetCommand } from '../../utils/dynamodb.js'
import { successResponse, errorResponse, notFoundResponse } from '../../utils/response.js'
import { User, CompanyProfile } from '../../models/User.js'
import { Job } from '../../models/Job.js'

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

    const job = result.Item as Job

    // Fetch company name
    try {
      const userResult = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAMES.USERS,
          Key: { userId: job.companyId },
        })
      )
      if (userResult.Item) {
        const user = userResult.Item as User
        const companyProfile = user.profile as CompanyProfile
        return successResponse({
          ...job,
          companyName: companyProfile.companyName,
        })
      }
    } catch (error) {
      console.error(`Failed to get company name for job ${job.jobId}:`, error)
    }

    return successResponse(job)
  } catch (error) {
    console.error('Error getting job detail:', error)
    return errorResponse('Failed to get job detail')
  }
}
