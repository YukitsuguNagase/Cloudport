import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Job } from '../../types/job'
import { getJobDetail } from '../../services/jobs'
import { applyToJob, getMyApplications } from '../../services/applications'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [searchParams] = useSearchParams()
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
      showSuccess('応募が完了しました')
      // Optionally navigate to applications list
      navigate('/applications')
    } catch (err: any) {
      const errorMessage = err.message || '応募に失敗しました'
      setApplicationError(errorMessage)
      showError(errorMessage)
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 tech-grid opacity-20"></div>
        <div className="container mx-auto px-4 py-8 relative z-10 flex-1">
          <div className="glass-dark p-12 rounded-2xl border border-[#FF6B35]/30 shadow-2xl text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF6B35]/10 mb-4">
              <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[#FF6B35] mb-4">{error || '案件が見つかりません'}</p>
            <Link to="/jobs" className="text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300">
              案件一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = user?.userId === job.companyId
  const fromContracts = searchParams.get('from') === 'contracts'
  const fromMessages = searchParams.get('from') === 'messages'
  const conversationId = searchParams.get('conversationId')

  const getBackLink = () => {
    if (fromContracts) return "/contracts"
    if (fromMessages && conversationId) return `/messages/${conversationId}`
    return "/jobs"
  }

  const getBackText = () => {
    if (fromContracts) return "契約一覧に戻る"
    if (fromMessages) return "メッセージに戻る"
    return "案件一覧に戻る"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#00E5FF]/10 rounded-full blur-3xl animate-cloud-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl animate-cloud-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10 flex-1">
        <div className="mb-6 animate-slide-down">
          <Link to={getBackLink()} className="text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300 font-medium">
            ← {getBackText()}
          </Link>
        </div>

        <div className="glass-dark rounded-2xl border border-[#00E5FF]/20 shadow-2xl p-8 animate-slide-up">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2 font-mono">{job.title}</h1>
              {job.companyName && (
                <p className="text-lg text-[#E8EEF7] mb-3">企業: {job.companyName}</p>
              )}
              <div className="flex gap-4 text-sm text-[#E8EEF7]/60">
                <span>掲載日: {new Date(job.createdAt).toLocaleDateString()}</span>
                <span>応募数: {job.applicationCount}件</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === 'open'
                      ? 'badge-success'
                      : job.status === 'filled'
                      ? 'bg-[#E8EEF7]/20 text-[#E8EEF7]/60 border border-[#E8EEF7]/30'
                      : 'badge-danger'
                  }`}
                >
                  {job.status === 'open' ? '募集中' : job.status === 'filled' ? '募集終了' : 'クローズ'}
                </span>
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-2 flex-wrap">
                <Link
                  to={`/jobs/${jobId}/edit`}
                  className="bg-[#E8EEF7]/10 border border-[#E8EEF7]/30 text-[#E8EEF7] px-4 py-2 rounded-lg hover:bg-[#E8EEF7]/20 transition-all duration-300 font-semibold"
                >
                  編集
                </Link>
                <Link
                  to={`/jobs/${jobId}/applicants`}
                  className="bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all duration-300 font-semibold"
                >
                  応募者一覧
                </Link>
              </div>
            )}
            {user?.userType === 'engineer' && job.status === 'open' && (
              hasApplied ? (
                <button
                  disabled
                  className="bg-[#E8EEF7]/10 border border-[#E8EEF7]/30 text-[#E8EEF7]/60 px-6 py-2 rounded-lg cursor-not-allowed"
                >
                  応募済み
                </button>
              ) : (
                <button
                  onClick={() => setShowApplicationModal(true)}
                  className="bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all duration-300 font-semibold"
                >
                  応募する
                </button>
              )
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-3">案件概要</h2>
              <p className="text-[#E8EEF7] whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </div>

            {job.location && (
              <div>
                <h2 className="text-xl font-bold text-white mb-3">勤務地</h2>
                <p className="text-[#E8EEF7]">{job.location}</p>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-white mb-3">主要AWSサービス</h2>
              <div className="flex flex-wrap gap-2">
                {job.requirements.awsServices.map((service) => (
                  <span
                    key={service}
                    className="px-3 py-1 bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] rounded-full text-sm font-medium"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {job.requirements.certifications && job.requirements.certifications.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-3">必要なAWS資格</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#FF6B35]/20 border border-[#FF6B35]/40 text-[#FF6B35] rounded-full text-sm font-medium"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.requirements.experience && (
              <div>
                <h2 className="text-xl font-bold text-white mb-3">必要な経験</h2>
                <p className="text-[#E8EEF7]">{job.requirements.experience}</p>
              </div>
            )}

            {job.requirements.requiredSkills && job.requirements.requiredSkills.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-3">必須スキル</h2>
                <ul className="list-disc list-inside space-y-1 text-[#E8EEF7]">
                  {job.requirements.requiredSkills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.requirements.preferredSkills && job.requirements.preferredSkills.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-3">歓迎スキル</h2>
                <ul className="list-disc list-inside space-y-1 text-[#E8EEF7]">
                  {job.requirements.preferredSkills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-white mb-3">期間</h2>
              <p className="text-[#E8EEF7]">
                {job.duration.type === 'spot' ? 'スポット' : job.duration.type === 'short' ? '短期' : '長期'}
                {job.duration.type !== 'spot' && job.duration.months && ` (${job.duration.months}ヶ月)`}
              </p>
            </div>

            {job.budget && (
              <div>
                <h2 className="text-xl font-bold text-white mb-3">
                  {job.duration.type === 'spot' ? '予算' : '月額単価'}
                </h2>
                <p className="text-[#E8EEF7] text-lg font-semibold">
                  {job.budget.min?.toLocaleString()}円 〜 {job.budget.max?.toLocaleString()}円
                  {job.duration.type !== 'spot' && '/月'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Application Modal */}
        {showApplicationModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="glass-dark border border-[#00E5FF]/30 rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 animate-scale-in">
              <h2 className="text-2xl font-bold text-white mb-4 font-mono">案件に応募する</h2>

              {applicationError && (
                <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] p-4 rounded-lg mb-4">
                  {applicationError}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#E8EEF7] mb-2">
                  応募メッセージ <span className="text-[#FF6B35]">*</span>
                </label>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
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
                  className="flex-1 bg-[#E8EEF7]/10 border border-[#E8EEF7]/30 text-[#E8EEF7] py-3 rounded-lg font-semibold hover:bg-[#E8EEF7]/20 transition-all duration-300"
                  disabled={applying}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="flex-1 bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all duration-300 disabled:opacity-50"
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
