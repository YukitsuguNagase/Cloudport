import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { successResponse, errorResponse } from '../../utils/response.js'
import { createNotification } from '../../utils/notifications.js'
import Payjp from 'payjp'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)
const secretsClient = new SecretsManagerClient({})

const CONTRACTS_TABLE = process.env.CONTRACTS_TABLE!
const PAYJP_SECRET_NAME = process.env.PAYJP_SECRET_NAME!
const ADMIN_EMAIL = 'yukinag@dotqinc.com'

let cachedPayjpKey: string | null = null

// Get PAY.JP secret key from Secrets Manager
async function getPayjpSecretKey(): Promise<string> {
  if (cachedPayjpKey) {
    return cachedPayjpKey
  }

  const response = await secretsClient.send(
    new GetSecretValueCommand({
      SecretId: PAYJP_SECRET_NAME,
    })
  )

  const secret = JSON.parse(response.SecretString!)
  const key: string = secret.secret_key
  cachedPayjpKey = key
  return key
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub
    const userEmail = event.requestContext.authorizer?.claims?.email
    const contractId = event.pathParameters?.contractId
    const body = JSON.parse(event.body || '{}')
    const { paymentId, reason } = body

    if (!userId || !userEmail) {
      return errorResponse('Unauthorized', 401)
    }

    // Check if user is admin
    if (userEmail !== ADMIN_EMAIL) {
      return errorResponse('Admin access required', 403)
    }

    if (!contractId) {
      return errorResponse('Missing contractId', 400)
    }

    if (!paymentId) {
      return errorResponse('Missing paymentId', 400)
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

    // Check if contract is paid
    if (contract.status !== 'paid') {
      return errorResponse('Contract is not in paid status', 400)
    }

    // Check if payment ID matches
    if (contract.paymentId !== paymentId) {
      return errorResponse('Payment ID does not match contract', 400)
    }

    // Check if already refunded
    if (contract.refundedAt) {
      return errorResponse('This contract has already been refunded', 400)
    }

    const now = new Date().toISOString()

    // Get PAY.JP secret key from Secrets Manager
    const payjpSecretKey = await getPayjpSecretKey()
    const payjp = Payjp(payjpSecretKey)

    // First, check the current status of the charge from PAY.JP
    let charge: any
    let refundId: string | undefined
    let isAlreadyRefunded = false

    try {
      console.log(`Checking charge status for contract ${contractId}`)
      console.log(`Payment ID: ${paymentId}`)

      // Get current charge status
      charge = await payjp.charges.retrieve(paymentId)
      console.log('Current charge status:', JSON.stringify(charge, null, 2))

      // Check if already refunded
      if (charge.refunded) {
        console.log('Charge is already refunded on PAY.JP')
        isAlreadyRefunded = true

        // Try to get refund ID from charge object
        if (charge.refunds && charge.refunds.data && charge.refunds.data.length > 0) {
          refundId = charge.refunds.data[0].id
          console.log(`Found refund ID: ${refundId}`)
        } else {
          // If refunds array is not available, use a placeholder
          // This is acceptable because the charge is already refunded on PAY.JP
          console.log('Refunds array not in charge object, using placeholder refund ID')
          refundId = `re_from_charge_${paymentId}`
        }
      }
    } catch (retrieveError: any) {
      console.error('Error retrieving charge:', retrieveError)
      return errorResponse('Failed to retrieve charge information', 500)
    }

    // Process refund with PAY.JP if not already refunded
    if (!isAlreadyRefunded) {
      try {
        console.log(`Processing PAY.JP refund for contract ${contractId}`)
        console.log(`Refund Amount: ¥${contract.feeAmount.toLocaleString()}`)

        // Refund the charge (full refund)
        // PAY.JP charges.refund() returns the updated charge object
        charge = await payjp.charges.refund(paymentId)

        console.log('Charge after refund:', JSON.stringify(charge, null, 2))

        // Get the latest refund ID from the charge object
        if (charge.refunds && charge.refunds.data && charge.refunds.data.length > 0) {
          // Get the most recent refund
          refundId = charge.refunds.data[0].id
          console.log(`PAY.JP refund completed: ${refundId}`)
        } else {
          throw new Error('Refund was not created')
        }
      } catch (payjpError: any) {
      console.error('PAY.JP refund error:', payjpError)
      console.error('PAY.JP error details:', JSON.stringify(payjpError, null, 2))

      // Extract detailed error message and code from PAY.JP
      let errorMessage = 'Refund processing failed'
      let statusCode = 402

      if (payjpError.status && payjpError.response?.text) {
        try {
          const errorData = JSON.parse(payjpError.response.text)
          if (errorData.error) {
            errorMessage = errorData.error.message || errorMessage
            statusCode = errorData.error.status || payjpError.status

            // If already refunded, return appropriate status
            if (errorData.error.code === 'already_refunded') {
              statusCode = 400
            }
          }
        } catch (parseError) {
          console.error('Error parsing PAY.JP error response:', parseError)
        }
      } else if (payjpError.message) {
        errorMessage = payjpError.message
      }

      return errorResponse(errorMessage, statusCode)
      }
    }

    // Ensure refundId is set
    if (!refundId) {
      console.error('Refund ID not found')
      return errorResponse('Refund ID not found', 500)
    }

    // Update contract with refund information
    await docClient.send(
      new UpdateCommand({
        TableName: CONTRACTS_TABLE,
        Key: { contractId },
        UpdateExpression: 'SET #status = :refunded, refundedAt = :now, refundId = :refundId, refundReason = :reason, updatedAt = :now',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':refunded': 'refunded',
          ':now': now,
          ':refundId': refundId,
          ':reason': reason || 'Admin refund',
        },
      })
    )

    // Create notifications for both company and engineer
    await Promise.all([
      createNotification({
        userId: contract.companyId,
        type: 'refund_processed',
        title: '返金が処理されました',
        message: `契約ID: ${contractId} の手数料が返金されました`,
        link: `/contracts/${contractId}`,
        relatedId: contractId,
      }),
      createNotification({
        userId: contract.engineerId,
        type: 'refund_processed',
        title: '契約が返金されました',
        message: `契約ID: ${contractId} が返金処理されました`,
        link: `/contracts/${contractId}`,
        relatedId: contractId,
      }),
    ])

    // Get updated contract
    const updatedContractResult = await docClient.send(
      new GetCommand({
        TableName: CONTRACTS_TABLE,
        Key: { contractId },
      })
    )

    return successResponse({
      ...updatedContractResult.Item,
      refundMessage: isAlreadyRefunded
        ? '返金済みの取引でした。ステータスを更新しました。'
        : '返金処理が完了しました',
    })
  } catch (error) {
    console.error('Error processing refund:', error)
    return errorResponse('Failed to process refund')
  }
}
