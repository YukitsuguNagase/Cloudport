import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { docClient, TABLE_NAMES, ScanCommand } from '../../utils/dynamodb.js'
import { successResponse, errorResponse } from '../../utils/response.js'
import { getUserFromEvent } from '../../utils/auth.js'
import { User, EngineerProfile } from '../../models/User.js'
import { EngineerSearchFilters, EngineerSearchResult } from '../../models/Scout.js'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // 認証チェック
    const user = getUserFromEvent(event)
    if (!user || user.userType !== 'company') {
      return errorResponse('Unauthorized', 401)
    }

    // リクエストボディから検索条件を取得
    const filters: EngineerSearchFilters = event.body ? JSON.parse(event.body) : {}

    // エンジニアユーザーのみをスキャン
    const params = {
      TableName: TABLE_NAMES.USERS,
      FilterExpression: '#userType = :engineer',
      ExpressionAttributeNames: {
        '#userType': 'userType',
      },
      ExpressionAttributeValues: {
        ':engineer': 'engineer',
      },
    }

    const result = await docClient.send(new ScanCommand(params))
    let engineers = (result.Items || []) as User[]

    // フィルタリング処理
    engineers = engineers.filter((user) => {
      const profile = user.profile as EngineerProfile

      // AWS資格でフィルタ
      if (filters.awsCertifications && filters.awsCertifications.length > 0) {
        if (!profile.certifications || profile.certifications.length === 0) {
          return false
        }
        const hasCertification = filters.awsCertifications.some((certName) =>
          profile.certifications!.some((cert) => cert.name === certName)
        )
        if (!hasCertification) {
          return false
        }
      }

      // 希望勤務地でフィルタ
      if (filters.preferredLocation) {
        const location = profile.location || ''
        const preferredLocation = (profile as any).preferredLocation || ''
        const searchTerm = filters.preferredLocation.toLowerCase()
        if (
          !location.toLowerCase().includes(searchTerm) &&
          !preferredLocation.toLowerCase().includes(searchTerm)
        ) {
          return false
        }
      }

      // スキルレベルでフィルタ
      if (filters.skillLevel) {
        if (!profile.skills || profile.skills.length === 0) {
          return false
        }
        const hasSkillLevel = profile.skills.some((skill) => skill.level === filters.skillLevel)
        if (!hasSkillLevel) {
          return false
        }
      }

      // 希望時給でフィルタ
      if (filters.minHourlyRate !== undefined || filters.maxHourlyRate !== undefined) {
        if (!profile.hourlyRate) {
          return false
        }
        if (filters.minHourlyRate !== undefined && profile.hourlyRate.max !== undefined) {
          if (profile.hourlyRate.max < filters.minHourlyRate) {
            return false
          }
        }
        if (filters.maxHourlyRate !== undefined && profile.hourlyRate.min !== undefined) {
          if (profile.hourlyRate.min > filters.maxHourlyRate) {
            return false
          }
        }
      }

      // 希望月額単価でフィルタ
      if (filters.minMonthlyRate !== undefined || filters.maxMonthlyRate !== undefined) {
        if (!profile.desiredMonthlyRate) {
          return false
        }
        if (filters.minMonthlyRate !== undefined && profile.desiredMonthlyRate.max !== undefined) {
          if (profile.desiredMonthlyRate.max < filters.minMonthlyRate) {
            return false
          }
        }
        if (filters.maxMonthlyRate !== undefined && profile.desiredMonthlyRate.min !== undefined) {
          if (profile.desiredMonthlyRate.min > filters.maxMonthlyRate) {
            return false
          }
        }
      }

      return true
    })

    // 検索結果をマッピング
    const searchResults: EngineerSearchResult[] = engineers.map((user) => {
      const profile = user.profile as EngineerProfile
      return {
        userId: user.userId,
        displayName: profile.displayName,
        location: profile.location,
        preferredLocation: (profile as any).preferredLocation,
        certifications: profile.certifications?.map((cert) => ({
          name: cert.name,
          obtainedAt: cert.obtainedAt,
        })),
        skills: profile.skills,
        hourlyRate: profile.hourlyRate,
        desiredMonthlyRate: profile.desiredMonthlyRate,
        avatar: profile.avatar,
      }
    })

    return successResponse(searchResults)
  } catch (error) {
    console.error('Error searching engineers:', error)
    return errorResponse('Failed to search engineers')
  }
}
