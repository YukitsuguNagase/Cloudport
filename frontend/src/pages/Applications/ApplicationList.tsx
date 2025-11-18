import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Application } from '../../types/application'
import { getMyApplications } from '../../services/applications'
import { useAuth } from '../../contexts/AuthContext'

function ApplicationList() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const data = await getMyApplications()
      setApplications(data)
    } catch (err: any) {
      setError(err.message || '応募一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (user?.userType !== 'engineer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20 text-red-600">
            この機能は技術者アカウント専用です
          </div>
          <div className="text-center">
            <Link to="/jobs" className="text-primary-600 hover:underline">
              案件一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-20">読み込み中...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20 text-red-600">{error}</div>
          <div className="text-center">
            <Link to="/jobs" className="text-primary-600 hover:underline">
              案件一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">審査中</span>
      case 'interested':
        return <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">興味あり</span>
      case 'passed':
        return <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">見送り</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">応募一覧</h1>
          <Link
            to="/jobs"
            className="text-primary-600 hover:underline"
          >
            案件一覧に戻る
          </Link>
        </div>

        <div className="grid gap-6">
          {applications.map((application) => (
            <div
              key={application.applicationId}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link
                    to={`/jobs/${application.jobId}`}
                    className="text-xl font-bold text-primary-600 hover:underline"
                  >
                    案件詳細を見る
                  </Link>
                  <div className="flex gap-4 items-center mt-2">
                    <span className="text-sm text-gray-500">
                      応募日: {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                    {getStatusBadge(application.status)}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">応募メッセージ</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{application.message}</p>
              </div>

              {application.status === 'accepted' && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800 text-sm">
                    おめでとうございます！この案件への応募が承認されました。
                  </p>
                </div>
              )}

              {application.status === 'rejected' && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <p className="text-red-800 text-sm">
                    残念ながら、この案件への応募は不採用となりました。
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {applications.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            応募履歴がありません
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicationList
