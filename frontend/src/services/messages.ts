import apiClient from './api'
import { Conversation, Message, SendMessageInput } from '../types/message'

export const createConversation = async (applicationId: string): Promise<Conversation> => {
  const response = await apiClient.post(`/applications/${applicationId}/conversation`)
  return response.data
}

export const getConversation = async (conversationId: string): Promise<Conversation> => {
  const response = await apiClient.get(`/conversations/${conversationId}`)
  return response.data
}

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await apiClient.get('/conversations')
  return response.data
}

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const response = await apiClient.get(`/conversations/${conversationId}/messages`)
  return response.data
}

export const sendMessage = async (
  conversationId: string,
  data: SendMessageInput
): Promise<Message> => {
  const response = await apiClient.post(
    `/conversations/${conversationId}/messages`,
    data
  )
  return response.data
}

export const markAsRead = async (conversationId: string): Promise<void> => {
  await apiClient.put(`/conversations/${conversationId}/read`)
}

export const deleteConversation = async (conversationId: string): Promise<void> => {
  await apiClient.delete(`/conversations/${conversationId}`)
}
