import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const USERS_TABLE = process.env.USERS_TABLE!
const JOBS_TABLE = process.env.JOBS_TABLE!
const CONTRACTS_TABLE = process.env.CONTRACTS_TABLE!

const successResponse = (data: any): APIGatewayProxyResult => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify(data),
})

const errorResponse = (message: string, statusCode = 500): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify({ error: message }),
})

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Count engineers (userType = 'engineer')
    const usersResult = await docClient.send(
      new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: 'userType = :userType',
        ExpressionAttributeValues: {
          ':userType': 'engineer',
        },
        Select: 'COUNT',
      })
    )

    const engineersCount = usersResult.Count || 0

    // Count active jobs (status = 'open')
    const jobsResult = await docClient.send(
      new ScanCommand({
        TableName: JOBS_TABLE,
        FilterExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'open',
        },
        Select: 'COUNT',
      })
    )

    const jobsCount = jobsResult.Count || 0

    // Count total contracts and paid contracts for success rate
    const allContractsResult = await docClient.send(
      new ScanCommand({
        TableName: CONTRACTS_TABLE,
        Select: 'COUNT',
      })
    )

    const paidContractsResult = await docClient.send(
      new ScanCommand({
        TableName: CONTRACTS_TABLE,
        FilterExpression: '#status = :paidStatus OR #status = :completedStatus',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':paidStatus': 'paid',
          ':completedStatus': 'completed',
        },
        Select: 'COUNT',
      })
    )

    const totalContracts = allContractsResult.Count || 0
    const paidContracts = paidContractsResult.Count || 0

    // Calculate success rate (percentage of contracts that reached paid/completed status)
    // If no contracts yet, show 0% instead of placeholder
    let matchRate = 0
    if (totalContracts > 0) {
      matchRate = Math.round((paidContracts / totalContracts) * 100)
    }

    return successResponse({
      engineersCount,
      jobsCount,
      matchRate,
    })
  } catch (error) {
    console.error('Error fetching public stats:', error)
    return errorResponse('Failed to fetch statistics')
  }
}
