export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

export interface Application {
  applicationId: string
  jobId: string
  engineerId: string
  message: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
}

export interface CreateApplicationInput {
  jobId: string
  message: string
}

export interface UpdateApplicationStatusInput {
  status: ApplicationStatus
}
