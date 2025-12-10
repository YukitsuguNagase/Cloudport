import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CognitoIdentityProviderClient, AssociateSoftwareTokenCommand, VerifySoftwareTokenCommand, SetUserMFAPreferenceCommand } from '@aws-sdk/client-cognito-identity-provider'
import { successResponse, errorResponse } from '../../utils/response.js'

const cognitoClient = new CognitoIdentityProviderClient({})

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return errorResponse('Unauthorized', 401)
    }

    if (!event.body) {
      return errorResponse('Request body is required', 400)
    }

    const { action, code, phoneNumber } = JSON.parse(event.body)

    switch (action) {
      case 'setup_totp':
        // TOTP設定の開始（QRコード用のシークレット取得）
        const associateCommand = new AssociateSoftwareTokenCommand({
          AccessToken: accessToken,
        })
        const associateResult = await cognitoClient.send(associateCommand)

        return successResponse({
          secretCode: associateResult.SecretCode,
          // QRコード用のURL (Google Authenticator等で読み込み可能)
          qrCodeUrl: `otpauth://totp/CloudPort:${event.requestContext.authorizer?.claims?.email}?secret=${associateResult.SecretCode}&issuer=CloudPort`,
        })

      case 'verify_totp':
        // TOTPコードの検証と有効化
        if (!code) {
          return errorResponse('Verification code is required', 400)
        }

        const verifyCommand = new VerifySoftwareTokenCommand({
          AccessToken: accessToken,
          UserCode: code,
        })
        await cognitoClient.send(verifyCommand)

        // TOTPをMFA設定として有効化
        const setTotpPreferenceCommand = new SetUserMFAPreferenceCommand({
          AccessToken: accessToken,
          SoftwareTokenMfaSettings: {
            Enabled: true,
            PreferredMfa: true,
          },
        })
        await cognitoClient.send(setTotpPreferenceCommand)

        return successResponse({ message: 'TOTP MFA has been enabled successfully' })

      case 'setup_sms':
        // SMS MFAの有効化（電話番号は既にCognitoに登録されている前提）
        const setSmsPreferenceCommand = new SetUserMFAPreferenceCommand({
          AccessToken: accessToken,
          SMSMfaSettings: {
            Enabled: true,
            PreferredMfa: true,
          },
        })
        await cognitoClient.send(setSmsPreferenceCommand)

        return successResponse({ message: 'SMS MFA has been enabled successfully' })

      case 'disable_mfa':
        // MFAを無効化
        const disableCommand = new SetUserMFAPreferenceCommand({
          AccessToken: accessToken,
          SoftwareTokenMfaSettings: {
            Enabled: false,
            PreferredMfa: false,
          },
          SMSMfaSettings: {
            Enabled: false,
            PreferredMfa: false,
          },
        })
        await cognitoClient.send(disableCommand)

        return successResponse({ message: 'MFA has been disabled successfully' })

      default:
        return errorResponse('Invalid action', 400)
    }
  } catch (error: any) {
    console.error('Error setting up MFA:', error)

    if (error.name === 'CodeMismatchException') {
      return errorResponse('認証コードが正しくありません', 400)
    }

    if (error.name === 'EnableSoftwareTokenMFAException') {
      return errorResponse('TOTP MFAの有効化に失敗しました', 400)
    }

    return errorResponse('Failed to setup MFA')
  }
}
