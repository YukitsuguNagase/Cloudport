export type ApplicationStatus = 'pending' | 'interested' | 'passed'

export interface Application {
  applicationId: string
  jobId: string
  engineerId: string
  message: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
  engineerName?: string
}

export interface CreateApplicationInput {
  message: string
}

export interface UpdateApplicationStatusInput {
  status: ApplicationStatus
}
