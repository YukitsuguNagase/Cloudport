import { DefineAuthChallengeTriggerHandler } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const LOGIN_ATTEMPTS_TABLE = process.env.LOGIN_ATTEMPTS_TABLE!

export const handler: DefineAuthChallengeTriggerHandler = async (event) => {
  const email = event.request.userAttributes.email

  try {
    // If authentication failed (wrong password, etc.)
    if (event.request.session && event.request.session.length > 0) {
      const lastSession = event.request.session[event.request.session.length - 1]

      if (lastSession.challengeResult === false) {
        // Increment failed login attempts
        const now = Math.floor(Date.now() / 1000)

        const result = await docClient.send(
          new GetCommand({
            TableName: LOGIN_ATTEMPTS_TABLE,
            Key: { email },
          })
        )

        if (result.Item) {
          // Increment existing attempts
          await docClient.send(
            new UpdateCommand({
              TableName: LOGIN_ATTEMPTS_TABLE,
              Key: { email },
              UpdateExpression: 'SET failedAttempts = failedAttempts + :inc, lastFailedAt = :now, #ttl = :ttl',
              ExpressionAttributeNames: {
                '#ttl': 'ttl',
              },
              ExpressionAttributeValues: {
                ':inc': 1,
                ':now': now,
                ':ttl': now + 86400, // TTL: 24 hours
              },
            })
          )
        } else {
          // Create new record
          await docClient.send(
            new PutCommand({
              TableName: LOGIN_ATTEMPTS_TABLE,
              Item: {
                email,
                failedAttempts: 1,
                lastFailedAt: now,
                ttl: now + 86400, // TTL: 24 hours
              },
            })
          )
        }
      }
    }

    return event
  } catch (error) {
    console.error('Define auth challenge error:', error)
    // Don't block authentication flow on error
    return event
  }
}
