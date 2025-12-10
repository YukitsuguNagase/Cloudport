import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface BlockedIP {
  ipAddress: string
  reason: string
  blockedAt: string
  blockedBy: string
  expiresAt: string | null
}

export interface BlockIPRequest {
  ipAddress: string
  reason: string
  durationHours?: number // undefined = permanent
}

export const getBlockedIPs = async (idToken: string): Promise<BlockedIP[]> => {
  const response = await axios.get(`${API_BASE_URL}/admin/security/blocked-ips`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  })
  return response.data.blockedIPs
}

export const blockIP = async (idToken: string, data: BlockIPRequest): Promise<void> => {
  await axios.post(`${API_BASE_URL}/admin/security/block-ip`, data, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  })
}

export const unblockIP = async (idToken: string, ipAddress: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/admin/security/unblock-ip/${ipAddress}`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  })
}
