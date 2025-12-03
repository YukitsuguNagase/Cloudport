import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Job } from '../../types/job'
import { getJobs, getJobDetail } from '../../services/jobs'
import { useAuth } from '../../contexts/AuthContext'
import { applyToJob, getMyApplications } from '../../services/applications'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { validateApplicationMessage, sanitizeInput } from '../../utils/validation'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/common/Pagination'

function JobList() {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
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

  // Search and filter states
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedAwsServices, setSelectedAwsServices] = useState<string[]>([])
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])
  const [budgetMin, setBudgetMin] = useState<number | ''>('')
  const [budgetMax, setBudgetMax] = useState<number | ''>('')
  const [selectedDurationType, setSelectedDurationType] = useState<string>('')

  // Pagination
  const { currentPage, totalPages, currentItems, goToPage } = usePagination({
    items: filteredJobs,
    itemsPerPage: 20
  })
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    if (selectedJobId) {
      fetchJobDetail(selectedJobId)
    }
  }, [selectedJobId])

  useEffect(() => {
    // Only reset filters when jobs are fetched
    setFilteredJobs(jobs)
  }, [jobs])

  const fetchJobs = async () => {
    try {
      const data = await getJobs()
      setJobs(data)
      setFilteredJobs(data)
    } catch (err: any) {
      setError(err.message || '案件の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...jobs]

    // Keyword search (title and description)
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(keyword) ||
        job.description.toLowerCase().includes(keyword)
      )
    }

    // AWS Services filter (AND condition - job must have ALL selected services)
    if (selectedAwsServices.length > 0) {
      filtered = filtered.filter(job =>
        selectedAwsServices.every(service =>
          job.requirements.awsServices.includes(service)
        )
      )
    }

    // Certifications filter (AND condition - job must require ALL selected certifications)
    if (selectedCertifications.length > 0) {
      filtered = filtered.filter(job =>
        job.requirements.certifications &&
        selectedCertifications.every(cert =>
          job.requirements.certifications?.includes(cert)
        )
      )
    }

    // Budget range filter
    if (budgetMin !== '' || budgetMax !== '') {
      filtered = filtered.filter(job => {
        if (!job.budget) return false
        // Use job's max budget for comparison, or min if max is not available
        const jobBudget = job.budget.max || job.budget.min || 0

        // Check minimum budget if specified
        if (budgetMin !== '' && jobBudget < budgetMin) return false

        // Check maximum budget if specified
        if (budgetMax !== '' && jobBudget > budgetMax) return false

        return true
      })
    }

    // Duration type filter
    if (selectedDurationType) {
      filtered = filtered.filter(job => job.duration.type === selectedDurationType)
    }

    // Remote only filter
    if (remoteOnly) {
      filtered = filtered.filter(job => job.location?.toLowerCase().includes('remote') || job.location?.toLowerCase().includes('リモート'))
    }

    setFilteredJobs(filtered)
  }

  const clearFilters = () => {
    setSearchKeyword('')
    setSelectedAwsServices([])
    setSelectedCertifications([])
    setBudgetMin('')
    setBudgetMax('')
    setSelectedDurationType('')
    setRemoteOnly(false)
    // Reset to show all jobs
    setFilteredJobs(jobs)
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
    // Validate application message
    const validation = validateApplicationMessage(applicationMessage)
    if (!validation.isValid) {
      setApplicationError(validation.error!)
      showError(validation.error!)
      return
    }

    setApplying(true)
    setApplicationError('')

    try {
      await applyToJob(selectedJobId!, { message: sanitizeInput(applicationMessage) })
      setShowApplicationModal(false)
      setApplicationMessage('')
      setHasApplied(true)
      showSuccess('応募が完了しました')
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-20"></div>
        <div className="glass-dark p-12 rounded-2xl border border-[#FF6B35]/30 text-center animate-scale-in relative z-10 max-w-md mx-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF6B35]/10 mb-4">
            <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#FF6B35] text-lg font-semibold">{error}</p>
        </div>
      </div>
    )
  }

  const isOwner = selectedJob && user?.userId === selectedJob.companyId

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#00E5FF]/10 rounded-full blur-3xl animate-cloud-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl animate-cloud-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 py-8 relative z-10 flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white font-mono">
            <span className="gradient-text-cyan">案件</span>
            <span className="text-[#FF6B35]">一覧</span>
          </h1>
          {user?.userType === 'company' && (
            <Link
              to="/jobs/new"
              className="btn-primary px-6 py-3 rounded-lg transition-all duration-300"
            >
              案件を投稿
            </Link>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="glass-dark p-6 rounded-2xl border border-[#00E5FF]/20 shadow-2xl mb-6 animate-slide-down">
          {/* Search bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="キーワードで検索（案件タイトル、説明文）"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    applyFilters()
                  }
                }}
                className="w-full px-4 py-3 pl-10 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-[#00E5FF]/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-[#00E5FF] hover:text-[#5B8DEF] transition-colors duration-300 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="font-semibold">
              {showFilters ? 'フィルタを閉じる' : '詳細フィルタ'}
            </span>
          </button>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t border-[#00E5FF]/10">
              {/* Budget range */}
              <div>
                <label className="block text-sm font-semibold text-[#E8EEF7] mb-2">
                  予算範囲（月額・万円）
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    placeholder="下限"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value ? Number(e.target.value) : '')}
                    className="flex-1 px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                  />
                  <span className="text-[#E8EEF7]/60">〜</span>
                  <input
                    type="number"
                    placeholder="上限"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value ? Number(e.target.value) : '')}
                    className="flex-1 px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              {/* Duration type */}
              <div>
                <label className="block text-sm font-semibold text-[#E8EEF7] mb-2">
                  期間タイプ
                </label>
                <select
                  value={selectedDurationType}
                  onChange={(e) => setSelectedDurationType(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                >
                  <option value="">すべて</option>
                  <option value="spot">スポット</option>
                  <option value="short">短期</option>
                  <option value="long">長期</option>
                </select>
              </div>

              {/* Remote only checkbox */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                    className="w-4 h-4 text-[#00E5FF] bg-[#0A1628]/50 border-[#00E5FF]/30 rounded focus:ring-2 focus:ring-[#00E5FF] transition-all duration-300"
                  />
                  <span className="text-sm font-semibold text-[#E8EEF7]">
                    リモート可の案件のみ
                  </span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-[#1A2942]/80 text-[#E8EEF7] py-2 px-4 rounded-lg hover:bg-[#2C4875] transition-all duration-300 font-semibold"
                >
                  フィルタをクリア
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 btn-primary py-2 px-4 rounded-lg font-semibold"
                >
                  検索
                </button>
              </div>
            </div>
          )}

          {/* Search button (always visible) */}
          {!showFilters && (
            <div className="mt-4">
              <button
                onClick={applyFilters}
                className="w-full btn-primary py-3 px-4 rounded-lg font-semibold"
              >
                検索
              </button>
            </div>
          )}

          {/* Results count */}
          <div className="mt-4 text-sm text-[#00E5FF] font-mono">
            {filteredJobs.length}件の案件が見つかりました
          </div>
        </div>

        <div className="grid gap-6">
          {currentItems.map((job) => (
            <div key={job.jobId}>
              <div
                onClick={() => handleJobClick(job.jobId)}
                className={`glass-dark p-6 rounded-2xl border shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer card-hover animate-slide-up ${
                  selectedJobId === job.jobId ? 'border-[#00E5FF] ring-2 ring-[#00E5FF]/50' : 'border-[#00E5FF]/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{job.title}</h3>
                    {job.companyName && (
                      <p className="text-sm text-[#E8EEF7]/60 mt-1">企業: {job.companyName}</p>
                    )}
                  </div>
                  {job.status === 'filled' && (
                    <span className="px-3 py-1 rounded-full text-xs bg-[#2C4875]/50 text-[#E8EEF7] font-semibold border border-[#E8EEF7]/20">
                      募集終了
                    </span>
                  )}
                  {job.status === 'closed' && (
                    <span className="px-3 py-1 rounded-full text-xs bg-[#FF6B35]/20 text-[#FF6B35] font-semibold border border-[#FF6B35]/30">
                      クローズ
                    </span>
                  )}
                </div>
                <p className="text-[#E8EEF7]/80 mb-4 line-clamp-2">{job.description}</p>

                <div className="mb-3">
                  <p className="text-xs font-semibold text-[#E8EEF7]/60 mb-2">主要AWSサービス</p>
                  <div className="flex gap-2 flex-wrap">
                    {job.requirements.awsServices.slice(0, 5).map((service) => (
                      <span
                        key={service}
                        className="badge-cyan px-3 py-1 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                    {job.requirements.awsServices.length > 5 && (
                      <span className="bg-[#2C4875]/30 text-[#E8EEF7] px-3 py-1 rounded-full text-sm border border-[#E8EEF7]/20">
                        +{job.requirements.awsServices.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                {job.requirements.certifications && job.requirements.certifications.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-[#E8EEF7]/60 mb-2">必要なAWS資格</p>
                    <div className="flex gap-2 flex-wrap">
                      {job.requirements.certifications.slice(0, 3).map((cert) => (
                        <span
                          key={cert}
                          className="badge-primary px-3 py-1 rounded-full text-sm"
                        >
                          {cert}
                        </span>
                      ))}
                      {job.requirements.certifications.length > 3 && (
                        <span className="bg-[#2C4875]/30 text-[#E8EEF7] px-3 py-1 rounded-full text-sm border border-[#E8EEF7]/20">
                          +{job.requirements.certifications.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm">
                  <div className="flex gap-4">
                    <span className="text-[#E8EEF7]/60">
                      {job.duration.type === 'spot' ? 'スポット' : job.duration.type === 'short' ? '短期' : '長期'}
                    </span>
                    {job.budget && (job.budget.min || job.budget.max) && (
                      <span className="font-semibold text-[#FF6B35]">
                        {job.budget.min && `¥${job.budget.min.toLocaleString()}`}
                        {job.budget.min && job.budget.max && '〜'}
                        {job.budget.max && !job.budget.min && `〜¥${job.budget.max.toLocaleString()}`}
                        {job.duration.type !== 'spot' && '/月'}
                      </span>
                    )}
                  </div>
                  <span className="text-[#E8EEF7]/60">{job.applicationCount}件の応募</span>
                </div>
              </div>

              {/* Expanded detail view */}
              {selectedJobId === job.jobId && selectedJob && !loadingDetail && (
                <div className="glass-dark border-t-2 border-[#00E5FF] p-8 rounded-b-2xl shadow-2xl animate-slide-down">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex gap-4 text-sm text-[#E8EEF7]/60 mb-4">
                          <span>掲載日: {new Date(selectedJob.createdAt).toLocaleDateString()}</span>
                          <span>応募数: {selectedJob.applicationCount}件</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              selectedJob.status === 'open'
                                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30'
                                : selectedJob.status === 'filled'
                                ? 'bg-[#2C4875]/50 text-[#E8EEF7] border border-[#E8EEF7]/20'
                                : 'bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30'
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
                            className="bg-[#1A2942]/80 text-[#E8EEF7] px-4 py-2 rounded-lg hover:bg-[#2C4875] transition-all duration-300 font-semibold"
                          >
                            編集
                          </Link>
                          <Link
                            to={`/jobs/${selectedJobId}/applicants`}
                            className="btn-primary px-4 py-2 rounded-lg font-semibold"
                          >
                            応募者一覧
                          </Link>
                        </div>
                      )}
                      {user?.userType === 'engineer' && selectedJob.status === 'open' && (
                        hasApplied ? (
                          <button
                            disabled
                            className="bg-[#2C4875]/50 text-[#E8EEF7]/50 px-6 py-3 rounded-lg cursor-not-allowed w-full font-semibold border border-[#E8EEF7]/20"
                          >
                            応募済み
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowApplicationModal(true)}
                            className="btn-primary px-6 py-3 rounded-lg w-full font-semibold"
                          >
                            応募する
                          </button>
                        )
                      )}
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-white mb-3">案件概要</h2>
                      <p className="text-[#E8EEF7]/80 whitespace-pre-wrap">{selectedJob.description}</p>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-white mb-3">主要AWSサービス</h2>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.requirements.awsServices.map((service) => (
                          <span
                            key={service}
                            className="badge-cyan px-3 py-1 rounded-full text-sm"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedJob.requirements.certifications && selectedJob.requirements.certifications.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-white mb-3">必要なAWS資格</h2>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.requirements.certifications.map((cert, index) => (
                            <span
                              key={index}
                              className="badge-primary px-3 py-1 rounded-full text-sm"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedJob.requirements.experience && (
                      <div>
                        <h2 className="text-xl font-bold text-white mb-3">必要な経験</h2>
                        <p className="text-[#E8EEF7]/80">{selectedJob.requirements.experience}</p>
                      </div>
                    )}

                    {selectedJob.requirements.requiredSkills && selectedJob.requirements.requiredSkills.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-white mb-3">必須スキル</h2>
                        <ul className="list-disc list-inside space-y-1 text-[#E8EEF7]/80">
                          {selectedJob.requirements.requiredSkills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedJob.requirements.preferredSkills && selectedJob.requirements.preferredSkills.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-white mb-3">歓迎スキル</h2>
                        <ul className="list-disc list-inside space-y-1 text-[#E8EEF7]/80">
                          {selectedJob.requirements.preferredSkills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h2 className="text-xl font-bold text-white mb-3">期間</h2>
                      <p className="text-[#E8EEF7]/80">
                        {selectedJob.duration.type === 'spot' ? 'スポット' : selectedJob.duration.type === 'short' ? '短期' : '長期'}
                        {selectedJob.duration.type !== 'spot' && selectedJob.duration.months && ` (${selectedJob.duration.months}ヶ月)`}
                      </p>
                    </div>

                    {selectedJob.budget && (
                      <div>
                        <h2 className="text-xl font-bold text-white mb-3">
                          {selectedJob.duration.type === 'spot' ? '予算' : '月額単価'}
                        </h2>
                        <p className="text-[#FF6B35] font-semibold text-lg">
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

        {filteredJobs.length === 0 && jobs.length > 0 && (
          <div className="glass-dark p-12 rounded-2xl border border-[#00E5FF]/20 text-center animate-slide-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF6B35]/10 mb-4">
              <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-[#E8EEF7] text-lg">検索条件に一致する案件が見つかりませんでした</p>
          </div>
        )}

        {jobs.length === 0 && !loading && (
          <div className="glass-dark p-12 rounded-2xl border border-[#00E5FF]/20 text-center animate-slide-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00E5FF]/10 mb-4">
              <svg className="w-8 h-8 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-[#E8EEF7] text-lg">案件がありません</p>
          </div>
        )}

        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-dark rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 border border-[#00E5FF]/20 animate-scale-in">
            <h2 className="text-2xl font-bold text-white mb-4">案件に応募する</h2>

            {applicationError && (
              <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] p-4 rounded-lg mb-4 animate-slide-down">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {applicationError}
                </div>
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
                className="flex-1 bg-[#1A2942]/80 text-[#E8EEF7] py-3 rounded-lg font-semibold hover:bg-[#2C4875] transition-all duration-300"
                disabled={applying}
              >
                キャンセル
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 btn-primary py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    応募中...
                  </span>
                ) : '応募する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobList
