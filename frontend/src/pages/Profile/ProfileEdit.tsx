import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { updateProfile } from '../../services/users'
import { EngineerProfile, CompanyProfile } from '../../types/user'
import { AWS_CERTIFICATIONS } from '../../constants/awsCertifications'
import { validateProfileForm, sanitizeInput } from '../../utils/validation'
import { useToast } from '../../contexts/ToastContext'
import { PREFECTURES } from '../../constants/prefectures'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function ProfileEdit() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const { showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // エンジニア用のフォーム状態
  const [engineerProfile, setEngineerProfile] = useState<Partial<EngineerProfile>>({})
  // 企業用のフォーム状態
  const [companyProfile, setCompanyProfile] = useState<Partial<CompanyProfile>>({})
  // 企業の業種選択状態
  const [industries, setIndustries] = useState<string[]>([])
  // AWS資格の選択状態
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])
  // AWS実務経験年数の入力用
  const [awsExperience, setAwsExperience] = useState<{ service: string; years: number }[]>([])
  // 過去のプロジェクト実績の入力用
  const [pastProjects, setPastProjects] = useState<Array<{ title: string; description: string; role: string; period: string; awsServices?: string[] }>>([])

  useEffect(() => {
    if (user) {
      if (user.userType === 'engineer') {
        const profile = user.profile as EngineerProfile
        setEngineerProfile(profile)
        // 既存の資格からIDのリストを抽出
        if (profile.certifications) {
          setSelectedCertifications(profile.certifications.map(cert => cert.name))
        }
        // AWS実務経験年数の初期値
        if (profile.awsExperienceYears) {
          setAwsExperience(profile.awsExperienceYears)
        }
        // 過去のプロジェクト実績の初期値
        if (profile.pastProjects) {
          setPastProjects(profile.pastProjects)
        }
      } else {
        const compProfile = user.profile as CompanyProfile
        setCompanyProfile(compProfile)
        // 業種の初期値
        if (compProfile.industry) {
          setIndustries(compProfile.industry)
        }
      }
    }
  }, [user])

  const handleCertificationToggle = (certName: string) => {
    setSelectedCertifications(prev => {
      if (prev.includes(certName)) {
        return prev.filter(c => c !== certName)
      } else {
        return [...prev, certName]
      }
    })
  }

  const addAwsExperience = () => {
    setAwsExperience([...awsExperience, { service: '', years: 0 }])
  }

  const removeAwsExperience = (index: number) => {
    setAwsExperience(awsExperience.filter((_, i) => i !== index))
  }

  const updateAwsExperience = (index: number, field: 'service' | 'years', value: string | number) => {
    const updated = [...awsExperience]
    updated[index] = { ...updated[index], [field]: value }
    setAwsExperience(updated)
  }

  const addPastProject = () => {
    setPastProjects([...pastProjects, { title: '', description: '', role: '', period: '' }])
  }

  const removePastProject = (index: number) => {
    setPastProjects(pastProjects.filter((_, i) => i !== index))
  }

  const updatePastProject = (index: number, field: keyof typeof pastProjects[0], value: string) => {
    const updated = [...pastProjects]
    updated[index] = { ...updated[index], [field]: value }
    setPastProjects(updated)
  }

  const addIndustry = () => {
    setIndustries([...industries, ''])
  }

  const removeIndustry = (index: number) => {
    setIndustries(industries.filter((_, i) => i !== index))
  }

  const updateIndustry = (index: number, value: string) => {
    const updated = [...industries]
    updated[index] = value
    setIndustries(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    // Validate profile data
    const validation = validateProfileForm({
      name: user?.userType === 'engineer' ? engineerProfile.displayName || '' : companyProfile.companyName || '',
      bio: user?.userType === 'engineer' ? engineerProfile.bio : companyProfile.businessDescription,
      hourlyRate: user?.userType === 'engineer' ? engineerProfile.hourlyRate?.min : undefined
    })

    if (!validation.isValid) {
      setError(validation.error!)
      setLoading(false)
      showError(validation.error!)
      return
    }

    try {
      let profileData
      if (user?.userType === 'engineer') {
        // 選択されたAWS資格を含める
        const certifications = selectedCertifications.map(certName => ({
          name: certName,
          obtainedAt: new Date().toISOString(), // 取得日はダミー（後で詳細入力機能を追加予定）
        }))
        profileData = {
          ...engineerProfile,
          displayName: engineerProfile.displayName ? sanitizeInput(engineerProfile.displayName) : '',
          bio: engineerProfile.bio ? sanitizeInput(engineerProfile.bio) : undefined,
          certifications,
          awsExperienceYears: awsExperience.filter(exp => exp.service && exp.years > 0),
          pastProjects: pastProjects.filter(proj => proj.title && proj.description).map(proj => ({
            ...proj,
            title: sanitizeInput(proj.title),
            description: sanitizeInput(proj.description),
            role: sanitizeInput(proj.role)
          })),
        }
      } else {
        profileData = {
          ...companyProfile,
          companyName: companyProfile.companyName ? sanitizeInput(companyProfile.companyName) : undefined,
          businessDescription: companyProfile.businessDescription ? sanitizeInput(companyProfile.businessDescription) : undefined,
          industry: industries.filter(ind => ind.trim()).map(ind => sanitizeInput(ind)),
        }
      }

      await updateProfile(profileData)
      await refreshUser()
      setSuccess(true)
      setTimeout(() => navigate('/profile'), 1500)
    } catch (err: any) {
      setError(err.message || 'プロフィールの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#00E5FF]/10 rounded-full blur-3xl animate-cloud-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl animate-cloud-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10 flex-1">
        <div className="glass-dark rounded-2xl border border-[#00E5FF]/20 shadow-2xl p-8 animate-slide-down">
          <h1 className="text-3xl font-bold text-white mb-6 font-mono">プロフィール編集</h1>

          {error && (
            <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] p-4 rounded-lg mb-6 animate-slide-down">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] p-4 rounded-lg mb-6 animate-slide-down">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                プロフィールを更新しました
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {user.userType === 'engineer' ? (
              // エンジニア用フォーム
              <>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    表示名 <span className="text-[#FF6B35]">*</span>
                  </label>
                  <input
                    type="text"
                    value={engineerProfile.displayName || ''}
                    onChange={(e) =>
                      setEngineerProfile({ ...engineerProfile, displayName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    自己紹介
                  </label>
                  <textarea
                    value={engineerProfile.bio || ''}
                    onChange={(e) =>
                      setEngineerProfile({ ...engineerProfile, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="例: バックエンドエンジニアとして5年の経験があります。主にGoとPythonを使用したAPI開発が得意です。直近のプロジェクトでは、AWS（ECS, Lambda, DynamoDB）を活用したマイクロサービスアーキテクチャの設計・構築を担当しました。チームリーダーとしての経験もあり、コードレビューやメンタリングも積極的に行っています。"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    所在地
                  </label>
                  <select
                    value={engineerProfile.location || ''}
                    onChange={(e) =>
                      setEngineerProfile({ ...engineerProfile, location: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                  >
                    <option value="">選択してください</option>
                    {PREFECTURES.map((prefecture) => (
                      <option key={prefecture} value={prefecture}>
                        {prefecture}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    希望勤務地
                  </label>
                  <input
                    type="text"
                    value={engineerProfile.preferredLocation || ''}
                    onChange={(e) =>
                      setEngineerProfile({ ...engineerProfile, preferredLocation: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                    placeholder="例: 東京都内、フルリモート希望"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    稼働可能時間（月間）
                  </label>
                  <input
                    type="number"
                    value={engineerProfile.availableHours || ''}
                    onChange={(e) =>
                      setEngineerProfile({
                        ...engineerProfile,
                        availableHours: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                    placeholder="例: 160"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    希望時給（円）
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="number"
                      value={engineerProfile.hourlyRate?.min || ''}
                      onChange={(e) =>
                        setEngineerProfile({
                          ...engineerProfile,
                          hourlyRate: {
                            ...engineerProfile.hourlyRate,
                            min: parseInt(e.target.value),
                            currency: 'JPY',
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                      placeholder="最低時給"
                      min="0"
                    />
                    <span className="text-[#E8EEF7]/60">〜</span>
                    <input
                      type="number"
                      value={engineerProfile.hourlyRate?.max || ''}
                      onChange={(e) =>
                        setEngineerProfile({
                          ...engineerProfile,
                          hourlyRate: {
                            ...engineerProfile.hourlyRate,
                            max: parseInt(e.target.value),
                            currency: 'JPY',
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                      placeholder="最高時給"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    希望月額単価（円）
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="number"
                      value={engineerProfile.desiredMonthlyRate?.min || ''}
                      onChange={(e) =>
                        setEngineerProfile({
                          ...engineerProfile,
                          desiredMonthlyRate: {
                            ...engineerProfile.desiredMonthlyRate,
                            min: parseInt(e.target.value),
                            currency: 'JPY',
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                      placeholder="最低希望単価"
                      min="0"
                    />
                    <span className="text-[#E8EEF7]/60">〜</span>
                    <input
                      type="number"
                      value={engineerProfile.desiredMonthlyRate?.max || ''}
                      onChange={(e) =>
                        setEngineerProfile({
                          ...engineerProfile,
                          desiredMonthlyRate: {
                            ...engineerProfile.desiredMonthlyRate,
                            max: parseInt(e.target.value),
                            currency: 'JPY',
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                      placeholder="最高希望単価"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    稼働可能開始日
                  </label>
                  <input
                    type="date"
                    value={engineerProfile.availableStartDate || ''}
                    onChange={(e) =>
                      setEngineerProfile({ ...engineerProfile, availableStartDate: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    AWS認定資格
                  </label>
                  <div className="space-y-4 bg-[#0A1628]/30 p-4 rounded-lg border border-[#00E5FF]/10">
                    {/* Foundational */}
                    <div>
                      <h3 className="text-xs font-semibold text-[#00E5FF] mb-2">Foundational</h3>
                      <div className="space-y-2">
                        {AWS_CERTIFICATIONS.filter(c => c.category === 'Foundational').map(cert => (
                          <label key={cert.id} className="flex items-center cursor-pointer hover:bg-[#00E5FF]/5 p-2 rounded transition-colors duration-200">
                            <input
                              type="checkbox"
                              checked={selectedCertifications.includes(cert.name)}
                              onChange={() => handleCertificationToggle(cert.name)}
                              className="mr-3 h-4 w-4 text-[#00E5FF] focus:ring-[#00E5FF] border-[#00E5FF]/30 rounded bg-[#0A1628]/50"
                            />
                            <span className="text-sm text-[#E8EEF7]">{cert.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Associate */}
                    <div>
                      <h3 className="text-xs font-semibold text-[#00E5FF] mb-2">Associate</h3>
                      <div className="space-y-2">
                        {AWS_CERTIFICATIONS.filter(c => c.category === 'Associate').map(cert => (
                          <label key={cert.id} className="flex items-center cursor-pointer hover:bg-[#00E5FF]/5 p-2 rounded transition-colors duration-200">
                            <input
                              type="checkbox"
                              checked={selectedCertifications.includes(cert.name)}
                              onChange={() => handleCertificationToggle(cert.name)}
                              className="mr-3 h-4 w-4 text-[#00E5FF] focus:ring-[#00E5FF] border-[#00E5FF]/30 rounded bg-[#0A1628]/50"
                            />
                            <span className="text-sm text-[#E8EEF7]">{cert.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Professional */}
                    <div>
                      <h3 className="text-xs font-semibold text-[#00E5FF] mb-2">Professional</h3>
                      <div className="space-y-2">
                        {AWS_CERTIFICATIONS.filter(c => c.category === 'Professional').map(cert => (
                          <label key={cert.id} className="flex items-center cursor-pointer hover:bg-[#00E5FF]/5 p-2 rounded transition-colors duration-200">
                            <input
                              type="checkbox"
                              checked={selectedCertifications.includes(cert.name)}
                              onChange={() => handleCertificationToggle(cert.name)}
                              className="mr-3 h-4 w-4 text-[#00E5FF] focus:ring-[#00E5FF] border-[#00E5FF]/30 rounded bg-[#0A1628]/50"
                            />
                            <span className="text-sm text-[#E8EEF7]">{cert.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Specialty */}
                    <div>
                      <h3 className="text-xs font-semibold text-[#00E5FF] mb-2">Specialty</h3>
                      <div className="space-y-2">
                        {AWS_CERTIFICATIONS.filter(c => c.category === 'Specialty').map(cert => (
                          <label key={cert.id} className="flex items-center cursor-pointer hover:bg-[#00E5FF]/5 p-2 rounded transition-colors duration-200">
                            <input
                              type="checkbox"
                              checked={selectedCertifications.includes(cert.name)}
                              onChange={() => handleCertificationToggle(cert.name)}
                              className="mr-3 h-4 w-4 text-[#00E5FF] focus:ring-[#00E5FF] border-[#00E5FF]/30 rounded bg-[#0A1628]/50"
                            />
                            <span className="text-sm text-[#E8EEF7]">{cert.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-white">
                      AWS実務経験年数（サービス別）
                    </label>
                    <button
                      type="button"
                      onClick={addAwsExperience}
                      className="text-sm text-[#00E5FF] hover:text-[#5B8DEF] transition-colors duration-300 font-medium"
                    >
                      + 追加
                    </button>
                  </div>
                  <div className="space-y-3">
                    {awsExperience.map((exp, index) => (
                      <div key={index} className="flex gap-3 items-center bg-[#0A1628]/30 p-3 rounded-lg border border-[#00E5FF]/10">
                        <input
                          type="text"
                          value={exp.service}
                          onChange={(e) => updateAwsExperience(index, 'service', e.target.value)}
                          className="flex-1 px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                          placeholder="AWSサービス名（例: EC2, Lambda）"
                        />
                        <input
                          type="number"
                          value={exp.years}
                          onChange={(e) => updateAwsExperience(index, 'years', parseInt(e.target.value))}
                          className="w-24 px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                          placeholder="年数"
                          min="0"
                        />
                        <span className="text-sm text-[#E8EEF7]/60 whitespace-nowrap">年</span>
                        <button
                          type="button"
                          onClick={() => removeAwsExperience(index)}
                          className="text-[#FF6B35] hover:text-[#FF9F66] transition-colors duration-300 whitespace-nowrap"
                        >
                          削除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-white">
                      過去のプロジェクト実績
                    </label>
                    <button
                      type="button"
                      onClick={addPastProject}
                      className="text-sm text-[#00E5FF] hover:text-[#5B8DEF] transition-colors duration-300 font-medium"
                    >
                      + 追加
                    </button>
                  </div>
                  <div className="space-y-4">
                    {pastProjects.map((project, index) => (
                      <div key={index} className="bg-[#0A1628]/30 border border-[#00E5FF]/20 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-[#00E5FF]">プロジェクト {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removePastProject(index)}
                            className="text-sm text-[#FF6B35] hover:text-[#FF9F66] transition-colors duration-300"
                          >
                            削除
                          </button>
                        </div>
                        <input
                          type="text"
                          value={project.title}
                          onChange={(e) => updatePastProject(index, 'title', e.target.value)}
                          className="w-full px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                          placeholder="プロジェクト名"
                        />
                        <input
                          type="text"
                          value={project.role}
                          onChange={(e) => updatePastProject(index, 'role', e.target.value)}
                          className="w-full px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                          placeholder="担当役割（例: インフラエンジニア、テックリード）"
                        />
                        <input
                          type="text"
                          value={project.period}
                          onChange={(e) => updatePastProject(index, 'period', e.target.value)}
                          className="w-full px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                          placeholder="期間（例: 2023年4月〜2024年3月）"
                        />
                        <textarea
                          value={project.description}
                          onChange={(e) => updatePastProject(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300 resize-none"
                          placeholder="プロジェクト概要と担当内容"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              // 企業用フォーム
              <>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    企業名 <span className="text-[#FF6B35]">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyProfile.companyName || ''}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, companyName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    事業内容
                  </label>
                  <textarea
                    value={companyProfile.businessDescription || ''}
                    onChange={(e) =>
                      setCompanyProfile({
                        ...companyProfile,
                        businessDescription: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="貴社の事業内容について教えてください"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    ウェブサイト
                  </label>
                  <input
                    type="url"
                    value={companyProfile.website || ''}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, website: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    お問い合わせメールアドレス
                  </label>
                  <input
                    type="email"
                    value={companyProfile.contactEmail || ''}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, contactEmail: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={companyProfile.phoneNumber || ''}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, phoneNumber: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                    placeholder="03-1234-5678"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-white">
                      業種
                    </label>
                    <button
                      type="button"
                      onClick={addIndustry}
                      className="text-sm text-[#00E5FF] hover:text-[#5B8DEF] transition-colors duration-300 font-medium"
                    >
                      + 追加
                    </button>
                  </div>
                  <div className="space-y-3">
                    {industries.map((industry, index) => (
                      <div key={index} className="flex gap-3 items-center bg-[#0A1628]/30 p-3 rounded-lg border border-[#00E5FF]/10">
                        <input
                          type="text"
                          value={industry}
                          onChange={(e) => updateIndustry(index, e.target.value)}
                          className="flex-1 px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                          placeholder="例: IT・通信、金融、製造業"
                        />
                        <button
                          type="button"
                          onClick={() => removeIndustry(index)}
                          className="text-[#FF6B35] hover:text-[#FF9F66] transition-colors duration-300 whitespace-nowrap"
                        >
                          削除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex-1 bg-[#E8EEF7]/10 border border-[#E8EEF7]/20 text-[#E8EEF7] py-3 rounded-lg font-semibold hover:bg-[#E8EEF7]/20 transition-all duration-300"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '更新中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileEdit
