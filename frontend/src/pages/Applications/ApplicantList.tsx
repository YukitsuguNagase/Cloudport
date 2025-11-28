import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Application } from '../../types/application'
import { getJobApplications, updateApplicationStatus } from '../../services/applications'
import { getJobDetail } from '../../services/jobs'
import { Job } from '../../types/job'
import { useAuth } from '../../contexts/AuthContext'
import { createConversation } from '../../services/messages'

function ApplicantList() {
  const { jobId } = useParams<{ jobId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creatingConversation, setCreatingConversation] = useState<string | null>(null)

  useEffect(() => {
    if (jobId) {
      fetchData()
    }
  }, [jobId])

  const fetchData = async () => {
    try {
      const [jobData, applicationsData] = await Promise.all([
        getJobDetail(jobId!),
        getJobApplications(jobId!)
      ])
      setJob(jobData)
      setApplications(applicationsData)
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (applicationId: string, status: 'interested' | 'passed') => {
    try {
      await updateApplicationStatus(applicationId, { status })
      // Update local state
      setApplications(applications.map(app =>
        app.applicationId === applicationId
          ? { ...app, status }
          : app
      ))
      alert(`応募を${status === 'interested' ? '興味ありに設定' : '見送り'}しました`)
    } catch (err: any) {
      alert(err.message || 'ステータスの更新に失敗しました')
    }
  }

  const handleStartConversation = async (applicationId: string) => {
    try {
      setCreatingConversation(applicationId)
      const conversation = await createConversation(applicationId)
      navigate(`/messages/${conversation.conversationId}`)
    } catch (err: any) {
      alert(err.message || 'メッセージの開始に失敗しました')
    } finally {
      setCreatingConversation(null)
    }
  }

  // Check if user is the job owner
  if (!loading && job && user?.userId !== job.companyId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20 text-red-600">
            この案件の応募者一覧を閲覧する権限がありません
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

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20 text-red-600">{error || '案件が見つかりません'}</div>
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
        <div className="mb-6">
          <Link to={`/jobs/${jobId}`} className="text-primary-600 hover:underline">
            ← 案件詳細に戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
          <p className="text-gray-600">応募者数: {applications.length}件</p>
        </div>

        <div className="grid gap-6">
          {applications.map((application) => (
            <div
              key={application.applicationId}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">
                      {application.engineerName || '応募者'}
                      <span className="text-sm text-gray-500 ml-2">
                        (ID: {application.applicationId.slice(0, 8)}...)
                      </span>
                    </h3>
                    {getStatusBadge(application.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    応募日: {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">応募メッセージ</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                  {application.message}
                </p>
              </div>

              {application.status === 'pending' && (
                <div className="flex gap-3">
                  <Link
                    to={`/users/${application.engineerId}`}
                    className="flex-1 bg-white border-2 border-primary-600 text-primary-600 py-2 px-4 rounded-lg hover:bg-primary-50 transition text-center"
                  >
                    プロフィールを見る
                  </Link>
                  <button
                    onClick={() => handleStatusUpdate(application.applicationId, 'interested')}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition"
                  >
                    興味あり
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(application.applicationId, 'passed')}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition"
                  >
                    見送る
                  </button>
                </div>
              )}

              {application.status === 'interested' && (
                <div className="flex gap-3">
                  <Link
                    to={`/users/${application.engineerId}`}
                    className="flex-1 bg-white border-2 border-primary-600 text-primary-600 py-2 px-4 rounded-lg hover:bg-primary-50 transition text-center"
                  >
                    プロフィールを見る
                  </Link>
                  <button
                    onClick={() => handleStartConversation(application.applicationId)}
                    disabled={creatingConversation === application.applicationId}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {creatingConversation === application.applicationId ? 'メッセージを開いています...' : 'メッセージを送る'}
                  </button>
                </div>
              )}

              {application.status === 'passed' && (
                <div>
                  <Link
                    to={`/users/${application.engineerId}`}
                    className="block w-full bg-white border-2 border-gray-400 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition text-center mb-3"
                  >
                    プロフィールを見る
                  </Link>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 text-sm">この応募を見送りました</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {applications.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            まだ応募者がいません
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicantList
