import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { User, EngineerProfile } from '../../types/user'
import { getUserProfile } from '../../services/users'

function EngineerProfileView() {
  const { userId } = useParams<{ userId: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userId) {
      fetchProfile()
    }
  }, [userId])

  const fetchProfile = async () => {
    try {
      const userData = await getUserProfile(userId!)
      setUser(userData)
    } catch (err: any) {
      setError(err.message || 'プロフィールの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20">読み込み中...</div>
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20 text-red-600">{error || 'ユーザーが見つかりません'}</div>
        </div>
      </div>
    )
  }

  if (user.userType !== 'engineer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20 text-red-600">このユーザーは技術者ではありません</div>
        </div>
      </div>
    )
  }

  const profile = user.profile as EngineerProfile

  const getSkillLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return '初級'
      case 'intermediate':
        return '中級'
      case 'advanced':
        return '上級'
      case 'expert':
        return 'エキスパート'
      default:
        return level
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button onClick={() => window.history.back()} className="text-primary-600 hover:underline">
            ← 戻る
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-6">
            {profile.avatar && (
              <img
                src={profile.avatar}
                alt={profile.displayName}
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{profile.displayName}</h1>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-4">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profile.location}
                  </span>
                )}
              </div>
              {profile.bio && (
                <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* 稼働条件 */}
        {(profile.workStyle || profile.availableHours) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">稼働条件</h2>
            <div className="space-y-3">
              {profile.workStyle && profile.workStyle.length > 0 && (
                <div>
                  <span className="text-gray-600 font-medium">勤務形態:</span>
                  <div className="flex gap-2 mt-1">
                    {profile.workStyle.map((style) => (
                      <span
                        key={style}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {style === 'remote' ? 'リモート' : style === 'onsite' ? 'オンサイト' : 'ハイブリッド'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile.availableHours && (
                <div>
                  <span className="text-gray-600 font-medium">週の稼働可能時間:</span>
                  <span className="ml-2">{profile.availableHours}時間/週</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 保有資格 */}
        {profile.certifications && profile.certifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">保有資格</h2>
            <div className="space-y-3">
              {profile.certifications.map((cert, index) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4">
                  <div className="font-semibold">{cert.name}</div>
                  <div className="text-sm text-gray-600">
                    取得日: {new Date(cert.obtainedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* スキル */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">スキル</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {profile.skills.map((skill, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">{skill.name}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {getSkillLevelLabel(skill.level)}
                    </span>
                  </div>
                  {skill.experienceYears && (
                    <div className="text-sm text-gray-600">経験年数: {skill.experienceYears}年</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 専門分野 */}
        {profile.specialties && profile.specialties.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">専門分野</h2>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 職務経歴 */}
        {profile.workHistory && profile.workHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">職務経歴</h2>
            <div className="space-y-6">
              {profile.workHistory.map((work, index) => (
                <div key={index} className="border-l-4 border-gray-300 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{work.projectName}</h3>
                    <span className="text-sm text-gray-600">
                      {new Date(work.startDate).toLocaleDateString()} - {work.endDate ? new Date(work.endDate).toLocaleDateString() : '現在'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">役割:</span> {work.role}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">使用技術:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {work.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">業務内容:</span>
                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">{work.description}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">担当業務:</span>
                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">{work.responsibilities}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 学歴 */}
        {profile.education && profile.education.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">学歴</h2>
            <div className="space-y-3">
              {profile.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <div className="font-semibold">{edu.school}</div>
                  <div className="text-gray-700">{edu.department}</div>
                  <div className="text-sm text-gray-600">
                    卒業: {new Date(edu.graduatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ポートフォリオ */}
        {profile.portfolio && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">ポートフォリオ・リンク</h2>
            <div className="space-y-2">
              {profile.portfolio.github && (
                <div>
                  <a
                    href={profile.portfolio.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    GitHub
                  </a>
                </div>
              )}
              {profile.portfolio.portfolioUrl && (
                <div>
                  <a
                    href={profile.portfolio.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    ポートフォリオサイト
                  </a>
                </div>
              )}
              {profile.portfolio.blog && (
                <div>
                  <a
                    href={profile.portfolio.blog}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    ブログ
                  </a>
                </div>
              )}
              {profile.portfolio.socialLinks?.twitter && (
                <div>
                  <a
                    href={profile.portfolio.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    Twitter
                  </a>
                </div>
              )}
              {profile.portfolio.socialLinks?.linkedin && (
                <div>
                  <a
                    href={profile.portfolio.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EngineerProfileView
