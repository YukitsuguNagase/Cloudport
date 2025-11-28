import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { createJob } from '../../services/jobs'
import { CreateJobInput, JobDurationType } from '../../types/job'
import { AWS_SERVICES, AWS_SERVICE_CATEGORIES } from '../../constants/awsServices'
import { AWS_CERTIFICATIONS } from '../../constants/awsCertifications'

function JobForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  // 企業以外はアクセス不可
  if (user?.userType !== 'company') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20 text-red-600">
            この機能は企業アカウント専用です
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

    if (selectedServices.length === 0) {
      setError('主要AWSサービスを少なくとも1つ選択してください')
      setLoading(false)
      return
    }

    try {
      const jobData: CreateJobInput = {
        title,
        description,
        requirements: {
          awsServices: selectedServices,
          certifications: selectedCertifications.length > 0 ? selectedCertifications : undefined,
          experience: experience || undefined,
          requiredSkills: requiredSkills ? requiredSkills.split('\n').filter(s => s.trim()) : undefined,
          preferredSkills: preferredSkills ? preferredSkills.split('\n').filter(s => s.trim()) : undefined,
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

      const createdJob = await createJob(jobData)
      navigate(`/jobs/${createdJob.jobId}`)
    } catch (err: any) {
      setError(err.message || '案件の投稿に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link to="/jobs" className="text-primary-600 hover:underline">
            ← 案件一覧に戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">案件投稿</h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                案件タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="例: AWSインフラ構築支援エンジニア募集"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                案件詳細 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="案件の詳細を記載してください"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                主要AWSサービス <span className="text-red-500">*</span>
              </label>
              <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {AWS_SERVICE_CATEGORIES.map(category => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-gray-600 mb-2">{category}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {AWS_SERVICES.filter(s => s.category === category).map(service => (
                        <label key={service.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service.name)}
                            onChange={() => handleServiceToggle(service.name)}
                            className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{service.name}</span>
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
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                必要なAWS資格（任意）
              </label>
              <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {['Foundational', 'Associate', 'Professional', 'Specialty'].map(category => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-gray-600 mb-2">{category}</h3>
                    <div className="space-y-1">
                      {AWS_CERTIFICATIONS.filter(c => c.category === category).map(cert => (
                        <label key={cert.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCertifications.includes(cert.name)}
                            onChange={() => handleCertificationToggle(cert.name)}
                            className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{cert.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                必要な経験（任意）
              </label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="例: AWS上でのWebアプリケーション開発経験3年以上"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                必須スキル（任意）
              </label>
              <textarea
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="1行に1つずつスキルを入力してください&#10;例:&#10;Terraformを使用したIaC実装経験&#10;CI/CDパイプラインの構築・運用経験&#10;コンテナオーケストレーション(ECS/EKS)の知識"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                歓迎スキル（任意）
              </label>
              <textarea
                value={preferredSkills}
                onChange={(e) => setPreferredSkills(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="1行に1つずつスキルを入力してください&#10;例:&#10;マイクロサービスアーキテクチャの設計経験&#10;セキュリティ対策の実装経験&#10;英語でのドキュメント作成能力"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                期間 <span className="text-red-500">*</span>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="期間（ヶ月）※任意"
                      min="1"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {durationType === 'spot' ? '予算（任意）' : '月額単価（任意）'}
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value ? parseInt(e.target.value) : '')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={durationType === 'spot' ? '最低予算（円）' : '最低単価（円/月）'}
                  min="0"
                />
                <span>〜</span>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value ? parseInt(e.target.value) : '')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={durationType === 'spot' ? '最高予算（円）' : '最高単価（円/月）'}
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loading ? '投稿中...' : '投稿する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default JobForm
