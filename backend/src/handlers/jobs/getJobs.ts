import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { docClient, TABLE_NAMES, ScanCommand } from '../../utils/dynamodb.js'
import { successResponse, errorResponse } from '../../utils/response.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const params = {
      TableName: TABLE_NAMES.JOBS,
      FilterExpression: '#status = :open OR #status = :filled',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':open': 'open',
        ':filled': 'filled',
      },
    }

    const result = await docClient.send(new ScanCommand(params))

    return successResponse(result.Items || [])
  } catch (error) {
    console.error('Error getting jobs:', error)
    return errorResponse('Failed to get jobs')
  }
}
