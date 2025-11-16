export type SenderType = 'engineer' | 'company'

export interface Message {
  messageId: string
  conversationId: string
  senderId: string
  senderType: SenderType
  content: string
  isRead: boolean
  createdAt: string
}

export interface Conversation {
  conversationId: string
  applicationId: string
  jobId: string
  engineerId: string
  companyId: string
  lastMessageAt: string
  unreadCountEngineer: number
  unreadCountCompany: number
  createdAt: string
}

export interface SendMessageInput {
  content: string
}
