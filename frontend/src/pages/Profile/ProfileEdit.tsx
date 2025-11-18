import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { updateProfile } from '../../services/users'
import { EngineerProfile, CompanyProfile } from '../../types/user'
import { AWS_CERTIFICATIONS } from '../../constants/awsCertifications'

function ProfileEdit() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // エンジニア用のフォーム状態
  const [engineerProfile, setEngineerProfile] = useState<Partial<EngineerProfile>>({})
  // 企業用のフォーム状態
  const [companyProfile, setCompanyProfile] = useState<Partial<CompanyProfile>>({})
  // AWS資格の選択状態
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      if (user.userType === 'engineer') {
        const profile = user.profile as EngineerProfile
        setEngineerProfile(profile)
        // 既存の資格からIDのリストを抽出
        if (profile.certifications) {
          setSelectedCertifications(profile.certifications.map(cert => cert.name))
        }
      } else {
        setCompanyProfile(user.profile as CompanyProfile)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

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
          certifications,
        }
      } else {
        profileData = companyProfile
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
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">プロフィール編集</h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
              プロフィールを更新しました
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {user.userType === 'engineer' ? (
              // エンジニア用フォーム
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    表示名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={engineerProfile.displayName || ''}
                    onChange={(e) =>
                      setEngineerProfile({ ...engineerProfile, displayName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    自己紹介
                  </label>
                  <textarea
                    value={engineerProfile.bio || ''}
                    onChange={(e) =>
                      setEngineerProfile({ ...engineerProfile, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="あなたの経験やスキルについて教えてください"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所在地
                  </label>
                  <input
                    type="text"
                    value={engineerProfile.location || ''}
                    onChange={(e) =>
                      setEngineerProfile({ ...engineerProfile, location: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="例: 東京都"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="例: 160"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    希望時給（円）
                  </label>
                  <div className="flex gap-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="最低時給"
                    />
                    <span className="self-center">〜</span>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="最高時給"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    AWS認定資格
                  </label>
                  <div className="space-y-4">
                    {/* Foundational */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-600 mb-2">Foundational</h3>
                      <div className="space-y-2">
                        {AWS_CERTIFICATIONS.filter(c => c.category === 'Foundational').map(cert => (
                          <label key={cert.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedCertifications.includes(cert.name)}
                              onChange={() => handleCertificationToggle(cert.name)}
                              className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">{cert.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Associate */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-600 mb-2">Associate</h3>
                      <div className="space-y-2">
                        {AWS_CERTIFICATIONS.filter(c => c.category === 'Associate').map(cert => (
                          <label key={cert.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedCertifications.includes(cert.name)}
                              onChange={() => handleCertificationToggle(cert.name)}
                              className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">{cert.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Professional */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-600 mb-2">Professional</h3>
                      <div className="space-y-2">
                        {AWS_CERTIFICATIONS.filter(c => c.category === 'Professional').map(cert => (
                          <label key={cert.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedCertifications.includes(cert.name)}
                              onChange={() => handleCertificationToggle(cert.name)}
                              className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">{cert.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Specialty */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-600 mb-2">Specialty</h3>
                      <div className="space-y-2">
                        {AWS_CERTIFICATIONS.filter(c => c.category === 'Specialty').map(cert => (
                          <label key={cert.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedCertifications.includes(cert.name)}
                              onChange={() => handleCertificationToggle(cert.name)}
                              className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">{cert.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // 企業用フォーム
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    企業名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyProfile.companyName || ''}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, companyName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="貴社の事業内容について教えてください"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ウェブサイト
                  </label>
                  <input
                    type="url"
                    value={companyProfile.website || ''}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, website: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    お問い合わせメールアドレス
                  </label>
                  <input
                    type="email"
                    value={companyProfile.contactEmail || ''}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, contactEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={companyProfile.phoneNumber || ''}
                    onChange={(e) =>
                      setCompanyProfile({ ...companyProfile, phoneNumber: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="03-1234-5678"
                  />
                </div>
              </>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
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
