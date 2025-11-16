export type ContractStatus = 'pending_engineer' | 'pending_company' | 'approved' | 'paid'
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
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateContractInput {
  applicationId: string
  contractAmount: number
  feePercentage: number
}
