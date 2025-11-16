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
