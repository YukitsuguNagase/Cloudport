export type JobDurationType = 'short' | 'long' | 'spot'
export type JobStatus = 'open' | 'closed' | 'filled'

export interface JobRequirements {
  awsServices: string[]
  certifications?: string[]
  experience?: string
}

export interface JobDuration {
  type: JobDurationType
  months?: number
}

export interface JobBudget {
  min?: number
  max?: number
}

export interface Job {
  jobId: string
  companyId: string
  title: string
  description: string
  requirements: JobRequirements
  duration: JobDuration
  budget?: JobBudget
  status: JobStatus
  applicationCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateJobInput {
  title: string
  description: string
  requirements: JobRequirements
  duration: JobDuration
  budget?: JobBudget
}

export interface UpdateJobInput extends Partial<CreateJobInput> {
  status?: JobStatus
}
