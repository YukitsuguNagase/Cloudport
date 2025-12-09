import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { CloudWatchLogsClient, FilterLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs'
import { successResponse, errorResponse } from '../../utils/response.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)
const cloudWatchClient = new CloudWatchLogsClient({})

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

    const { logType, startTime, endTime } = event.queryStringParameters || {}

    // Default to last 24 hours if not specified
    const start = startTime ? parseInt(startTime) : Date.now() - 24 * 60 * 60 * 1000
    const end = endTime ? parseInt(endTime) : Date.now()

    let logs: any[] = []

    switch (logType) {
      case 'payment_errors':
        logs = await getPaymentErrorLogs(start, end)
        break
      case 'login_failures':
        logs = await getLoginFailureLogs(start, end)
        break
      case 'api_errors':
        logs = await getAPIErrorLogs(start, end)
        break
      case 'all':
      default:
        // Get all log types
        const [paymentErrors, loginFailures, apiErrors] = await Promise.all([
          getPaymentErrorLogs(start, end),
          getLoginFailureLogs(start, end),
          getAPIErrorLogs(start, end),
        ])
        logs = [...paymentErrors, ...loginFailures, ...apiErrors].sort(
          (a, b) => b.timestamp - a.timestamp
        )
        break
    }

    return successResponse({
      logs,
      startTime: start,
      endTime: end,
      count: logs.length,
    })
  } catch (error) {
    console.error('Error fetching system logs:', error)
    return errorResponse('Failed to fetch system logs')
  }
}

async function getPaymentErrorLogs(startTime: number, endTime: number): Promise<any[]> {
  try {
    // Query CloudWatch Logs for payment errors
    const logGroups = [
      '/aws/lambda/cloudport-dev-ApproveContractFunction',
      '/aws/lambda/cloudport-dev-ProcessPaymentFunction',
      '/aws/lambda/cloudport-dev-ProcessRefundFunction',
    ]

    const allLogs: any[] = []

    for (const logGroup of logGroups) {
      try {
        const response = await cloudWatchClient.send(
          new FilterLogEventsCommand({
            logGroupName: logGroup,
            startTime,
            endTime,
            filterPattern: '"ERROR" "payment" OR "PAY.JP" OR "charge failed"',
          })
        )

        if (response.events) {
          allLogs.push(
            ...response.events.map((event: any) => ({
              type: 'payment_error',
              timestamp: event.timestamp || 0,
              message: event.message || '',
              logGroup: logGroup,
              logStream: event.logStreamName || '',
            }))
          )
        }
      } catch (error) {
        console.error(`Error fetching logs from ${logGroup}:`, error)
      }
    }

    return allLogs
  } catch (error) {
    console.error('Error in getPaymentErrorLogs:', error)
    return []
  }
}

async function getLoginFailureLogs(startTime: number, endTime: number): Promise<any[]> {
  try {
    // Query CloudWatch Logs for login failures
    const logGroup = '/aws/lambda/cloudport-dev-LoginFunction'

    try {
      const response = await cloudWatchClient.send(
        new FilterLogEventsCommand({
          logGroupName: logGroup,
          startTime,
          endTime,
          filterPattern: '"ERROR" "login" OR "authentication failed" OR "invalid credentials"',
        })
      )

      if (response.events) {
        return response.events.map((event: any) => ({
          type: 'login_failure',
          timestamp: event.timestamp || 0,
          message: event.message || '',
          logGroup: logGroup,
          logStream: event.logStreamName || '',
        }))
      }
    } catch (error) {
      console.error(`Error fetching logs from ${logGroup}:`, error)
    }

    return []
  } catch (error) {
    console.error('Error in getLoginFailureLogs:', error)
    return []
  }
}

async function getAPIErrorLogs(startTime: number, endTime: number): Promise<any[]> {
  try {
    // Query CloudWatch Logs for general API errors (500 errors)
    const logGroups = [
      '/aws/lambda/cloudport-dev-GetJobsFunction',
      '/aws/lambda/cloudport-dev-CreateJobFunction',
      '/aws/lambda/cloudport-dev-GetUserFunction',
      '/aws/lambda/cloudport-dev-UpdateUserFunction',
    ]

    const allLogs: any[] = []

    for (const logGroup of logGroups) {
      try {
        const response = await cloudWatchClient.send(
          new FilterLogEventsCommand({
            logGroupName: logGroup,
            startTime,
            endTime,
            filterPattern: '"ERROR" OR "500" OR "Internal Server Error"',
          })
        )

        if (response.events) {
          allLogs.push(
            ...response.events.map((event: any) => ({
              type: 'api_error',
              timestamp: event.timestamp || 0,
              message: event.message || '',
              logGroup: logGroup,
              logStream: event.logStreamName || '',
            }))
          )
        }
      } catch (error) {
        console.error(`Error fetching logs from ${logGroup}:`, error)
      }
    }

    return allLogs
  } catch (error) {
    console.error('Error in getAPIErrorLogs:', error)
    return []
  }
}
