import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'
import { createNotification } from '../../utils/notifications.js'
import Payjp from 'payjp'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const CONTRACTS_TABLE = process.env.CONTRACTS_TABLE!
const USERS_TABLE = process.env.USERS_TABLE!
const JOBS_TABLE = process.env.JOBS_TABLE!
const PAYJP_SECRET_KEY = process.env.PAYJP_SECRET_KEY!

// Initialize PAY.JP
const payjp = Payjp(PAYJP_SECRET_KEY)

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub
    const contractId = event.pathParameters?.contractId
    const body = JSON.parse(event.body || '{}')
    const { payjpToken } = body // PAY.JP token from frontend

    if (!userId) {
      return errorResponse('Unauthorized', 401)
    }

    if (!contractId) {
      return errorResponse('Missing contractId', 400)
    }

    if (!payjpToken) {
      return errorResponse('Missing payment token', 400)
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

    // Check if contract is waiting for payment
    if (contract.status !== 'pending_payment') {
      return errorResponse('Contract is not ready for payment', 400)
    }

    // Check if already paid
    if (contract.paidAt) {
      return errorResponse('This contract has already been paid', 400)
    }

    const now = new Date().toISOString()

    // Process payment with PAY.JP
    let charge
    try {
      console.log(`Processing PAY.JP payment for contract ${contractId}`)
      console.log(`Contract Amount: ¥${contract.contractAmount.toLocaleString()} (to be paid directly to engineer)`)
      console.log(`Platform Fee (${contract.feePercentage}%): ¥${contract.feeAmount.toLocaleString()}`)

      charge = await payjp.charges.create({
        amount: contract.feeAmount,
        currency: 'jpy',
        card: payjpToken,
        description: `プラットフォーム手数料 - Contract ${contractId}`,
        metadata: {
          contractId,
          companyId: contract.companyId,
          engineerId: contract.engineerId,
          jobId: contract.jobId,
        },
      })

      console.log(`PAY.JP charge created: ${charge.id}`)
    } catch (payjpError: any) {
      console.error('PAY.JP payment error:', payjpError)
      return errorResponse(
        payjpError.message || 'Payment processing failed',
        402
      )
    }

    // Update contract status to paid
    await docClient.send(
      new UpdateCommand({
        TableName: CONTRACTS_TABLE,
        Key: { contractId },
        UpdateExpression: 'SET #status = :paid, paidAt = :now, updatedAt = :now, paymentId = :paymentId, paymentMethod = :paymentMethod',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':paid': 'paid',
          ':now': now,
          ':paymentId': charge.id,
          ':paymentMethod': charge.card?.brand || 'unknown',
        },
      })
    )

    // Update job status to closed
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

    // Create notification for engineer
    await createNotification({
      userId: contract.engineerId,
      type: 'payment_completed',
      title: '決済が完了しました',
      message: 'プラットフォーム手数料の決済が完了し、契約が成立しました',
      link: `/contracts/${contractId}`,
      relatedId: contractId,
    })

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
