import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Job } from '../../types/job'
import { getJobDetail } from '../../services/jobs'
import { applyToJob, getMyApplications } from '../../services/applications'
import { useAuth } from '../../contexts/AuthContext'

function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [applying, setApplying] = useState(false)
  const [applicationError, setApplicationError] = useState('')
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    if (jobId) {
      fetchJobDetail()
      if (user?.userType === 'engineer') {
        checkIfApplied()
      }
    }
  }, [jobId, user])

  const fetchJobDetail = async () => {
    try {
      const data = await getJobDetail(jobId!)
      setJob(data)
    } catch (err: any) {
      setError(err.message || '案件の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const checkIfApplied = async () => {
    try {
      const applications = await getMyApplications()
      const applied = applications.some(app => app.jobId === jobId)
      setHasApplied(applied)
    } catch (err) {
      console.error('Failed to check application status:', err)
    }
  }

  const handleApply = async () => {
    if (!applicationMessage.trim()) {
      setApplicationError('応募メッセージを入力してください')
      return
    }

    setApplying(true)
    setApplicationError('')

    try {
      await applyToJob(jobId!, { message: applicationMessage })
      setShowApplicationModal(false)
      setApplicationMessage('')
      setHasApplied(true)
      alert('応募が完了しました')
      // Optionally navigate to applications list
      navigate('/applications')
    } catch (err: any) {
      setApplicationError(err.message || '応募に失敗しました')
    } finally {
      setApplying(false)
    }
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

  const isOwner = user?.userId === job.companyId

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link to="/jobs" className="text-primary-600 hover:underline">
            ← 案件一覧に戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>掲載日: {new Date(job.createdAt).toLocaleDateString()}</span>
                <span>応募数: {job.applicationCount}件</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === 'open'
                      ? 'bg-green-100 text-green-800'
                      : job.status === 'filled'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {job.status === 'open' ? '募集中' : job.status === 'filled' ? '募集終了' : 'クローズ'}
                </span>
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Link
                  to={`/jobs/${jobId}/edit`}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  編集
                </Link>
                <Link
                  to={`/jobs/${jobId}/applicants`}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  応募者一覧
                </Link>
              </div>
            )}
            {user?.userType === 'engineer' && job.status === 'open' && (
              hasApplied ? (
                <button
                  disabled
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed"
                >
                  応募済み
                </button>
              ) : (
                <button
                  onClick={() => setShowApplicationModal(true)}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  応募する
                </button>
              )
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-3">案件概要</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">主要AWSサービス</h2>
              <div className="flex flex-wrap gap-2">
                {job.requirements.awsServices.map((service) => (
                  <span
                    key={service}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {job.requirements.certifications && job.requirements.certifications.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-3">必要なAWS資格</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.requirements.experience && (
              <div>
                <h2 className="text-xl font-bold mb-3">必要な経験</h2>
                <p className="text-gray-700">{job.requirements.experience}</p>
              </div>
            )}

            {job.requirements.requiredSkills && job.requirements.requiredSkills.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-3">必須スキル</h2>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {job.requirements.requiredSkills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.requirements.preferredSkills && job.requirements.preferredSkills.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-3">歓迎スキル</h2>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {job.requirements.preferredSkills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold mb-3">期間</h2>
              <p className="text-gray-700">
                {job.duration.type === 'spot' ? 'スポット' : job.duration.type === 'short' ? '短期' : '長期'}
                {job.duration.type !== 'spot' && job.duration.months && ` (${job.duration.months}ヶ月)`}
              </p>
            </div>

            {job.budget && (
              <div>
                <h2 className="text-xl font-bold mb-3">
                  {job.duration.type === 'spot' ? '予算' : '月額単価'}
                </h2>
                <p className="text-gray-700">
                  {job.budget.min?.toLocaleString()}円 〜 {job.budget.max?.toLocaleString()}円
                  {job.duration.type !== 'spot' && '/月'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Application Modal */}
        {showApplicationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">案件に応募する</h2>

              {applicationError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                  {applicationError}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  応募メッセージ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="自己PRやこの案件に応募する理由を記載してください"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowApplicationModal(false)
                    setApplicationMessage('')
                    setApplicationError('')
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                  disabled={applying}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {applying ? '応募中...' : '応募する'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobDetail
