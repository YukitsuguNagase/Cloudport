import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getJobDetail, updateJob, deleteJob } from '../../services/jobs'
import { UpdateJobInput, JobDurationType, Job } from '../../types/job'
import { AWS_SERVICES, AWS_SERVICE_CATEGORIES } from '../../constants/awsServices'
import { AWS_CERTIFICATIONS } from '../../constants/awsCertifications'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { validateJobForm, sanitizeInput } from '../../utils/validation'

function JobEdit() {
  const navigate = useNavigate()
  const { jobId } = useParams<{ jobId: string }>()
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [fetchingJob, setFetchingJob] = useState(true)
  const [error, setError] = useState('')
  const [job, setJob] = useState<Job | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])
  const [experience, setExperience] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [preferredSkills, setPreferredSkills] = useState('')
  const [durationType, setDurationType] = useState<JobDurationType>('long')
  const [durationMonths, setDurationMonths] = useState<number | ''>('')
  const [budgetMin, setBudgetMin] = useState<number | ''>('')
  const [budgetMax, setBudgetMax] = useState<number | ''>('')

  useEffect(() => {
    if (jobId && user) {
      fetchJob()
    }
  }, [jobId, user])

  const fetchJob = async () => {
    try {
      setFetchingJob(true)
      const jobData = await getJobDetail(jobId!)
      setJob(jobData)

      // Verify ownership
      if (jobData.companyId !== user?.userId) {
        setError('この案件を編集する権限がありません')
        return
      }

      // Populate form fields
      setTitle(jobData.title)
      setDescription(jobData.description)
      setSelectedServices(jobData.requirements.awsServices)
      setSelectedCertifications(jobData.requirements.certifications || [])
      setExperience(jobData.requirements.experience || '')
      setRequiredSkills(jobData.requirements.requiredSkills?.join('\n') || '')
      setPreferredSkills(jobData.requirements.preferredSkills?.join('\n') || '')
      setDurationType(jobData.duration.type)
      setDurationMonths(jobData.duration.months || '')
      setBudgetMin(jobData.budget?.min || '')
      setBudgetMax(jobData.budget?.max || '')
    } catch (err: any) {
      setError(err.message || '案件の取得に失敗しました')
    } finally {
      setFetchingJob(false)
    }
  }

  // ユーザー情報が読み込まれるまでローディング表示
  if (!user) {
    return <LoadingSpinner fullScreen />
  }

  // 企業以外はアクセス不可
  if (user.userType !== 'company') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 tech-grid opacity-20"></div>
        <div className="container mx-auto px-4 py-8 relative z-10 flex-1">
          <div className="glass-dark p-12 rounded-2xl border border-[#FF6B35]/30 shadow-2xl text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF6B35]/10 mb-4">
              <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-[#FF6B35] mb-4">この機能は企業アカウント専用です</p>
            <Link to="/jobs" className="text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300">
              案件一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (fetchingJob) {
    return <LoadingSpinner fullScreen />
  }

  if (error && !job) {
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
            <p className="text-[#FF6B35] mb-4">{error}</p>
            <Link to="/jobs" className="text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300">
              ← 案件一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleServiceToggle = (serviceName: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceName)) {
        return prev.filter(s => s !== serviceName)
      } else {
        return [...prev, serviceName]
      }
    })
  }

  const handleCertificationToggle = (certName: string) => {
    setSelectedCertifications(prev => {
      if (prev.includes(certName)) {
        return prev.filter(c => c !== certName)
      } else {
        return [...prev, certName]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate form
    const validation = validateJobForm({
      title,
      description,
      budgetMin,
      budgetMax
    })

    if (!validation.isValid) {
      setError(validation.error!)
      setLoading(false)
      showError(validation.error!)
      return
    }

    if (selectedServices.length === 0) {
      setError('主要AWSサービスを少なくとも1つ選択してください')
      setLoading(false)
      showError('主要AWSサービスを少なくとも1つ選択してください')
      return
    }

    try {
      const jobData: UpdateJobInput = {
        title: sanitizeInput(title),
        description: sanitizeInput(description),
        requirements: {
          awsServices: selectedServices,
          certifications: selectedCertifications.length > 0 ? selectedCertifications : undefined,
          experience: experience ? sanitizeInput(experience) : undefined,
          requiredSkills: requiredSkills ? requiredSkills.split('\n').filter(s => s.trim()).map(s => sanitizeInput(s)) : undefined,
          preferredSkills: preferredSkills ? preferredSkills.split('\n').filter(s => s.trim()).map(s => sanitizeInput(s)) : undefined,
        },
        duration: {
          type: durationType,
          months: durationMonths ? Number(durationMonths) : undefined,
        },
        budget:
          budgetMin || budgetMax
            ? {
                min: budgetMin ? Number(budgetMin) : undefined,
                max: budgetMax ? Number(budgetMax) : undefined,
              }
            : undefined,
      }

      await updateJob(jobId!, jobData)
      navigate(`/jobs/${jobId}`)
    } catch (err: any) {
      setError(err.message || '案件の更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await deleteJob(jobId!)
      showSuccess('案件を削除しました')
      navigate('/jobs')
    } catch (err: any) {
      showError(err.message || '案件の削除に失敗しました')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#00E5FF]/10 rounded-full blur-3xl animate-cloud-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl animate-cloud-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10 flex-1">
        <div className="mb-6 animate-slide-down">
          <Link to={`/jobs/${jobId}`} className="text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300 font-medium">
            ← 案件詳細に戻る
          </Link>
        </div>

        <div className="glass-dark rounded-2xl border border-[#00E5FF]/20 shadow-2xl p-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-white mb-6 font-mono">案件編集</h1>

          {error && (
            <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                案件タイトル <span className="text-[#FF6B35]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-[#00E5FF]/20 bg-[#0A1628]/50 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                placeholder="例: AWSインフラ構築支援エンジニア募集"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                案件詳細 <span className="text-[#FF6B35]">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={8}
                className="w-full px-4 py-2 border border-[#00E5FF]/20 bg-[#0A1628]/50 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                placeholder="案件の詳細を記載してください"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-3">
                主要AWSサービス <span className="text-[#FF6B35]">*</span>
              </label>
              <div className="space-y-4 max-h-96 overflow-y-auto bg-[#0A1628]/30 border border-[#00E5FF]/10 rounded-lg p-4">
                {AWS_SERVICE_CATEGORIES.map(category => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-[#00E5FF] mb-2">{category}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {AWS_SERVICES.filter(s => s.category === category).map(service => (
                        <label key={service.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service.name)}
                            onChange={() => handleServiceToggle(service.name)}
                            className="mr-2 h-4 w-4 text-[#00E5FF] focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-white">{service.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {selectedServices.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedServices.map(service => (
                    <span
                      key={service}
                      className="px-3 py-1 bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] rounded-full text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-3">
                必要なAWS資格（任意）
              </label>
              <div className="space-y-3 max-h-64 overflow-y-auto bg-[#0A1628]/30 border border-[#00E5FF]/10 rounded-lg p-4">
                {['Foundational', 'Associate', 'Professional', 'Specialty'].map(category => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-[#00E5FF] mb-2">{category}</h3>
                    <div className="space-y-1">
                      {AWS_CERTIFICATIONS.filter(c => c.category === category).map(cert => (
                        <label key={cert.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCertifications.includes(cert.name)}
                            onChange={() => handleCertificationToggle(cert.name)}
                            className="mr-2 h-4 w-4 text-[#00E5FF] focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-white">{cert.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                必要な経験（任意）
              </label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-[#00E5FF]/20 bg-[#0A1628]/50 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                placeholder="例: AWS上でのWebアプリケーション開発経験3年以上"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                必須スキル（任意）
              </label>
              <textarea
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-[#00E5FF]/20 bg-[#0A1628]/50 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                placeholder="1行に1つずつスキルを入力してください&#10;例:&#10;Terraformを使用したIaC実装経験&#10;CI/CDパイプラインの構築・運用経験&#10;コンテナオーケストレーション(ECS/EKS)の知識"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                歓迎スキル（任意）
              </label>
              <textarea
                value={preferredSkills}
                onChange={(e) => setPreferredSkills(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-[#00E5FF]/20 bg-[#0A1628]/50 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                placeholder="1行に1つずつスキルを入力してください&#10;例:&#10;マイクロサービスアーキテクチャの設計経験&#10;セキュリティ対策の実装経験&#10;英語でのドキュメント作成能力"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                期間 <span className="text-[#FF6B35]">*</span>
              </label>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="spot"
                      checked={durationType === 'spot'}
                      onChange={(e) => setDurationType(e.target.value as JobDurationType)}
                      className="mr-2"
                    />
                    スポット
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="short"
                      checked={durationType === 'short'}
                      onChange={(e) => setDurationType(e.target.value as JobDurationType)}
                      className="mr-2"
                    />
                    短期
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="long"
                      checked={durationType === 'long'}
                      onChange={(e) => setDurationType(e.target.value as JobDurationType)}
                      className="mr-2"
                    />
                    長期
                  </label>
                </div>
                {durationType !== 'spot' && (
                  <div>
                    <input
                      type="number"
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full px-4 py-2 border border-[#00E5FF]/20 bg-[#0A1628]/50 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                      placeholder="期間（ヶ月）※任意"
                      min="1"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {durationType === 'spot' ? '予算（任意）' : '月額単価（任意）'}
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value ? parseInt(e.target.value) : '')}
                  className="flex-1 px-4 py-2 border border-[#00E5FF]/20 bg-[#0A1628]/50 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                  placeholder={durationType === 'spot' ? '最低予算（円）' : '最低単価（円/月）'}
                  min="0"
                />
                <span>〜</span>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value ? parseInt(e.target.value) : '')}
                  className="flex-1 px-4 py-2 border border-[#00E5FF]/20 bg-[#0A1628]/50 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                  placeholder={durationType === 'spot' ? '最高予算（円）' : '最高単価（円/月）'}
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(`/jobs/${jobId}`)}
                className="flex-1 bg-gray-200 text-white py-3 rounded-lg font-semibold hover:bg-[#E8EEF7]/20 transition-all duration-300 transition"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all duration-300 font-semibold disabled:opacity-50"
              >
                {loading ? '更新中...' : '案件を更新'}
              </button>
            </div>
          </form>

          {/* Delete button outside of form */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? '削除中...' : 'この案件を削除'}
            </button>
            <p className="text-sm text-gray-500 text-center mt-2">
              削除すると、関連する応募情報も全て削除されます。この操作は取り消せません。
            </p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        title="案件を削除"
        message="この案件を削除しますか？&#10;&#10;削除すると、関連する応募情報も全て削除されます。この操作は取り消せません。"
        confirmText="削除"
        cancelText="キャンセル"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isOpen={showDeleteConfirm}
      />
    </div>
  )
}

export default JobEdit
