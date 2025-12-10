import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider'
import { successResponse, errorResponse } from '../../utils/response.js'

const cognitoClient = new CognitoIdentityProviderClient({})

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return errorResponse('Unauthorized', 401)
    }

    // Cognitoからユーザー情報を取得
    const command = new GetUserCommand({
      AccessToken: accessToken,
    })
    const result = await cognitoClient.send(command)

    // MFAの設定状況を確認
    const mfaOptions = result.MFAOptions || []
    const preferredMfa = result.PreferredMfaSetting
    const userMfaSettings = result.UserMFASettingList || []

    // 電話番号の確認
    const phoneNumber = result.UserAttributes?.find((attr) => attr.Name === 'phone_number')?.Value
    const phoneVerified = result.UserAttributes?.find((attr) => attr.Name === 'phone_number_verified')?.Value === 'true'

    return successResponse({
      mfaEnabled: userMfaSettings.length > 0,
      preferredMfa: preferredMfa || null,
      availableMfaMethods: userMfaSettings,
      phoneNumber: phoneNumber || null,
      phoneVerified: phoneVerified,
      totpEnabled: userMfaSettings.includes('SOFTWARE_TOKEN_MFA'),
      smsEnabled: userMfaSettings.includes('SMS_MFA'),
    })
  } catch (error: any) {
    console.error('Error getting MFA status:', error)
    return errorResponse('Failed to get MFA status')
  }
}
