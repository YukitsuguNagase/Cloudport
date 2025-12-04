import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const NOTIFICATIONS_TABLE = process.env.NOTIFICATIONS_TABLE!

export type NotificationType =
  | 'new_application'      // 新規応募
  | 'new_message'          // 新規メッセージ
  | 'contract_request'     // 契約申請
  | 'contract_approved'    // 契約承認
  | 'payment_completed'    // 決済完了
  | 'scout_received'       // スカウト受信

export interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  relatedId?: string  // 関連するID (jobId, conversationId, contractIdなど)
}

export const createNotification = async (params: CreateNotificationParams): Promise<void> => {
  const { userId, type, title, message, link, relatedId } = params

  const notification = {
    notificationId: uuidv4(),
    userId,
    type,
    title,
    message,
    link,
    relatedId,
    isRead: false,
    createdAt: new Date().toISOString(),
  }

  try {
    await docClient.send(
      new PutCommand({
        TableName: NOTIFICATIONS_TABLE,
        Item: notification,
      })
    )
    console.log(`Notification created for user ${userId}: ${type}`)
  } catch (error) {
    console.error('Error creating notification:', error)
    // 通知の作成失敗はメインの処理に影響を与えないようにする
  }
}
