import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const sesClient = new SESClient({})
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@dotqinc.com'

export interface EmailParams {
  to: string
  subject: string
  body: string
  htmlBody?: string
}

/**
 * SES経由でメールを送信する共通ユーティリティ
 */
export const sendEmail = async (params: EmailParams): Promise<void> => {
  const { to, subject, body, htmlBody } = params

  const command = new SendEmailCommand({
    Source: SENDER_EMAIL,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: body,
          Charset: 'UTF-8',
        },
        ...(htmlBody && {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8',
          },
        }),
      },
    },
  })

  try {
    await sesClient.send(command)
    console.log(`Email sent successfully to ${to}`)
  } catch (error) {
    console.error('Error sending email:', error)
    // メール送信の失敗はメインの処理をブロックしない
    throw error
  }
}

/**
 * 複数人にメールを送信
 */
export const sendBulkEmail = async (emails: string[], subject: string, body: string, htmlBody?: string): Promise<void> => {
  const promises = emails.map((email) =>
    sendEmail({ to: email, subject, body, htmlBody }).catch((error) => {
      console.error(`Failed to send email to ${email}:`, error)
    })
  )

  await Promise.all(promises)
}
