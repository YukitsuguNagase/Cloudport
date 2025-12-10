import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { successResponse, errorResponse } from '../../utils/response.js'
import { createNotification } from '../../utils/notifications.js'
import Payjp from 'payjp'
import { sendEmail } from '../../utils/email.js'
import { paymentCompletedEmailForCompany, paymentCompletedEmailForEngineer } from '../../utils/emailTemplates.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)
const secretsClient = new SecretsManagerClient({})

const CONTRACTS_TABLE = process.env.CONTRACTS_TABLE!
const USERS_TABLE = process.env.USERS_TABLE!
const JOBS_TABLE = process.env.JOBS_TABLE!
const PAYJP_SECRET_NAME = process.env.PAYJP_SECRET_NAME!
const PAYMENT_ATTEMPTS_TABLE = process.env.PAYMENT_ATTEMPTS_TABLE!

const MAX_PAYMENT_ATTEMPTS = 5
const LOCKOUT_DURATION = 30 * 60 // 30 minutes in seconds

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

// Check if user has too many failed payment attempts
async function checkPaymentAttempts(userId: string): Promise<{ allowed: boolean; remainingMinutes?: number }> {
  const now = Math.floor(Date.now() / 1000)

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: PAYMENT_ATTEMPTS_TABLE,
        Key: { userId },
      })
    )

    if (!result.Item) {
      return { allowed: true }
    }

    const { failedAttempts, lockedUntil } = result.Item

    // Check if currently locked
    if (lockedUntil && lockedUntil > now) {
      const remainingSeconds = lockedUntil - now
      const remainingMinutes = Math.ceil(remainingSeconds / 60)
      return { allowed: false, remainingMinutes }
    }

    // Check if too many attempts
    if (failedAttempts >= MAX_PAYMENT_ATTEMPTS) {
      // Lock the account
      await docClient.send(
        new UpdateCommand({
          TableName: PAYMENT_ATTEMPTS_TABLE,
          Key: { userId },
          UpdateExpression: 'SET lockedUntil = :lockedUntil, #ttl = :ttl',
          ExpressionAttributeNames: {
            '#ttl': 'ttl',
          },
          ExpressionAttributeValues: {
            ':lockedUntil': now + LOCKOUT_DURATION,
            ':ttl': now + LOCKOUT_DURATION + 86400, // TTL: 24 hours after unlock
          },
        })
      )
      const remainingMinutes = Math.ceil(LOCKOUT_DURATION / 60)
      return { allowed: false, remainingMinutes }
    }

    return { allowed: true }
  } catch (error) {
    console.error('Error checking payment attempts:', error)
    // Don't block on error
    return { allowed: true }
  }
}

// Record failed payment attempt
async function recordFailedPayment(userId: string, errorMessage: string, contractId: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000)

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: PAYMENT_ATTEMPTS_TABLE,
        Key: { userId },
      })
    )

    if (result.Item) {
      // Increment existing attempts
      await docClient.send(
        new UpdateCommand({
          TableName: PAYMENT_ATTEMPTS_TABLE,
          Key: { userId },
          UpdateExpression:
            'SET failedAttempts = failedAttempts + :inc, lastFailedAt = :now, lastErrorMessage = :error, lastContractId = :contractId, #ttl = :ttl',
          ExpressionAttributeNames: {
            '#ttl': 'ttl',
          },
          ExpressionAttributeValues: {
            ':inc': 1,
            ':now': now,
            ':error': errorMessage,
            ':contractId': contractId,
            ':ttl': now + 86400, // TTL: 24 hours
          },
        })
      )
    } else {
      // Create new record
      await docClient.send(
        new PutCommand({
          TableName: PAYMENT_ATTEMPTS_TABLE,
          Item: {
            userId,
            failedAttempts: 1,
            lastFailedAt: now,
            lastErrorMessage: errorMessage,
            lastContractId: contractId,
            ttl: now + 86400, // TTL: 24 hours
          },
        })
      )
    }

    console.log(`Failed payment attempt recorded for user ${userId}`)
  } catch (error) {
    console.error('Error recording failed payment:', error)
    // Don't throw - recording failure shouldn't block the response
  }
}

// Clear payment attempts on successful payment
async function clearPaymentAttempts(userId: string): Promise<void> {
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: PAYMENT_ATTEMPTS_TABLE,
        Key: { userId },
        UpdateExpression: 'SET failedAttempts = :zero, lockedUntil = :null',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':null': null,
        },
      })
    )
    console.log(`Payment attempts cleared for user ${userId}`)
  } catch (error) {
    console.error('Error clearing payment attempts:', error)
    // Don't throw
  }
}

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

    // Check if user has too many failed payment attempts
    const attemptCheck = await checkPaymentAttempts(userId)
    if (!attemptCheck.allowed) {
      console.log(`Payment blocked for user ${userId} due to too many failed attempts`)
      return errorResponse(
        `決済試行回数の上限に達しました。${attemptCheck.remainingMinutes}分後に再度お試しください。`,
        429
      )
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

    // Get PAY.JP secret key from Secrets Manager
    const payjpSecretKey = await getPayjpSecretKey()
    const payjp = Payjp(payjpSecretKey)

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

      // Record failed payment attempt
      const errorMessage = payjpError.message || 'Payment processing failed'
      await recordFailedPayment(userId, errorMessage, contractId)

      return errorResponse(errorMessage, 402)
    }

    // Clear failed payment attempts on successful payment
    await clearPaymentAttempts(userId)

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

    const updatedContract = updatedContractResult.Item!

    // Send email notifications to both parties
    try {
      const [companyResult, engineerResult, jobResult] = await Promise.all([
        docClient.send(
          new GetCommand({
            TableName: USERS_TABLE,
            Key: { userId: updatedContract.companyId },
          })
        ),
        docClient.send(
          new GetCommand({
            TableName: USERS_TABLE,
            Key: { userId: updatedContract.engineerId },
          })
        ),
        docClient.send(
          new GetCommand({
            TableName: JOBS_TABLE,
            Key: { jobId: updatedContract.jobId },
          })
        ),
      ])

      const company = companyResult.Item
      const engineer = engineerResult.Item
      const job = jobResult.Item

      const companyName = company?.displayName || company?.companyName || company?.email?.split('@')[0] || '企業'
      const engineerName = engineer?.displayName || engineer?.name || engineer?.email?.split('@')[0] || 'エンジニア'
      const jobTitle = job?.title || '案件'

      // Send to company
      if (company?.email) {
        const template = paymentCompletedEmailForCompany(companyName, engineerName, jobTitle, updatedContract.contractAmount, contractId)
        await sendEmail({
          to: company.email,
          subject: template.subject,
          body: template.body,
        })
        console.log(`Payment completed email sent to company ${company.email}`)
      }

      // Send to engineer
      if (engineer?.email) {
        const template = paymentCompletedEmailForEngineer(engineerName, companyName, jobTitle, updatedContract.contractAmount, contractId)
        await sendEmail({
          to: engineer.email,
          subject: template.subject,
          body: template.body,
        })
        console.log(`Payment completed email sent to engineer ${engineer.email}`)
      }
    } catch (emailError) {
      console.error('Error sending payment completed emails:', emailError)
      // Don't block the response
    }

    return successResponse({
      ...updatedContractResult.Item,
      paymentMessage: 'プラットフォーム手数料の支払いが完了しました。技術者への契約金額のお支払いは直接行ってください。',
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    return errorResponse('Failed to process payment')
  }
}
