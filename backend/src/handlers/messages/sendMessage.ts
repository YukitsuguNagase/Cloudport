import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'
import { v4 as uuidv4 } from 'uuid'
import { createNotification } from '../../utils/notifications.js'
import { sendEmail } from '../../utils/email.js'
import { newMessageEmail } from '../../utils/emailTemplates.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const MESSAGES_TABLE = process.env.MESSAGES_TABLE!
const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE!
const USERS_TABLE = process.env.USERS_TABLE!
const CONTRACTS_TABLE = process.env.CONTRACTS_TABLE!
const JOBS_TABLE = process.env.JOBS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const conversationId = event.pathParameters?.conversationId
    const userId = event.requestContext.authorizer?.claims?.sub

    if (!conversationId || !userId) {
      return errorResponse('Missing required parameters', 400)
    }

    if (!event.body) {
      return errorResponse('Request body is required', 400)
    }

    const { content } = JSON.parse(event.body)

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return errorResponse('Message content is required', 400)
    }

    // Get conversation to verify user is participant
    const conversationResult = await docClient.send(
      new GetCommand({
        TableName: CONVERSATIONS_TABLE,
        Key: { conversationId },
      })
    )

    if (!conversationResult.Item) {
      return errorResponse('Conversation not found', 404)
    }

    const conversation = conversationResult.Item

    // Verify user is participant
    if (userId !== conversation.engineerId && userId !== conversation.companyId) {
      return errorResponse('You are not authorized to send messages in this conversation', 403)
    }

    // Get user info to determine sender type
    const userResult = await docClient.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId },
      })
    )

    if (!userResult.Item) {
      return errorResponse('User not found', 404)
    }

    const senderType = userResult.Item.userType

    // Check if there's a pending payment contract blocking messages
    // Only block if company is trying to send to engineer
    if (senderType === 'company' && conversation.jobId) {
      const contractsResult = await docClient.send(
        new QueryCommand({
          TableName: CONTRACTS_TABLE,
          IndexName: 'CompanyIdIndex',
          KeyConditionExpression: 'companyId = :companyId',
          FilterExpression: 'jobId = :jobId AND engineerId = :engineerId AND #status = :pendingPayment',
          ExpressionAttributeNames: {
            '#status': 'status'
          },
          ExpressionAttributeValues: {
            ':companyId': conversation.companyId,
            ':jobId': conversation.jobId,
            ':engineerId': conversation.engineerId,
            ':pendingPayment': 'pending_payment'
          }
        })
      )

      if (contractsResult.Items && contractsResult.Items.length > 0) {
        return errorResponse('プラットフォーム手数料の決済が完了するまで、メッセージを送信できません', 403)
      }
    }

    // Create message
    const messageId = uuidv4()
    const now = new Date().toISOString()

    const message = {
      messageId,
      conversationId,
      senderId: userId,
      senderType,
      content: content.trim(),
      isRead: false,
      createdAt: now,
    }

    await docClient.send(
      new PutCommand({
        TableName: MESSAGES_TABLE,
        Item: message,
      })
    )

    // Update conversation lastMessageAt and increment unread count for the other user
    const updateExpression =
      senderType === 'engineer'
        ? 'SET lastMessageAt = :now, unreadCountCompany = unreadCountCompany + :inc'
        : 'SET lastMessageAt = :now, unreadCountEngineer = unreadCountEngineer + :inc'

    await docClient.send(
      new UpdateCommand({
        TableName: CONVERSATIONS_TABLE,
        Key: { conversationId },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: {
          ':now': now,
          ':inc': 1,
        },
      })
    )

    // Create notification for the recipient
    const recipientId = senderType === 'engineer' ? conversation.companyId : conversation.engineerId
    await createNotification({
      userId: recipientId,
      type: 'new_message',
      title: '新しいメッセージが届きました',
      message: content.trim().length > 50 ? content.trim().substring(0, 50) + '...' : content.trim(),
      link: `/messages/${conversationId}`,
      relatedId: messageId,
    })

    // Send email notification to recipient
    try {
      const [recipientResult, jobResult] = await Promise.all([
        docClient.send(
          new GetCommand({
            TableName: USERS_TABLE,
            Key: { userId: recipientId },
          })
        ),
        conversation.jobId
          ? docClient.send(
              new GetCommand({
                TableName: JOBS_TABLE,
                Key: { jobId: conversation.jobId },
              })
            )
          : Promise.resolve({ Item: null }),
      ])

      const recipient = recipientResult.Item
      const job = jobResult.Item

      if (recipient?.email) {
        const recipientName = recipient.displayName || recipient.companyName || recipient.email.split('@')[0]
        const senderName = userResult.Item.displayName || userResult.Item.companyName || userResult.Item.email?.split('@')[0] || '送信者'
        const jobTitle = job?.title || '案件'

        const template = newMessageEmail(recipientName, senderName, jobTitle, conversationId)
        await sendEmail({
          to: recipient.email,
          subject: template.subject,
          body: template.body,
        })
        console.log(`Message notification email sent to ${recipient.email}`)
      }
    } catch (emailError) {
      console.error('Error sending message notification email:', emailError)
      // Don't block the response
    }

    return successResponse(message)
  } catch (error) {
    console.error('Error sending message:', error)
    return errorResponse('Failed to send message')
  }
}
