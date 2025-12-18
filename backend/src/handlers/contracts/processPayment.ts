import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'
import { createNotification } from '../../utils/notifications.js'
import { sendEmail } from '../../utils/email.js'
import { paymentCompletedEmailForCompany, paymentCompletedEmailForEngineer } from '../../utils/emailTemplates.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const CONTRACTS_TABLE = process.env.CONTRACTS_TABLE!
const USERS_TABLE = process.env.USERS_TABLE!
const JOBS_TABLE = process.env.JOBS_TABLE!
const NOTIFICATIONS_TABLE = process.env.NOTIFICATIONS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub
    const userEmail = event.requestContext.authorizer?.claims?.email

    if (!userId) {
      return errorResponse('Unauthorized', 401)
    }

    const contractId = event.pathParameters?.contractId
    if (!contractId) {
      return errorResponse('Contract ID is required', 400)
    }

    const body = JSON.parse(event.body || '{}')
    const { paymentInfo } = body

    if (!paymentInfo || !paymentInfo.method) {
      return errorResponse('Payment information is required', 400)
    }

    // Get contract
    const contractResult = await docClient.send(
      new GetCommand({
        TableName: CONTRACTS_TABLE,
        Key: { contractId },
      })
    )

    const contract = contractResult.Item
    if (!contract) {
      return errorResponse('Contract not found', 404)
    }

    // Verify the user is the company
    if (contract.companyId !== userId) {
      return errorResponse('Only the company can process payment', 403)
    }

    // Check if already paid
    if (contract.paidAt) {
      return errorResponse('This contract has already been paid', 400)
    }

    const now = new Date().toISOString()

    // Update contract status to paid
    const updatedContractResult = await docClient.send(
      new UpdateCommand({
        TableName: CONTRACTS_TABLE,
        Key: { contractId },
        UpdateExpression:
          'SET #status = :status, paidAt = :paidAt, updatedAt = :updatedAt, paymentMethod = :paymentMethod, paymentNote = :paymentNote',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'paid',
          ':paidAt': now,
          ':updatedAt': now,
          ':paymentMethod': paymentInfo.method,
          ':paymentNote': paymentInfo.note || '',
        },
        ReturnValues: 'ALL_NEW',
      })
    )

    // Get user details for notifications
    const [engineerResult, companyResult, jobResult] = await Promise.all([
      docClient.send(
        new GetCommand({
          TableName: USERS_TABLE,
          Key: { userId: contract.engineerId },
        })
      ),
      docClient.send(
        new GetCommand({
          TableName: USERS_TABLE,
          Key: { userId: contract.companyId },
        })
      ),
      docClient.send(
        new GetCommand({
          TableName: JOBS_TABLE,
          Key: { jobId: contract.jobId },
        })
      ),
    ])

    const engineer = engineerResult.Item
    const company = companyResult.Item
    const job = jobResult.Item

    // Send notifications
    await Promise.all([
      createNotification({
        userId: contract.engineerId,
        type: 'payment_completed',
        title: '手数料の支払いが完了しました',
        message: `${job?.title || '案件'}の手数料支払いが完了しました。`,
        relatedId: contractId,
      }),
      createNotification({
        userId: contract.companyId,
        type: 'payment_completed',
        title: '手数料の支払いを記録しました',
        message: `${job?.title || '案件'}の手数料支払いを記録しました。`,
        relatedId: contractId,
      }),
    ])

    // Send emails
    if (engineer?.email) {
      try {
        const emailTemplate = paymentCompletedEmailForEngineer(
          engineer.profile?.fullName || engineer.email,
          company?.companyProfile?.companyName || company?.email || '企業',
          job?.title || '案件',
          contract.contractAmount,
          contractId
        )
        await sendEmail({
          to: engineer.email,
          subject: emailTemplate.subject,
          body: emailTemplate.body,
        })
      } catch (emailError) {
        console.error('Failed to send email to engineer:', emailError)
      }
    }

    if (company?.email) {
      try {
        const emailTemplate = paymentCompletedEmailForCompany(
          company.companyProfile?.companyName || company.email,
          engineer?.profile?.fullName || engineer?.email || 'エンジニア',
          job?.title || '案件',
          contract.feeAmount,
          contractId
        )
        await sendEmail({
          to: company.email,
          subject: emailTemplate.subject,
          body: emailTemplate.body,
        })
      } catch (emailError) {
        console.error('Failed to send email to company:', emailError)
      }
    }

    return successResponse({
      ...updatedContractResult.Attributes,
      paymentMessage: 'プラットフォーム手数料の支払いを記録しました。',
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    return errorResponse('Failed to process payment')
  }
}
