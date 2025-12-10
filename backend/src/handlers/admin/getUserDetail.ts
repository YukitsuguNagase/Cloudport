import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const USERS_TABLE = process.env.USERS_TABLE!
const JOBS_TABLE = process.env.JOBS_TABLE!
const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE!
const CONTRACTS_TABLE = process.env.CONTRACTS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId
    const requestingUserId = event.requestContext.authorizer?.claims?.sub

    if (!userId) {
      return errorResponse('User ID is required', 400)
    }

    // Get requesting user to check if admin
    const requestingUserResult = await docClient.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId: requestingUserId },
      })
    )

    // Check if requesting user is admin
    if (requestingUserResult.Item?.email !== 'yukinag@dotqinc.com') {
      return errorResponse('Admin access required', 403)
    }

    // Get target user details
    const userResult = await docClient.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId },
      })
    )

    if (!userResult.Item) {
      return errorResponse('User not found', 404)
    }

    const user = userResult.Item

    // Get user stats based on user type
    let stats: any = {
      jobsPosted: 0,
      applicationsSubmitted: 0,
      contractsCompleted: 0,
      totalEarnings: 0,
      totalSpent: 0,
    }

    if (user.userType === 'company') {
      // Get jobs posted by company
      const jobsResult = await docClient.send(
        new QueryCommand({
          TableName: JOBS_TABLE,
          IndexName: 'CompanyIdIndex',
          KeyConditionExpression: 'companyId = :companyId',
          ExpressionAttributeValues: {
            ':companyId': userId,
          },
        })
      )
      stats.jobsPosted = jobsResult.Items?.length || 0

      // Get contracts where company is involved
      const contractsResult = await docClient.send(
        new QueryCommand({
          TableName: CONTRACTS_TABLE,
          IndexName: 'CompanyIdIndex',
          KeyConditionExpression: 'companyId = :companyId',
          ExpressionAttributeValues: {
            ':companyId': userId,
          },
        })
      )

      const contracts = contractsResult.Items || []
      stats.contractsCompleted = contracts.filter((c: any) => c.status === 'completed').length
      stats.totalSpent = contracts
        .filter((c: any) => c.status === 'completed' || c.status === 'paid')
        .reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
    } else if (user.userType === 'engineer') {
      // Get applications submitted by engineer
      const applicationsResult = await docClient.send(
        new QueryCommand({
          TableName: APPLICATIONS_TABLE,
          IndexName: 'EngineerIdIndex',
          KeyConditionExpression: 'engineerId = :engineerId',
          ExpressionAttributeValues: {
            ':engineerId': userId,
          },
        })
      )
      stats.applicationsSubmitted = applicationsResult.Items?.length || 0

      // Get contracts where engineer is involved
      const contractsResult = await docClient.send(
        new QueryCommand({
          TableName: CONTRACTS_TABLE,
          IndexName: 'EngineerIdIndex',
          KeyConditionExpression: 'engineerId = :engineerId',
          ExpressionAttributeValues: {
            ':engineerId': userId,
          },
        })
      )

      const contracts = contractsResult.Items || []
      stats.contractsCompleted = contracts.filter((c: any) => c.status === 'completed').length
      stats.totalEarnings = contracts
        .filter((c: any) => c.status === 'completed' || c.status === 'paid')
        .reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
    }

    // Prepare response
    const userDetail = {
      userId: user.userId,
      email: user.email,
      userType: user.userType,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      lastLoginIp: user.lastLoginIp,
      loginCount: user.loginCount || 0,
      mfaEnabled: user.mfaEnabled || false,
      accountStatus: user.accountStatus || 'active',
      profile: user.profile || {},
      stats,
    }

    return successResponse(userDetail)
  } catch (error) {
    console.error('Error getting user detail:', error)
    return errorResponse('Failed to get user detail')
  }
}
