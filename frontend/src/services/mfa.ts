import axios from 'axios'
import { getAccessToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface MFAStatusResponse {
  mfaEnabled: boolean
  preferredMfa: string | null
  availableMfaMethods: string[]
  phoneNumber: string | null
  phoneVerified: boolean
  totpEnabled: boolean
  smsEnabled: boolean
}

export interface MFASetupResponse {
  secretCode?: string
  qrCodeUrl?: string
  message?: string
}

export const getMFAStatus = async (): Promise<MFAStatusResponse> => {
  const accessToken = await getAccessToken()
  const response = await axios.get(`${API_BASE_URL}/users/mfa/status`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return response.data
}

export const setupMFA = async (
  action: 'setup_totp' | 'verify_totp' | 'setup_sms' | 'disable_mfa',
  payload: { code?: string; phoneNumber?: string }
): Promise<MFASetupResponse> => {
  const accessToken = await getAccessToken()
  const response = await axios.post(
    `${API_BASE_URL}/users/mfa/setup`,
    {
      action,
      ...payload,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  return response.data
}
