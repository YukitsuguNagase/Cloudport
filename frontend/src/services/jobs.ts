import apiClient from './api'
import { Job, CreateJobInput, UpdateJobInput } from '../types/job'

export const getJobs = async (filters?: {
  status?: string
  awsServices?: string[]
  durationType?: string
}): Promise<Job[]> => {
  const response = await apiClient.get('/jobs', { params: filters })
  return response.data
}

export const getJobDetail = async (jobId: string): Promise<Job> => {
  const response = await apiClient.get(`/jobs/${jobId}`)
  return response.data
}

export const createJob = async (jobData: CreateJobInput): Promise<Job> => {
  const response = await apiClient.post('/jobs', jobData)
  return response.data
}

export const updateJob = async (
  jobId: string,
  jobData: UpdateJobInput
): Promise<Job> => {
  const response = await apiClient.put(`/jobs/${jobId}`, jobData)
  return response.data
}

export const deleteJob = async (jobId: string): Promise<void> => {
  await apiClient.delete(`/jobs/${jobId}`)
}
