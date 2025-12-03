export type NotificationType =
  | 'new_application'
  | 'new_message'
  | 'contract_request'
  | 'contract_approved'

export interface Notification {
  notificationId: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  relatedId?: string
  isRead: boolean
  createdAt: string
}
