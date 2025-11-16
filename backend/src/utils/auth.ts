import { APIGatewayProxyEvent } from 'aws-lambda'

export interface AuthUser {
  userId: string
  email: string
  userType: 'engineer' | 'company'
}

export const getUserFromEvent = (event: APIGatewayProxyEvent): AuthUser => {
  const claims = event.requestContext.authorizer?.claims

  if (!claims) {
    throw new Error('Unauthorized')
  }

  return {
    userId: claims.sub,
    email: claims.email,
    userType: claims['custom:userType'] || 'engineer',
  }
}

export const verifyUserType = (user: AuthUser, allowedTypes: ('engineer' | 'company')[]): void => {
  if (!allowedTypes.includes(user.userType)) {
    throw new Error(`Forbidden: User type ${user.userType} not allowed`)
  }
}
