import { Notification } from '../types/notification'

const API_URL = import.meta.env.VITE_API_BASE_URL

export const getNotifications = async (idToken: string): Promise<Notification[]> => {
  const response = await fetch(`${API_URL}/notifications`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    let errorMessage = '通知の取得に失敗しました'
    try {
      const error = await response.json()
      errorMessage = error.message || errorMessage
    } catch {
      // JSON parse failed, use default message
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

export const markAsRead = async (
  idToken: string,
  notificationId: string
): Promise<Notification> => {
  const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    let errorMessage = '通知の既読設定に失敗しました'
    try {
      const error = await response.json()
      errorMessage = error.message || errorMessage
    } catch {
      // JSON parse failed, use default message
    }
    throw new Error(errorMessage)
  }

  return response.json()
}
