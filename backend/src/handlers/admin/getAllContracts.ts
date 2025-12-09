import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb'
import { successResponse, errorResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const CONTRACTS_TABLE = process.env.CONTRACTS_TABLE!
const USERS_TABLE = process.env.USERS_TABLE!
const JOBS_TABLE = process.env.JOBS_TABLE!
const ADMIN_EMAIL = 'yukinag@dotqinc.com'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub
    const userEmail = event.requestContext.authorizer?.claims?.email

    if (!userId || !userEmail) {
      return errorResponse('Unauthorized', 401)
    }

    // Check if user is admin
    if (userEmail !== ADMIN_EMAIL) {
      return errorResponse('Admin access required', 403)
    }

    // Scan all contracts
    const contractsResult = await docClient.send(
      new ScanCommand({
        TableName: CONTRACTS_TABLE,
      })
    )

    if (!contractsResult.Items || contractsResult.Items.length === 0) {
      return successResponse([])
    }

    // Enrich contracts with user and job information
    const enrichedContracts = await Promise.all(
      contractsResult.Items.map(async (contract) => {
        try {
          // Get engineer info
          const engineerResult = await docClient.send(
            new GetCommand({
              TableName: USERS_TABLE,
              Key: { userId: contract.engineerId },
            })
          )

          // Get company info
          const companyResult = await docClient.send(
            new GetCommand({
              TableName: USERS_TABLE,
              Key: { userId: contract.companyId },
            })
          )

          // Get job info
          const jobResult = await docClient.send(
            new GetCommand({
              TableName: JOBS_TABLE,
              Key: { jobId: contract.jobId },
            })
          )

          return {
            ...contract,
            engineerName: engineerResult.Item?.profile?.displayName || engineerResult.Item?.profile?.name || engineerResult.Item?.profile?.companyName || 'Unknown',
            companyName: companyResult.Item?.profile?.companyName || companyResult.Item?.profile?.name || 'Unknown',
            jobTitle: jobResult.Item?.title || 'Unknown',
          }
        } catch (error) {
          console.error(`Error enriching contract ${contract.contractId}:`, error)
          return {
            ...contract,
            engineerName: 'Unknown',
            companyName: 'Unknown',
            jobTitle: 'Unknown',
          }
        }
      })
    )

    // Sort by creation date (newest first)
    enrichedContracts.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return successResponse(enrichedContracts)
  } catch (error) {
    console.error('Error fetching all contracts:', error)
    return errorResponse('Failed to fetch contracts')
  }
}
