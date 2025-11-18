export type UserType = 'engineer' | 'company'

// 共通の基本情報
interface BasePrivateInfo {
  email: string
  phone?: string
}

// 技術者プロフィール
export interface EngineerProfile {
  // 基本情報（非公開）
  privateInfo?: {
    birthday?: string
    address?: {
      prefecture: string
      city: string
    }
  }

  // 公開情報
  displayName: string
  avatar?: string
  bio?: string
  location?: string // 都道府県のみ
  workStyle?: ('remote' | 'onsite' | 'hybrid')[]
  availableHours?: number // 週の稼働可能時間

  // スキル
  certifications?: Array<{
    name: string
    obtainedAt: string
    certificationNumber?: string // 非公開
  }>
  skills?: Array<{
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    experienceYears?: number
  }>
  specialties?: string[]

  // 経歴
  workHistory?: Array<{
    startDate: string
    endDate?: string
    projectName: string
    role: string
    technologies: string[]
    description: string
    responsibilities: string
  }>
  education?: Array<{
    school: string
    department: string
    graduatedAt: string
  }>

  // 希望条件（非公開）
  desiredConditions?: {
    desiredRate?: number
    minimumRate?: number
    desiredWorkType?: string[]
    availableFrom?: string
    availableDaysPerWeek?: number
  }

  // ポートフォリオ
  portfolio?: {
    github?: string
    portfolioUrl?: string
    blog?: string
    socialLinks?: {
      twitter?: string
      linkedin?: string
    }
  }
}

// 企業プロフィール
export interface CompanyProfile {
  // 基本情報（一部非公開）
  companyName: string
  privateInfo?: {
    representativeName: string
    corporateNumber: string
    registeredAddress: string
    phone: string
    contactPerson: string
    contactDepartment: string
  }

  // 公開情報
  logo?: string
  businessDescription?: string
  companyIntroduction?: string
  establishedAt?: string
  employeeCount?: '1-10' | '11-50' | '51-100' | '101-500' | '501-1000' | '1000+'
  capital?: string
  headquarters?: {
    prefecture: string
    city: string
  }
  offices?: Array<{
    name: string
    address: string
  }>
  website?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    facebook?: string
  }

  // 募集情報
  majorClients?: string[]
  developmentAchievements?: string[]
  technologies?: string[]
  remoteWorkSupport?: boolean
  benefits?: string[]

  // 評価（自動生成）
  rating?: {
    average: number
    count: number
    contractsCompleted: number
    responseRate: number
    averageResponseTime: number
  }
}

// ユニオン型でプロフィールを定義
export type UserProfile = EngineerProfile | CompanyProfile

export interface User {
  userId: string
  email: string
  userType: UserType
  profile: UserProfile
  createdAt: string
  updatedAt: string
}
