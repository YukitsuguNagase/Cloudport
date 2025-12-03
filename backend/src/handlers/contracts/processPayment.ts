import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
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
      return errorResponse('Missing contractId', 400)
    }

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

    // Get user to verify they are the company
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

    // Only companies can process payment
    if (userType !== 'company') {
      return errorResponse('Only companies can process payment', 403)
    }

    // Verify user is the company from this contract
    if (userId !== contract.companyId) {
      return errorResponse('You are not authorized to process payment for this contract', 403)
    }

    // Check if contract is approved
    if (contract.status !== 'approved') {
      return errorResponse('Contract must be approved by both parties before payment', 400)
    }

    // Check if already paid
    if (contract.status === 'paid') {
      return errorResponse('This contract has already been paid', 400)
    }

    // Process payment (Demo - in production, integrate with Stripe/PayPal)
    const now = new Date().toISOString()

    // デモ用: 実際の支払い処理をシミュレート
    // 企業は手数料のみをプラットフォームに支払う
    // 技術者への契約金額の支払いは企業と技術者が直接行う（システム外）
    console.log(`[DEMO] Processing platform fee payment for contract ${contractId}`)
    console.log(`[DEMO] Contract Amount: ¥${contract.contractAmount.toLocaleString()} (paid directly to engineer outside the system)`)
    console.log(`[DEMO] Platform Fee (${contract.feePercentage}%): ¥${contract.feeAmount.toLocaleString()}`)

    // Update contract status to paid
    await docClient.send(
      new UpdateCommand({
        TableName: CONTRACTS_TABLE,
        Key: { contractId },
        UpdateExpression: 'SET #status = :paid, paidAt = :now, updatedAt = :now',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':paid': 'paid',
          ':now': now,
        },
      })
    )

    // 支払い完了後、案件ステータスを'closed'に更新（応募一覧から非表示にする）
    await docClient.send(
      new UpdateCommand({
        TableName: JOBS_TABLE,
        Key: { jobId: contract.jobId },
        UpdateExpression: 'SET #status = :closed, updatedAt = :now',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':closed': 'closed',
          ':now': now,
        },
      })
    )

    // Get updated contract
    const updatedContractResult = await docClient.send(
      new GetCommand({
        TableName: CONTRACTS_TABLE,
        Key: { contractId },
      })
    )

    return successResponse({
      ...updatedContractResult.Item,
      paymentMessage: 'プラットフォーム手数料の支払いが完了しました。技術者への契約金額のお支払いは直接行ってください。',
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    return errorResponse('Failed to process payment')
  }
}
