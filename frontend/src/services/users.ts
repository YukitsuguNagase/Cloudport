import apiClient from './api'
import { User, UserProfile } from '../types/user'

export const getMyProfile = async (): Promise<User> => {
  const response = await apiClient.get('/users/me')
  return response.data
}

export const updateProfile = async (profile: Partial<UserProfile>): Promise<User> => {
  const response = await apiClient.put('/users/me', { profile })
  return response.data
}
