import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'
import { createNotification } from '../../utils/notifications.js'
import { v4 as uuidv4 } from 'uuid'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const CONTRACTS_TABLE = process.env.CONTRACTS_TABLE!
const USERS_TABLE = process.env.USERS_TABLE!
const JOBS_TABLE = process.env.JOBS_TABLE!
const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE!
const MESSAGES_TABLE = process.env.MESSAGES_TABLE!

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

    // Verify user is the one who needs to approve
    if (userType === 'engineer' && userId !== contract.engineerId) {
      return errorResponse('You are not authorized to approve this contract', 403)
    }

    if (userType === 'company' && userId !== contract.companyId) {
      return errorResponse('You are not authorized to approve this contract', 403)
    }

    // Check if contract is in pending status for this user
    if (userType === 'engineer' && contract.status !== 'pending_engineer') {
      return errorResponse('This contract is not pending your approval', 400)
    }

    if (userType === 'company' && contract.status !== 'pending_company') {
      return errorResponse('This contract is not pending your approval', 400)
    }

    // Check if already approved by this user
    if (
      (userType === 'engineer' && contract.approvedByEngineer) ||
      (userType === 'company' && contract.approvedByCompany)
    ) {
      return errorResponse('You have already approved this contract', 400)
    }

    // Update contract with approval
    const now = new Date().toISOString()
    const updateExpressions: string[] = []
    const expressionAttributeValues: Record<string, any> = {
      ':now': now,
    }

    if (userType === 'engineer') {
      // 技術者が承認した時点で決済完了とする（手数料のみの支払いのため）
      updateExpressions.push('approvedByEngineer = :now')
      updateExpressions.push('#status = :paid')
      updateExpressions.push('paidAt = :now')
      expressionAttributeValues[':paid'] = 'paid'

      console.log(`[DEMO] Contract ${contractId} approved by engineer - automatically marked as paid`)
      console.log(`[DEMO] Platform fee (${contract.feePercentage}%): ¥${contract.feeAmount.toLocaleString()}`)
    } else {
      // 企業が承認した場合は技術者の承認待ち
      updateExpressions.push('approvedByCompany = :now')
      updateExpressions.push('#status = :pending_engineer')
      expressionAttributeValues[':pending_engineer'] = 'pending_engineer'
    }

    updateExpressions.push('updatedAt = :now')

    await docClient.send(
      new UpdateCommand({
        TableName: CONTRACTS_TABLE,
        Key: { contractId },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: expressionAttributeValues,
      })
    )

    // 技術者が承認した場合（決済完了）、案件ステータスを'closed'に更新
    // 企業が承認した場合は、まだ技術者承認待ちなので案件ステータスは更新しない
    if (userType === 'engineer') {
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
    }

    // Get updated contract
    const updatedContractResult = await docClient.send(
      new GetCommand({
        TableName: CONTRACTS_TABLE,
        Key: { contractId },
      })
    )

    // Create notification for the other party
    const recipientId = userType === 'engineer' ? contract.companyId : contract.engineerId
    const status = userType === 'engineer' ? 'paid' : 'pending_engineer'

    if (status === 'paid') {
      // Engineer approved - payment completed
      await createNotification({
        userId: recipientId,
        type: 'contract_approved',
        title: 'オファーが承認されました',
        message: 'オファー承認が完了し、契約が成立しました',
        link: `/contracts/${contractId}`,
        relatedId: contractId,
      })

      // Send automatic message to conversation when engineer approves
      try {
        // Find conversation by applicationId
        const conversationResult = await docClient.send(
          new QueryCommand({
            TableName: CONVERSATIONS_TABLE,
            IndexName: 'applicationId-index',
            KeyConditionExpression: 'applicationId = :applicationId',
            ExpressionAttributeValues: {
              ':applicationId': contract.applicationId,
            },
          })
        )

        if (conversationResult.Items && conversationResult.Items.length > 0) {
          const conversation = conversationResult.Items[0]
          const messageId = uuidv4()
          const messageContent = `オファーを承認しました。契約が成立しましたので、今後の詳細についてご相談させていただければと思います。よろしくお願いいたします。`

          // Create message
          await docClient.send(
            new PutCommand({
              TableName: MESSAGES_TABLE,
              Item: {
                messageId,
                conversationId: conversation.conversationId,
                senderId: userId,
                senderType: userType,
                content: messageContent,
                isRead: false,
                createdAt: now,
              },
            })
          )

          // Update conversation with last message time and unread count
          const unreadField = userType === 'engineer' ? 'unreadCountCompany' : 'unreadCountEngineer'
          await docClient.send(
            new UpdateCommand({
              TableName: CONVERSATIONS_TABLE,
              Key: { conversationId: conversation.conversationId },
              UpdateExpression: `SET lastMessageAt = :now, ${unreadField} = ${unreadField} + :inc`,
              ExpressionAttributeValues: {
                ':now': now,
                ':inc': 1,
              },
            })
          )

          console.log(`Automatic message sent to conversation ${conversation.conversationId} for contract approval`)
        }
      } catch (messageError) {
        console.error('Error sending automatic approval message:', messageError)
        // Don't fail the entire request if message sending fails
      }
    } else {
      // Company approved - waiting for engineer
      await createNotification({
        userId: recipientId,
        type: 'contract_request',
        title: '新しいオファー申請が届きました',
        message: 'オファー申請の確認をお願いします',
        link: `/contracts/${contractId}`,
        relatedId: contractId,
      })
    }

    return successResponse(updatedContractResult.Item)
  } catch (error) {
    console.error('Error approving contract:', error)
    return errorResponse('Failed to approve contract')
  }
}
