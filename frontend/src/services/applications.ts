import apiClient from './api'
import {
  Application,
  CreateApplicationInput,
  UpdateApplicationStatusInput,
} from '../types/application'

export const applyToJob = async (
  jobId: string,
  data: CreateApplicationInput
): Promise<Application> => {
  const response = await apiClient.post(`/jobs/${jobId}/apply`, data)
  return response.data
}

export const getMyApplications = async (): Promise<Application[]> => {
  const response = await apiClient.get('/applications')
  return response.data
}

export const getJobApplications = async (jobId: string): Promise<Application[]> => {
  const response = await apiClient.get(`/jobs/${jobId}/applications`)
  return response.data
}

export const updateApplicationStatus = async (
  applicationId: string,
  data: UpdateApplicationStatusInput
): Promise<Application> => {
  const response = await apiClient.put(`/applications/${applicationId}/status`, data)
  return response.data
}
