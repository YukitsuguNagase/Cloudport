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
  userType: UserType
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

    userPool.signUp(email, password, attributeList, [], (err, result) => {
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

    cognitoUser.confirmRegistration(code, true, (err, result) => {
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

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}
