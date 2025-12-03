import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { docClient, TABLE_NAMES, QueryCommand } from '../../utils/dynamodb.js'
import { successResponse, errorResponse } from '../../utils/response.js'
import { getUserFromEvent } from '../../utils/auth.js'
import { Scout } from '../../models/Scout.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // 認証チェック
    const user = getUserFromEvent(event)
    if (!user || user.userType !== 'company') {
      return errorResponse('Unauthorized', 401)
    }
    const userId = user.userId

    // 自分が送信したスカウトを取得
    const params = {
      TableName: TABLE_NAMES.SCOUTS,
      IndexName: 'CompanyIdIndex',
      KeyConditionExpression: 'companyId = :companyId',
      ExpressionAttributeValues: {
        ':companyId': userId,
      },
    }

    const result = await docClient.send(new QueryCommand(params))
    const scouts = (result.Items || []) as Scout[]

    // 作成日時の降順でソート
    scouts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return successResponse(scouts)
  } catch (error) {
    console.error('Error getting scouts:', error)
    return errorResponse('Failed to get scouts')
  }
}
