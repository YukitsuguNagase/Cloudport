import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { docClient, TABLE_NAMES, PutCommand, GetCommand } from '../../utils/dynamodb.js'
import { successResponse, errorResponse } from '../../utils/response.js'
import { getUserFromEvent } from '../../utils/auth.js'
import { createNotification } from '../../utils/notifications.js'
import { v4 as uuidv4 } from 'uuid'
import { Scout } from '../../models/Scout.js'

interface SendScoutInput {
  jobId: string
  engineerId: string
  message: string
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // 認証チェック
    const user = getUserFromEvent(event)
    if (!user || user.userType !== 'company') {
      return errorResponse('Unauthorized', 401)
    }
    const userId = user.userId

    // リクエストボディを解析
    if (!event.body) {
      return errorResponse('Missing request body', 400)
    }

    const { jobId, engineerId, message }: SendScoutInput = JSON.parse(event.body)

    // バリデーション
    if (!jobId || !engineerId || !message) {
      return errorResponse('Missing required fields', 400)
    }

    if (message.trim().length < 10) {
      return errorResponse('Message must be at least 10 characters', 400)
    }

    // 案件が存在し、かつリクエストユーザーが所有者であることを確認
    const jobResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAMES.JOBS,
        Key: { jobId },
      })
    )

    if (!jobResult.Item) {
      return errorResponse('Job not found', 404)
    }

    if (jobResult.Item.companyId !== userId) {
      return errorResponse('You are not authorized to scout for this job', 403)
    }

    // エンジニアが存在することを確認
    const engineerResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAMES.USERS,
        Key: { userId: engineerId },
      })
    )

    if (!engineerResult.Item) {
      return errorResponse('Engineer not found', 404)
    }

    if (engineerResult.Item.userType !== 'engineer') {
      return errorResponse('Target user is not an engineer', 400)
    }

    // 会話を作成
    const conversationId = uuidv4()
    const now = new Date().toISOString()

    const conversation = {
      conversationId,
      jobId,
      engineerId,
      companyId: userId,
      lastMessageAt: now,
      unreadCountEngineer: 1, // スカウトメッセージが未読
      unreadCountCompany: 0,
      isScout: true, // スカウトによる会話であることを示すフラグ
      createdAt: now,
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAMES.CONVERSATIONS,
        Item: conversation,
      })
    )

    // スカウトメッセージを送信
    const messageId = uuidv4()
    const scoutMessage = {
      messageId,
      conversationId,
      senderId: userId,
      content: message,
      isRead: false,
      createdAt: now,
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAMES.MESSAGES,
        Item: scoutMessage,
      })
    )

    // スカウトレコードを保存
    const scoutId = uuidv4()
    const scout: Scout = {
      scoutId,
      jobId,
      engineerId,
      companyId: userId,
      message: message.trim(),
      conversationId,
      createdAt: now,
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAMES.SCOUTS,
        Item: scout,
      })
    )

    // エンジニアに通知を送信
    try {
      const jobTitle = jobResult.Item.title
      await createNotification({
        userId: engineerId,
        type: 'scout_received',
        title: 'スカウトが届きました',
        message: `案件「${jobTitle}」からスカウトが届きました`,
        relatedId: conversationId,
      })
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError)
      // 通知の失敗はスカウト送信全体の失敗とはしない
    }

    return successResponse(scout)
  } catch (error) {
    console.error('Error sending scout:', error)
    return errorResponse('Failed to send scout')
  }
}
