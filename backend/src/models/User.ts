export type UserType = 'engineer' | 'company'

// Engineer Profile Types
export interface EngineerPrivateInfo {
  birthday?: string
  address?: {
    prefecture: string
    city: string
  }
  bankAccount?: {
    bankName: string
    branchName: string
    accountType: 'savings' | 'checking'
    accountNumber: string
    accountHolder: string
  }
  taxInfo?: {
    isDependant: boolean
    desiredDeductionType?: 'ko' | 'otsu'
  }
}

export interface EngineerProfile {
  privateInfo?: EngineerPrivateInfo
  displayName: string
  avatar?: string
  bio?: string
  location?: string
  preferredLocation?: string
  workStyle?: ('remote' | 'onsite' | 'hybrid')[]
  availableHours?: number
  hourlyRate?: {
    min?: number
    max?: number
    currency: string
  }
  certifications?: Array<{
    name: string
    obtainedAt: string
    certificationNumber?: string
  }>
  skills?: Array<{
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    experienceYears?: number
  }>
  experience?: Array<{
    title: string
    company?: string
    description: string
    startDate: string
    endDate?: string
    technologies?: string[]
  }>
  education?: Array<{
    school: string
    degree: string
    field?: string
    startYear: number
    endYear?: number
  }>
  portfolio?: Array<{
    title: string
    description: string
    url?: string
    imageUrl?: string
    technologies?: string[]
  }>
  languages?: Array<{
    language: string
    level: 'basic' | 'conversational' | 'business' | 'native'
  }>
  availability?: {
    startDate?: string
    status: 'available' | 'busy' | 'not_available'
  }
  socialLinks?: {
    github?: string
    linkedin?: string
    twitter?: string
    website?: string
  }
  rating?: {
    average: number
    count: number
    contractsCompleted: number
  }
  // 新規追加フィールド
  awsExperienceYears?: {
    service: string
    years: number
  }[]
  desiredMonthlyRate?: {
    min?: number
    max?: number
    currency: string
  }
  availableStartDate?: string
  pastProjects?: Array<{
    title: string
    description: string
    role: string
    period: string
    awsServices?: string[]
  }>
  platformRating?: {
    average: number
    count: number
    reviews?: Array<{
      companyId: string
      companyName: string
      rating: number
      comment?: string
      createdAt: string
    }>
  }
}

// Company Profile Types
export interface CompanyPrivateInfo {
  representativeName: string
  corporateNumber: string
  registeredAddress: {
    postalCode: string
    prefecture: string
    city: string
    streetAddress: string
    building?: string
  }
  invoiceRegistrationNumber?: string
  billingContact?: {
    name: string
    email: string
    phone: string
  }
}

export interface CompanyProfile {
  companyName: string
  privateInfo?: CompanyPrivateInfo
  logo?: string
  businessDescription?: string
  industry?: string[]
  companySize?: 'small' | 'medium' | 'large' | 'enterprise'
  foundedYear?: number
  website?: string
  contactEmail?: string
  phoneNumber?: string
  address?: {
    prefecture: string
    city: string
  }
  benefits?: string[]
  culture?: string
  techStack?: string[]
  socialLinks?: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
  rating?: {
    average: number
    count: number
    contractsCompleted: number
    responseRate: number
    averageResponseTime: number
  }
}

export type UserProfile = EngineerProfile | CompanyProfile

export interface User {
  userId: string
  email: string
  userType: UserType
  profile: UserProfile
  createdAt: string
  updatedAt: string
}
