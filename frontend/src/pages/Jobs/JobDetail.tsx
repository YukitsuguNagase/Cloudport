import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Job } from '../../types/job'
import { getJobDetail } from '../../services/jobs'
import { getMyApplications } from '../../services/applications'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import JobDetailContent from '../../components/jobs/JobDetailContent'

function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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

  const handleApplySuccess = () => {
    setHasApplied(true)
    navigate('/applications')
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

      <JobDetailContent
        job={job}
        isOwner={isOwner}
        hasApplied={hasApplied}
        onApplySuccess={handleApplySuccess}
        backLink={
          <Link to={getBackLink()} className="text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300 font-medium">
            ← {getBackText()}
          </Link>
        }
      />
    </div>
  )
}

export default JobDetail
