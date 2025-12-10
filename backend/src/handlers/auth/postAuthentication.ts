import { PostAuthenticationTriggerHandler } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, DeleteCommand, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { v4 as uuidv4 } from 'uuid'
import { sendEmail } from '../../utils/email.js'
import { welcomeEmail } from '../../utils/emailTemplates.js'

const dynamoClient = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(dynamoClient)
const sesClient = new SESClient({})

const LOGIN_ATTEMPTS_TABLE = process.env.LOGIN_ATTEMPTS_TABLE!
const LOGIN_DEVICES_TABLE = process.env.LOGIN_DEVICES_TABLE!
const USERS_TABLE = process.env.USERS_TABLE!
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@cloudportjobs.com'

interface DeviceInfo {
  userId: string
  deviceId: string
  userAgent: string
  ipAddress: string
  lastLoginAt: string
  createdAt: string
}

const generateDeviceFingerprint = (userAgent: string, ipAddress: string): string => {
  // Simple fingerprint based on user agent and IP
  return Buffer.from(`${userAgent}-${ipAddress}`).toString('base64').substring(0, 32)
}

const sendLoginNotificationEmail = async (email: string, deviceInfo: { userAgent: string; ipAddress: string; timestamp: string }) => {
  const params = {
    Source: SENDER_EMAIL,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: '【CloudPort】新しいデバイスからのログインを検知しました',
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: `
CloudPortへのログインを検知しました。

ログイン情報:
- 日時: ${deviceInfo.timestamp}
- IPアドレス: ${deviceInfo.ipAddress}
- デバイス: ${deviceInfo.userAgent}

このログインに心当たりがない場合は、すぐにパスワードを変更してください。

CloudPort運営チーム
          `.trim(),
          Charset: 'UTF-8',
        },
      },
    },
  }

  try {
    await sesClient.send(new SendEmailCommand(params))
    console.log(`Login notification email sent to ${email}`)
  } catch (error) {
    console.error('Error sending login notification email:', error)
    // Don't throw - email failure shouldn't block authentication
  }
}

export const handler: PostAuthenticationTriggerHandler = async (event) => {
  const email = event.request.userAttributes.email
  const userId = event.request.userAttributes.sub

  // Extract device information from the request context
  // Note: Full device info may not be available in PostAuthentication trigger
  // Using client metadata or extracting from event
  const userAgent = event.request.clientMetadata?.userAgent || 'Unknown'
  const ipAddress = (event as any).request?.sourceIp || 'Unknown'
  const timestamp = new Date().toISOString()

  try {
    // Clear failed login attempts on successful authentication
    await docClient.send(
      new DeleteCommand({
        TableName: LOGIN_ATTEMPTS_TABLE,
        Key: { email },
      })
    )

    // Generate device fingerprint
    const deviceId = generateDeviceFingerprint(userAgent, ipAddress)

    // Check if this is a known device
    const existingDevice = await docClient.send(
      new GetCommand({
        TableName: LOGIN_DEVICES_TABLE,
        Key: { userId, deviceId },
      })
    )

    const isNewDevice = !existingDevice.Item

    // Update or create device record
    const deviceRecord: DeviceInfo = {
      userId,
      deviceId,
      userAgent,
      ipAddress,
      lastLoginAt: timestamp,
      createdAt: existingDevice.Item?.createdAt || timestamp,
    }

    await docClient.send(
      new PutCommand({
        TableName: LOGIN_DEVICES_TABLE,
        Item: deviceRecord,
      })
    )

    // Send notification email if this is a new device
    if (isNewDevice) {
      console.log(`New device login detected for user ${userId}`)
      await sendLoginNotificationEmail(email, { userAgent, ipAddress, timestamp })

      // Check if this is the user's first login (first device ever)
      const allDevicesResult = await docClient.send(
        new QueryCommand({
          TableName: LOGIN_DEVICES_TABLE,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId,
          },
        })
      )

      const isFirstLogin = allDevicesResult.Items?.length === 1

      // Send welcome email on first login
      if (isFirstLogin) {
        try {
          const userResult = await docClient.send(
            new GetCommand({
              TableName: USERS_TABLE,
              Key: { userId },
            })
          )

          const user = userResult.Item
          if (user) {
            const displayName = user.displayName || user.email.split('@')[0]
            const template = welcomeEmail(displayName, user.userType)
            await sendEmail({
              to: email,
              subject: template.subject,
              body: template.body,
            })
            console.log(`Welcome email sent to ${email}`)
          }
        } catch (error) {
          console.error('Error sending welcome email:', error)
          // Don't block authentication
        }
      }
    }

    console.log(`Login attempts cleared for user: ${email}`)
    return event
  } catch (error) {
    console.error('Post-authentication error:', error)
    // Don't block authentication on error
    return event
  }
}
