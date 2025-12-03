import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Application } from '../../types/application'
import { getJobApplications, updateApplicationStatus } from '../../services/applications'
import { getJobDetail } from '../../services/jobs'
import { Job } from '../../types/job'
import { useAuth } from '../../contexts/AuthContext'
import { createConversation } from '../../services/messages'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/common/Pagination'

function ApplicantList() {
  const { jobId } = useParams<{ jobId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [job, setJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creatingConversation, setCreatingConversation] = useState<string | null>(null)
  const [showJobDetail, setShowJobDetail] = useState(false)

  // Pagination
  const { currentPage, totalPages, currentItems, goToPage } = usePagination({
    items: applications,
    itemsPerPage: 20
  })

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
      showSuccess(`応募を${status === 'interested' ? '興味ありに設定' : '見送り'}しました`)
    } catch (err: any) {
      showError(err.message || 'ステータスの更新に失敗しました')
    }
  }

  const handleStartConversation = async (applicationId: string) => {
    try {
      setCreatingConversation(applicationId)
      const conversation = await createConversation(applicationId)
      navigate(`/messages/${conversation.conversationId}`)
    } catch (err: any) {
      showError(err.message || 'メッセージの開始に失敗しました')
    } finally {
      setCreatingConversation(null)
    }
  }

  // Check if user is the job owner
  if (!loading && job && user?.userId !== job.companyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-20"></div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="glass-dark p-12 rounded-2xl border border-[#FF6B35]/30 shadow-2xl text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF6B35]/10 mb-4">
              <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-[#FF6B35] mb-4">この案件の応募者一覧を閲覧する権限がありません</p>
            <Link to="/jobs" className="text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300">
              案件一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-20"></div>
        <div className="container mx-auto px-4 py-8 relative z-10">
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

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs badge-primary">審査中</span>
      case 'interested':
        return <span className="px-3 py-1 rounded-full text-xs badge-cyan">興味あり</span>
      case 'passed':
        return <span className="px-3 py-1 rounded-full text-xs bg-[#E8EEF7]/20 text-[#E8EEF7]/60 border border-[#E8EEF7]/30">見送り</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#00E5FF]/10 rounded-full blur-3xl animate-cloud-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl animate-cloud-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10 flex-1">
        <div className="mb-6 animate-slide-down">
          <Link to={`/jobs/${jobId}`} className="text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300 font-medium inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            案件詳細に戻る
          </Link>
        </div>

        <div className="glass-dark rounded-2xl border border-[#00E5FF]/20 shadow-2xl p-6 mb-6 animate-slide-down">
          <div
            className="flex justify-between items-start cursor-pointer hover:opacity-90 transition-opacity duration-300"
            onClick={() => setShowJobDetail(!showJobDetail)}
          >
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2 font-mono">{job.title}</h1>
              <p className="text-[#E8EEF7]/60">応募者数: <span className="text-[#00E5FF] font-bold">{applications.length}件</span></p>
            </div>
            <div className="text-[#00E5FF] hover:text-[#5B8DEF] transition-colors duration-300">
              {showJobDetail ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>

          {showJobDetail && (
            <div className="mt-6 pt-6 border-t border-[#00E5FF]/20 space-y-6">
              {job.description && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">案件詳細</h3>
                  <p className="text-[#E8EEF7] whitespace-pre-wrap leading-relaxed">{job.description}</p>
                </div>
              )}

              {job.requirements?.awsServices && job.requirements.awsServices.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">必要なAWSサービス</h3>
                  <div className="flex gap-2 flex-wrap">
                    {job.requirements.awsServices.map((service) => (
                      <span
                        key={service}
                        className="bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 px-3 py-1 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.requirements?.certifications && job.requirements.certifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">必要なAWS資格</h3>
                  <div className="flex gap-2 flex-wrap">
                    {job.requirements.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="bg-[#5B8DEF]/20 text-[#5B8DEF] border border-[#5B8DEF]/30 px-3 py-1 rounded-full text-sm"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">案件情報</h3>
                <div className="grid grid-cols-2 gap-4">
                  {job.duration?.type && (
                    <div className="bg-[#0A1628]/30 p-3 rounded-lg border border-[#00E5FF]/10">
                      <p className="text-sm text-[#E8EEF7]/60 mb-1">期間タイプ</p>
                      <p className="font-semibold text-white">
                        {job.duration.type === 'spot' ? 'スポット' : job.duration.type === 'short' ? '短期' : '長期'}
                      </p>
                    </div>
                  )}
                  {job.budget && (job.budget.min || job.budget.max) && (
                    <div className="bg-[#0A1628]/30 p-3 rounded-lg border border-[#00E5FF]/10">
                      <p className="text-sm text-[#E8EEF7]/60 mb-1">予算</p>
                      <p className="font-semibold text-white">
                        {job.budget.min && `¥${job.budget.min.toLocaleString()}`}
                        {job.budget.min && job.budget.max && '〜'}
                        {job.budget.max && !job.budget.min && `〜¥${job.budget.max.toLocaleString()}`}
                        {job.budget.max && job.budget.min && `¥${job.budget.max.toLocaleString()}`}
                        {job.duration?.type !== 'spot' && '/月'}
                      </p>
                    </div>
                  )}
                  {job.location && (
                    <div className="bg-[#0A1628]/30 p-3 rounded-lg border border-[#00E5FF]/10">
                      <p className="text-sm text-[#E8EEF7]/60 mb-1">勤務地</p>
                      <p className="font-semibold text-white">{job.location}</p>
                    </div>
                  )}
                  {job.status && (
                    <div className="bg-[#0A1628]/30 p-3 rounded-lg border border-[#00E5FF]/10">
                      <p className="text-sm text-[#E8EEF7]/60 mb-1">ステータス</p>
                      <p className={`font-semibold ${
                        job.status === 'open' ? 'text-[#00E5FF]' :
                        job.status === 'filled' ? 'text-[#E8EEF7]/60' :
                        'text-[#FF6B35]'
                      }`}>
                        {job.status === 'open' ? '募集中' : job.status === 'filled' ? '募集終了' : 'クローズ'}
                      </p>
                    </div>
                  )}
                  {job.createdAt && (
                    <div className="bg-[#0A1628]/30 p-3 rounded-lg border border-[#00E5FF]/10">
                      <p className="text-sm text-[#E8EEF7]/60 mb-1">掲載日</p>
                      <p className="font-semibold text-white">{new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6">
          {currentItems.map((application, index) => (
            <div
              key={application.applicationId}
              className="glass-dark p-6 rounded-2xl border border-[#00E5FF]/20 shadow-xl animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold text-white">
                      {application.engineerName || '応募者'}
                    </h3>
                    {getStatusBadge(application.status)}
                    <span className="text-xs text-[#E8EEF7]/50 font-mono">
                      ID: {application.applicationId.slice(0, 8)}...
                    </span>
                  </div>
                  <p className="text-sm text-[#E8EEF7]/60">
                    応募日: {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white mb-2">応募メッセージ</h4>
                <div className="bg-[#0A1628]/30 border border-[#00E5FF]/10 p-4 rounded-lg">
                  <p className="text-[#E8EEF7] whitespace-pre-wrap leading-relaxed">
                    {application.message}
                  </p>
                </div>
              </div>

              {application.status === 'pending' && (
                <div className="flex gap-3 flex-wrap">
                  <Link
                    to={`/users/${application.engineerId}`}
                    className="flex-1 min-w-[150px] bg-[#0A1628]/50 border-2 border-[#00E5FF] text-[#00E5FF] py-3 px-4 rounded-lg hover:bg-[#00E5FF]/10 transition-all duration-300 text-center font-semibold"
                  >
                    プロフィールを見る
                  </Link>
                  <button
                    onClick={() => handleStatusUpdate(application.applicationId, 'interested')}
                    className="flex-1 min-w-[150px] bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all duration-300 font-semibold"
                  >
                    興味あり
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(application.applicationId, 'passed')}
                    className="flex-1 min-w-[150px] bg-[#E8EEF7]/10 border border-[#E8EEF7]/30 text-[#E8EEF7] py-3 px-4 rounded-lg hover:bg-[#E8EEF7]/20 transition-all duration-300 font-semibold"
                  >
                    見送る
                  </button>
                </div>
              )}

              {application.status === 'interested' && (
                <div className="flex gap-3 flex-wrap">
                  <Link
                    to={`/users/${application.engineerId}`}
                    className="flex-1 min-w-[200px] bg-[#0A1628]/50 border-2 border-[#00E5FF] text-[#00E5FF] py-3 px-4 rounded-lg hover:bg-[#00E5FF]/10 transition-all duration-300 text-center font-semibold"
                  >
                    プロフィールを見る
                  </Link>
                  <button
                    onClick={() => handleStartConversation(application.applicationId)}
                    disabled={creatingConversation === application.applicationId}
                    className="flex-1 min-w-[200px] bg-gradient-to-r from-[#5B8DEF] to-[#00E5FF] text-white py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-[#5B8DEF]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {creatingConversation === application.applicationId ? 'メッセージを開いています...' : 'メッセージを送る'}
                  </button>
                </div>
              )}

              {application.status === 'passed' && (
                <div>
                  <Link
                    to={`/users/${application.engineerId}`}
                    className="block w-full bg-[#0A1628]/50 border-2 border-[#E8EEF7]/30 text-[#E8EEF7] py-3 px-4 rounded-lg hover:bg-[#E8EEF7]/10 transition-all duration-300 text-center mb-3 font-semibold"
                  >
                    プロフィールを見る
                  </Link>
                  <div className="bg-[#E8EEF7]/10 border border-[#E8EEF7]/20 p-4 rounded-lg">
                    <p className="text-[#E8EEF7]/80 text-sm flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      この応募を見送りました
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {applications.length === 0 && (
          <div className="glass-dark p-12 rounded-2xl border border-[#00E5FF]/20 shadow-2xl text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00E5FF]/10 mb-4">
              <svg className="w-8 h-8 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-[#E8EEF7]/60">まだ応募者がいません</p>
          </div>
        )}

        {/* Pagination */}
        {applications.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}
      </div>
    </div>
  )
}

export default ApplicantList
