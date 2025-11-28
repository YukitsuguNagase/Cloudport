import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Job } from '../../types/job'
import { getJobs, getJobDetail } from '../../services/jobs'
import { useAuth } from '../../contexts/AuthContext'
import { applyToJob, getMyApplications } from '../../services/applications'

function JobList() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Selected job for detail view
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Application modal states
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [applying, setApplying] = useState(false)
  const [applicationError, setApplicationError] = useState('')
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    if (selectedJobId) {
      fetchJobDetail(selectedJobId)
    }
  }, [selectedJobId])

  const fetchJobs = async () => {
    try {
      const data = await getJobs()
      setJobs(data)
    } catch (err: any) {
      setError(err.message || '案件の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchJobDetail = async (jobId: string) => {
    try {
      setLoadingDetail(true)
      const data = await getJobDetail(jobId)
      setSelectedJob(data)

      if (user?.userType === 'engineer') {
        checkIfApplied(jobId)
      }
    } catch (err: any) {
      console.error('Failed to fetch job detail:', err)
    } finally {
      setLoadingDetail(false)
    }
  }

  const checkIfApplied = async (jobId: string) => {
    try {
      const applications = await getMyApplications()
      const applied = applications.some(app => app.jobId === jobId)
      setHasApplied(applied)
    } catch (err) {
      console.error('Failed to check application status:', err)
    }
  }

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(selectedJobId === jobId ? null : jobId)
  }

  const handleApply = async () => {
    if (!applicationMessage.trim()) {
      setApplicationError('応募メッセージを入力してください')
      return
    }

    setApplying(true)
    setApplicationError('')

    try {
      await applyToJob(selectedJobId!, { message: applicationMessage })
      setShowApplicationModal(false)
      setApplicationMessage('')
      setHasApplied(true)
      alert('応募が完了しました')
    } catch (err: any) {
      setApplicationError(err.message || '応募に失敗しました')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20">読み込み中...</div>
  }

  if (error) {
    return <div className="text-center py-20 text-red-600">{error}</div>
  }

  const isOwner = selectedJob && user?.userId === selectedJob.companyId

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">案件一覧</h1>
          {user?.userType === 'company' && (
            <Link
              to="/jobs/new"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              案件を投稿
            </Link>
          )}
        </div>

        <div className="grid gap-6">
          {jobs.map((job) => (
            <div key={job.jobId}>
              <div
                onClick={() => handleJobClick(job.jobId)}
                className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer ${
                  selectedJobId === job.jobId ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{job.title}</h3>
                  {job.status === 'filled' && (
                    <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800 font-semibold">
                      募集終了
                    </span>
                  )}
                  {job.status === 'closed' && (
                    <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800 font-semibold">
                      クローズ
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">主要AWSサービス</p>
                  <div className="flex gap-2 flex-wrap">
                    {job.requirements.awsServices.slice(0, 5).map((service) => (
                      <span
                        key={service}
                        className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                    {job.requirements.awsServices.length > 5 && (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                        +{job.requirements.awsServices.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                {job.requirements.certifications && job.requirements.certifications.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">必要なAWS資格</p>
                    <div className="flex gap-2 flex-wrap">
                      {job.requirements.certifications.slice(0, 3).map((cert) => (
                        <span
                          key={cert}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          {cert}
                        </span>
                      ))}
                      {job.requirements.certifications.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                          +{job.requirements.certifications.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm">
                  <div className="flex gap-4">
                    <span className="text-gray-500">
                      {job.duration.type === 'spot' ? 'スポット' : job.duration.type === 'short' ? '短期' : '長期'}
                    </span>
                    {job.budget && (job.budget.min || job.budget.max) && (
                      <span className="font-semibold text-gray-700">
                        {job.budget.min && `¥${job.budget.min.toLocaleString()}`}
                        {job.budget.min && job.budget.max && '〜'}
                        {job.budget.max && !job.budget.min && `〜¥${job.budget.max.toLocaleString()}`}
                        {job.duration.type !== 'spot' && '/月'}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500">{job.applicationCount}件の応募</span>
                </div>
              </div>

              {/* Expanded detail view */}
              {selectedJobId === job.jobId && selectedJob && !loadingDetail && (
                <div className="bg-white border-t-2 border-primary-500 p-8 rounded-b-lg shadow-lg">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex gap-4 text-sm text-gray-500 mb-4">
                          <span>掲載日: {new Date(selectedJob.createdAt).toLocaleDateString()}</span>
                          <span>応募数: {selectedJob.applicationCount}件</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              selectedJob.status === 'open'
                                ? 'bg-green-100 text-green-800'
                                : selectedJob.status === 'filled'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {selectedJob.status === 'open' ? '募集中' : selectedJob.status === 'filled' ? '募集終了' : 'クローズ'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mb-6">
                      {isOwner && (
                        <div className="flex gap-2">
                          <Link
                            to={`/jobs/${selectedJobId}/edit`}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                          >
                            編集
                          </Link>
                          <Link
                            to={`/jobs/${selectedJobId}/applicants`}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                          >
                            応募者一覧
                          </Link>
                        </div>
                      )}
                      {user?.userType === 'engineer' && selectedJob.status === 'open' && (
                        hasApplied ? (
                          <button
                            disabled
                            className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed w-full"
                          >
                            応募済み
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowApplicationModal(true)}
                            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition w-full"
                          >
                            応募する
                          </button>
                        )
                      )}
                    </div>

                    <div>
                      <h2 className="text-xl font-bold mb-3">案件概要</h2>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold mb-3">主要AWSサービス</h2>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.requirements.awsServices.map((service) => (
                          <span
                            key={service}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedJob.requirements.certifications && selectedJob.requirements.certifications.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold mb-3">必要なAWS資格</h2>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.requirements.certifications.map((cert, index) => (
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

                    {selectedJob.requirements.experience && (
                      <div>
                        <h2 className="text-xl font-bold mb-3">必要な経験</h2>
                        <p className="text-gray-700">{selectedJob.requirements.experience}</p>
                      </div>
                    )}

                    {selectedJob.requirements.requiredSkills && selectedJob.requirements.requiredSkills.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold mb-3">必須スキル</h2>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {selectedJob.requirements.requiredSkills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedJob.requirements.preferredSkills && selectedJob.requirements.preferredSkills.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold mb-3">歓迎スキル</h2>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {selectedJob.requirements.preferredSkills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h2 className="text-xl font-bold mb-3">期間</h2>
                      <p className="text-gray-700">
                        {selectedJob.duration.type === 'spot' ? 'スポット' : selectedJob.duration.type === 'short' ? '短期' : '長期'}
                        {selectedJob.duration.type !== 'spot' && selectedJob.duration.months && ` (${selectedJob.duration.months}ヶ月)`}
                      </p>
                    </div>

                    {selectedJob.budget && (
                      <div>
                        <h2 className="text-xl font-bold mb-3">
                          {selectedJob.duration.type === 'spot' ? '予算' : '月額単価'}
                        </h2>
                        <p className="text-gray-700">
                          {selectedJob.budget.min?.toLocaleString()}円 〜 {selectedJob.budget.max?.toLocaleString()}円
                          {selectedJob.duration.type !== 'spot' && '/月'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            案件がありません
          </div>
        )}
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
  )
}

export default JobList
