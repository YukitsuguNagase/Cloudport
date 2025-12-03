import apiClient from './api'
import { EngineerSearchFilters, EngineerSearchResult, SendScoutInput, Scout } from '../types/scout'

export const searchEngineers = async (
  filters: EngineerSearchFilters
): Promise<EngineerSearchResult[]> => {
  const response = await apiClient.post('/scouts/search', filters)
  return response.data
}

export const sendScout = async (data: SendScoutInput): Promise<Scout> => {
  const response = await apiClient.post('/scouts', data)
  return response.data
}

export const getScouts = async (): Promise<Scout[]> => {
  const response = await apiClient.get('/scouts')
  return response.data
}
