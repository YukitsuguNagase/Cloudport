import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const CONTRACTS_TABLE = process.env.CONTRACTS_TABLE!
const USERS_TABLE = process.env.USERS_TABLE!
const JOBS_TABLE = process.env.JOBS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub
    const contractId = event.pathParameters?.contractId

    if (!userId) {
      return errorResponse('Unauthorized', 401)
    }

    if (!contractId) {
      return errorResponse('Contract ID is required', 400)
    }

    // Get user to determine user type
    const userResult = await docClient.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId },
      })
    )

    if (!userResult.Item) {
      return errorResponse('User not found', 404)
    }

    const userType = userResult.Item.userType

    // Get contract
    const contractResult = await docClient.send(
      new GetCommand({
        TableName: CONTRACTS_TABLE,
        Key: { contractId },
      })
    )

    if (!contractResult.Item) {
      return errorResponse('Contract not found', 404)
    }

    const contract = contractResult.Item

    // Verify that the user is part of this contract
    if (userType === 'engineer' && contract.engineerId !== userId) {
      return errorResponse('Forbidden', 403)
    }
    if (userType === 'company' && contract.companyId !== userId) {
      return errorResponse('Forbidden', 403)
    }

    // Enrich contract with job and other user info
    let jobTitle = '不明'
    let otherUser = null

    // Fetch job info
    try {
      const jobResult = await docClient.send(
        new GetCommand({
          TableName: JOBS_TABLE,
          Key: { jobId: contract.jobId },
        })
      )
      if (jobResult.Item?.title) {
        jobTitle = jobResult.Item.title
      }
    } catch (error) {
      console.error(`Error fetching job ${contract.jobId}:`, error)
    }

    // Fetch other user info
    try {
      const otherUserId = userType === 'engineer' ? contract.companyId : contract.engineerId
      const otherUserResult = await docClient.send(
        new GetCommand({
          TableName: USERS_TABLE,
          Key: { userId: otherUserId },
        })
      )

      if (otherUserResult.Item) {
        // 相手ユーザーの表示名を取得（技術者なら企業名、企業なら技術者名）
        let displayName = '不明'
        if (userType === 'engineer') {
          // 技術者から見た場合は企業名を表示
          displayName = otherUserResult.Item.profile?.companyName || otherUserResult.Item.email
        } else {
          // 企業から見た場合は技術者の表示名を表示
          displayName = otherUserResult.Item.profile?.displayName || otherUserResult.Item.email
        }

        otherUser = {
          userId: otherUserResult.Item.userId,
          displayName,
        }
      }
    } catch (error) {
      console.error(`Error fetching user ${userType === 'engineer' ? contract.companyId : contract.engineerId}:`, error)
    }

    const enrichedContract = {
      ...contract,
      jobTitle,
      otherUser,
    }

    return successResponse(enrichedContract)
  } catch (error) {
    console.error('Error getting contract detail:', error)
    return errorResponse('Failed to get contract detail')
  }
}
