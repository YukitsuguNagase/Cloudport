import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { docClient, TABLE_NAMES, ScanCommand, GetCommand } from '../../utils/dynamodb.js'
import { successResponse, errorResponse } from '../../utils/response.js'
import { User, CompanyProfile } from '../../models/User.js'
import { Job } from '../../models/Job.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const params = {
      TableName: TABLE_NAMES.JOBS,
      FilterExpression: '#status = :open OR #status = :filled',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':open': 'open',
        ':filled': 'filled',
      },
    }

    const result = await docClient.send(new ScanCommand(params))
    const jobs = (result.Items || []) as Job[]

    // Fetch company names for each job
    const jobsWithCompanyName = await Promise.all(
      jobs.map(async (job) => {
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
            return {
              ...job,
              companyName: companyProfile.companyName,
            }
          }
          return job
        } catch (error) {
          console.error(`Failed to get company name for job ${job.jobId}:`, error)
          return job
        }
      })
    )

    return successResponse(jobsWithCompanyName)
  } catch (error) {
    console.error('Error getting jobs:', error)
    return errorResponse('Failed to get jobs')
  }
}
