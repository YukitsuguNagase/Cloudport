import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Application } from '../../types/application'
import { getMyApplications } from '../../services/applications'
import { useAuth } from '../../contexts/AuthContext'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/common/Pagination'

function ApplicationList() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination
  const { currentPage, totalPages, currentItems, goToPage } = usePagination({
    items: applications,
    itemsPerPage: 20
  })

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
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-20"></div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="glass-dark p-12 rounded-2xl border border-[#FF6B35]/30 shadow-2xl text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF6B35]/10 mb-4">
              <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-[#FF6B35] mb-4">この機能は技術者アカウント専用です</p>
            <Link to="/jobs" className="text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300">
              案件一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-20"></div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center py-20">
            <svg className="animate-spin h-12 w-12 mx-auto text-[#00E5FF]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-white mt-4">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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
            <p className="text-[#FF6B35] mb-4">{error}</p>
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

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10 flex-1">
        <div className="flex justify-between items-center mb-8 animate-slide-down">
          <h1 className="text-3xl font-bold text-white font-mono">応募一覧</h1>
          <Link
            to="/jobs"
            className="text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300 font-medium"
          >
            案件一覧に戻る
          </Link>
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
                  <Link
                    to={`/jobs/${application.jobId}`}
                    className="text-xl font-bold text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300"
                  >
                    案件詳細を見る
                  </Link>
                  <div className="flex gap-4 items-center mt-2">
                    <span className="text-sm text-[#E8EEF7]/50">
                      応募日: {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                    {getStatusBadge(application.status)}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#E8EEF7] mb-2">応募メッセージ</h3>
                <p className="text-white whitespace-pre-wrap">{application.message}</p>
              </div>

              {application.status === 'interested' && (
                <div className="mt-4 p-4 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-lg">
                  <p className="text-[#00E5FF] text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    企業が興味を示しています。
                  </p>
                </div>
              )}

              {application.status === 'passed' && (
                <div className="mt-4 p-4 bg-[#E8EEF7]/10 border border-[#E8EEF7]/20 rounded-lg">
                  <p className="text-[#E8EEF7]/80 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    この案件は見送りとなりました。
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {applications.length === 0 && (
          <div className="glass-dark p-12 rounded-2xl border border-[#00E5FF]/20 shadow-2xl text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00E5FF]/10 mb-4">
              <svg className="w-8 h-8 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-[#E8EEF7]/60">応募履歴がありません</p>
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

export default ApplicationList
