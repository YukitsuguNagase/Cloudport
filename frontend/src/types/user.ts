export type UserType = 'engineer' | 'company'

export interface UserProfile {
  name: string
  company?: string
  awsCertifications?: string[]
  skills?: string[]
  experience?: string
  availableHours?: number
  hourlyRate?: number
}

export interface User {
  userId: string
  email: string
  userType: UserType
  profile: UserProfile
  createdAt: string
  updatedAt: string
}
