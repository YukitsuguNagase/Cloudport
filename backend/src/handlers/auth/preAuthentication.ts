import { PreAuthenticationTriggerHandler } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const LOGIN_ATTEMPTS_TABLE = process.env.LOGIN_ATTEMPTS_TABLE!
const BLOCKED_IPS_TABLE = process.env.BLOCKED_IPS_TABLE!
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 // 15 minutes in seconds

export const handler: PreAuthenticationTriggerHandler = async (event) => {
  const email = event.request.userAttributes.email
  const ipAddress = (event as any).request?.sourceIp || 'Unknown'

  try {
    // Check if IP address is blocked
    if (ipAddress !== 'Unknown') {
      const blockedIpResult = await docClient.send(
        new GetCommand({
          TableName: BLOCKED_IPS_TABLE,
          Key: { ipAddress },
        })
      )

      if (blockedIpResult.Item) {
        const { ttl, reason } = blockedIpResult.Item
        const now = Math.floor(Date.now() / 1000)

        // Check if block is still active
        if (!ttl || ttl > now) {
          console.log(`Blocked IP attempt: ${ipAddress}, reason: ${reason || 'Unknown'}`)
          throw new Error(
            '不審なアクティビティが検出されたため、このIPアドレスからのアクセスは制限されています。'
          )
        }
      }
    }

    // Get current login attempts
    const result = await docClient.send(
      new GetCommand({
        TableName: LOGIN_ATTEMPTS_TABLE,
        Key: { email },
      })
    )

    const now = Math.floor(Date.now() / 1000)

    if (result.Item) {
      const { failedAttempts, lastFailedAt, lockedUntil } = result.Item

      // Check if account is currently locked
      if (lockedUntil && lockedUntil > now) {
        const remainingSeconds = lockedUntil - now
        const remainingMinutes = Math.ceil(remainingSeconds / 60)
        throw new Error(
          `アカウントが一時的にロックされています。${remainingMinutes}分後に再度お試しください。`
        )
      }

      // Check if too many failed attempts
      if (failedAttempts >= MAX_ATTEMPTS) {
        // Lock the account
        await docClient.send(
          new UpdateCommand({
            TableName: LOGIN_ATTEMPTS_TABLE,
            Key: { email },
            UpdateExpression: 'SET lockedUntil = :lockedUntil, #ttl = :ttl',
            ExpressionAttributeNames: {
              '#ttl': 'ttl',
            },
            ExpressionAttributeValues: {
              ':lockedUntil': now + LOCKOUT_DURATION,
              ':ttl': now + LOCKOUT_DURATION + 86400, // TTL: lockout + 24 hours
            },
          })
        )

        // Send lockout notification email
        try {
          const { sendEmail } = await import('../../utils/email.js')
          const { accountLockedEmail } = await import('../../utils/emailTemplates.js')
          const lockoutMinutes = LOCKOUT_DURATION / 60
          const emailTemplate = accountLockedEmail(email, lockoutMinutes, ipAddress)
          await sendEmail({
            to: email,
            subject: emailTemplate.subject,
            body: emailTemplate.body,
          })
          console.log(`Lockout notification email sent to ${email}`)
        } catch (emailError) {
          console.error('Failed to send lockout notification email:', emailError)
          // メール送信失敗してもロックアウトは実行
        }

        throw new Error(
          `ログイン試行回数が上限に達しました。アカウントは${
            LOCKOUT_DURATION / 60
          }分間ロックされます。`
        )
      }
    }

    // Allow authentication attempt
    return event
  } catch (error) {
    console.error('Pre-authentication error:', error)
    throw error
  }
}
