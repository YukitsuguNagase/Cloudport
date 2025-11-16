import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
export const docClient = DynamoDBDocumentClient.from(client)

export const TABLE_NAMES = {
  USERS: process.env.USERS_TABLE || 'cloudport-users',
  JOBS: process.env.JOBS_TABLE || 'cloudport-jobs',
  APPLICATIONS: process.env.APPLICATIONS_TABLE || 'cloudport-applications',
  CONVERSATIONS: process.env.CONVERSATIONS_TABLE || 'cloudport-conversations',
  MESSAGES: process.env.MESSAGES_TABLE || 'cloudport-messages',
  CONTRACTS: process.env.CONTRACTS_TABLE || 'cloudport-contracts',
}

export { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand }
