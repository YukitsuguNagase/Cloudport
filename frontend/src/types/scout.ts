export interface EngineerSearchFilters {
  awsCertifications?: string[]
  preferredLocation?: string
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  minHourlyRate?: number
  maxHourlyRate?: number
  minMonthlyRate?: number
  maxMonthlyRate?: number
}

export interface EngineerSearchResult {
  userId: string
  displayName: string
  location?: string
  preferredLocation?: string
  certifications?: Array<{
    name: string
    obtainedAt: string
  }>
  skills?: Array<{
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }>
  hourlyRate?: {
    min?: number
    max?: number
    currency: string
  }
  desiredMonthlyRate?: {
    min?: number
    max?: number
    currency: string
  }
  avatar?: string
}

export interface SendScoutInput {
  jobId: string
  engineerId: string
  message: string
}

export interface Scout {
  scoutId: string
  jobId: string
  engineerId: string
  companyId: string
  message: string
  conversationId: string
  createdAt: string
}
