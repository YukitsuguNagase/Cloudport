import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js'
import { User, UserType } from '../types/user'
import apiClient from './api'

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
}

const userPool = new CognitoUserPool(poolData)

export const signup = async (
  email: string,
  password: string,
  userType: UserType,
  name?: string,
  phoneNumber?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      }),
      new CognitoUserAttribute({
        Name: 'custom:userType',
        Value: userType,
      }),
    ]

    // 氏名を追加
    if (name) {
      attributeList.push(
        new CognitoUserAttribute({
          Name: 'name',
          Value: name,
        })
      )
    }

    // 電話番号を追加（E.164形式に変換）
    if (phoneNumber) {
      // 日本の電話番号を+81形式に変換
      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : phoneNumber.startsWith('0')
        ? `+81${phoneNumber.substring(1)}`
        : `+81${phoneNumber}`

      attributeList.push(
        new CognitoUserAttribute({
          Name: 'phone_number',
          Value: formattedPhone,
        })
      )
    }

    userPool.signUp(email, password, attributeList, [], (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}

export const login = async (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    })

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: async (result) => {
        const token = result.getIdToken().getJwtToken()
        localStorage.setItem('authToken', token)

        // Fetch user profile from backend
        try {
          const response = await apiClient.get('/users/me')
          resolve(response.data)
        } catch (error) {
          reject(error)
        }
      },
      onFailure: (err) => {
        reject(err)
      },
    })
  })
}

export const logout = async (): Promise<void> => {
  const cognitoUser = userPool.getCurrentUser()
  if (cognitoUser) {
    cognitoUser.signOut()
  }
  localStorage.removeItem('authToken')
}

export const getCurrentUser = async (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser()

    if (!cognitoUser) {
      resolve(null)
      return
    }

    cognitoUser.getSession(async (err: Error | null, session: any) => {
      if (err) {
        reject(err)
        return
      }

      if (!session.isValid()) {
        resolve(null)
        return
      }

      const token = session.getIdToken().getJwtToken()
      localStorage.setItem('authToken', token)

      try {
        const response = await apiClient.get('/users/me')
        resolve(response.data)
      } catch (error) {
        reject(error)
      }
    })
  })
}

export const confirmSignUp = async (email: string, code: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    cognitoUser.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}

export const resendConfirmationCode = async (email: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    cognitoUser.resendConfirmationCode((err) => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}

export const forgotPassword = async (email: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve()
      },
      onFailure: (err) => {
        reject(err)
      },
    })
  })
}

export const confirmPassword = async (
  email: string,
  code: string,
  newPassword: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => {
        resolve()
      },
      onFailure: (err) => {
        reject(err)
      },
    })
  })
}

export const getIdToken = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser()

    if (!cognitoUser) {
      reject(new Error('No user logged in'))
      return
    }

    cognitoUser.getSession((err: Error | null, session: any) => {
      if (err) {
        reject(err)
        return
      }

      if (!session.isValid()) {
        reject(new Error('Session is not valid'))
        return
      }

      const token = session.getIdToken().getJwtToken()
      resolve(token)
    })
  })
}

export const getAccessToken = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser()

    if (!cognitoUser) {
      reject(new Error('No user logged in'))
      return
    }

    cognitoUser.getSession((err: Error | null, session: any) => {
      if (err) {
        reject(err)
        return
      }

      if (!session.isValid()) {
        reject(new Error('Session is not valid'))
        return
      }

      const token = session.getAccessToken().getJwtToken()
      resolve(token)
    })
  })
}
