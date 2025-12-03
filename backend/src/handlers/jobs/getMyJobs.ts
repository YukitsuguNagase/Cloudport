import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { docClient, TABLE_NAMES, QueryCommand } from '../../utils/dynamodb.js'
import { successResponse, errorResponse } from '../../utils/response.js'
import { getUserFromEvent } from '../../utils/auth.js'
import { Job } from '../../models/Job.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // 認証チェック
    const user = getUserFromEvent(event)
    if (!user || user.userType !== 'company') {
      return errorResponse('Unauthorized', 401)
    }
    const userId = user.userId

    // 自分が投稿した案件を取得
    const params = {
      TableName: TABLE_NAMES.JOBS,
      IndexName: 'CompanyIdIndex',
      KeyConditionExpression: 'companyId = :companyId',
      ExpressionAttributeValues: {
        ':companyId': userId,
      },
    }

    const result = await docClient.send(new QueryCommand(params))
    const jobs = (result.Items || []) as Job[]

    // 作成日時の降順でソート
    jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return successResponse(jobs)
  } catch (error) {
    console.error('Error getting my jobs:', error)
    return errorResponse('Failed to get my jobs')
  }
}
