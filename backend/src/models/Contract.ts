export type ContractStatus = 'pending_engineer' | 'pending_company' | 'pending_payment' | 'paid'
export type ContractInitiator = 'engineer' | 'company'

export interface Contract {
  contractId: string
  applicationId: string
  jobId: string
  engineerId: string
  companyId: string
  status: ContractStatus
  initiatedBy: ContractInitiator
  contractAmount: number
  feePercentage: number
  feeAmount: number
  approvedByEngineer?: string
  approvedByCompany?: string
  paymentId?: string  // PAY.JP charge ID
  paymentMethod?: string  // 支払い方法（カードブランド等）
  paidAt?: string
  createdAt: string
  updatedAt: string
}
