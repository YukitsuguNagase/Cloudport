import api from './api'

export interface PublicStats {
  engineersCount: number
  jobsCount: number
  matchRate: number
}

export const getPublicStats = async (): Promise<PublicStats> => {
  const response = await api.get<PublicStats>('/stats/public')
  return response.data
}
