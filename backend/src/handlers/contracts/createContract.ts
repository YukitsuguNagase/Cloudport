import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'
import { randomUUID } from 'crypto'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const CONTRACTS_TABLE = process.env.CONTRACTS_TABLE!
const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE!
const USERS_TABLE = process.env.USERS_TABLE!
const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub
    const body = JSON.parse(event.body || '{}')

    if (!userId) {
      return errorResponse('Unauthorized', 401)
    }

    const { applicationId, contractAmount, couponCode } = body

    if (!applicationId || !contractAmount) {
      return errorResponse('Missing required fields: applicationId, contractAmount', 400)
    }

    // 手数料率を計算（将来的にクーポン対応）
    let feePercentage = 10 // デフォルト手数料率: 10%

    // TODO: クーポン対応 - クーポンコードが提供された場合は手数料率を調整
    if (couponCode) {
      // const coupon = await validateCoupon(couponCode)
      // if (coupon && coupon.discountType === 'fee_reduction') {
      //   feePercentage = Math.max(0, feePercentage - coupon.discountValue)
      // }
      // 現在はクーポン機能未実装のため、エラーは出さずに無視
    }

    // Get application to verify it exists and get job/engineer/company IDs
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

    // Get user to determine initiator type
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

    // Verify user is either the engineer or company from this application
    const engineerId = application.engineerId
    const companyId = await getCompanyIdFromJob(application.jobId)

    if (userId !== engineerId && userId !== companyId) {
      return errorResponse('You are not authorized to create a contract for this application', 403)
    }

    // Check if contract already exists for this application
    const existingContractsResult = await docClient.send(
      new QueryCommand({
        TableName: CONTRACTS_TABLE,
        IndexName: userType === 'engineer' ? 'EngineerIdIndex' : 'CompanyIdIndex',
        KeyConditionExpression: userType === 'engineer' ? 'engineerId = :userId' : 'companyId = :userId',
        FilterExpression: 'applicationId = :applicationId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':applicationId': applicationId,
        },
      })
    )

    if (existingContractsResult.Items && existingContractsResult.Items.length > 0) {
      return errorResponse('Contract already exists for this application', 400)
    }

    // Calculate fee amount
    const feeAmount = Math.round((contractAmount * feePercentage) / 100)

    // Determine initial status based on who initiated
    const initiatedBy = userType
    const status = initiatedBy === 'engineer' ? 'pending_company' : 'pending_engineer'

    // Create contract
    const contractId = randomUUID()
    const now = new Date().toISOString()

    const contract = {
      contractId,
      applicationId,
      jobId: application.jobId,
      engineerId,
      companyId,
      status,
      initiatedBy,
      contractAmount,
      feePercentage,
      feeAmount,
      createdAt: now,
      updatedAt: now,
      // Set approval for initiator
      ...(initiatedBy === 'engineer' ? { approvedByEngineer: now } : { approvedByCompany: now }),
      // クーポンコードがあれば保存（将来の参照用）
      ...(couponCode ? { couponCode } : {}),
    }

    await docClient.send(
      new PutCommand({
        TableName: CONTRACTS_TABLE,
        Item: contract,
      })
    )

    return successResponse(contract)
  } catch (error) {
    console.error('Error creating contract:', error)
    return errorResponse('Failed to create contract')
  }
}

// Helper function to get company ID from job
async function getCompanyIdFromJob(jobId: string): Promise<string> {
  const JOBS_TABLE = process.env.JOBS_TABLE!
  const jobResult = await docClient.send(
    new GetCommand({
      TableName: JOBS_TABLE,
      Key: { jobId },
    })
  )

  if (!jobResult.Item) {
    throw new Error('Job not found')
  }

  return jobResult.Item.companyId
}
