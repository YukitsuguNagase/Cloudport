import apiClient from './api'
import { Contract, CreateContractInput } from '../types/contract'

export const getContracts = async (): Promise<Contract[]> => {
  const response = await apiClient.get('/contracts')
  return response.data
}

export const getContractDetail = async (contractId: string): Promise<Contract> => {
  const response = await apiClient.get(`/contracts/${contractId}`)
  return response.data
}

export const createContract = async (
  data: CreateContractInput
): Promise<Contract> => {
  const response = await apiClient.post('/contracts', data)
  return response.data
}

export const approveContract = async (contractId: string): Promise<Contract> => {
  const response = await apiClient.put(`/contracts/${contractId}/approve`)
  return response.data
}

export const processPayment = async (contractId: string): Promise<Contract> => {
  const response = await apiClient.post(`/contracts/${contractId}/payment`)
  return response.data
}
