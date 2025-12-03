import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { User, EngineerProfile } from '../../types/user'
import { getUserProfile } from '../../services/users'

function EngineerProfileView() {
  const { userId } = useParams<{ userId: string }>()
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // エンジニア検索から来た場合の状態
  const fromScoutSearch = location.state?.from === '/scouts/search'
  const searchState = location.state?.searchState

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
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-[#00E5FF] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-[#1A2942] font-medium">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#F5F8FC]">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF6B35]/10 mb-4">
              <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[#FF6B35] text-lg font-semibold">{error || 'ユーザーが見つかりません'}</p>
          </div>
        </div>
      </div>
    )
  }

  if (user.userType !== 'engineer') {
    return (
      <div className="min-h-screen bg-[#F5F8FC]">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF6B35]/10 mb-4">
              <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[#FF6B35] text-lg font-semibold">このユーザーは技術者ではありません</p>
          </div>
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
    <div className="min-h-screen bg-[#F5F8FC]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 animate-fade-in">
          {fromScoutSearch ? (
            <Link
              to="/scouts/search"
              state={searchState}
              className="inline-flex items-center text-[#00E5FF] hover:text-[#5B8DEF] transition-colors duration-300 font-medium"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              検索結果に戻る
            </Link>
          ) : (
            <button onClick={() => window.history.back()} className="inline-flex items-center text-[#00E5FF] hover:text-[#5B8DEF] transition-colors duration-300 font-medium">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              戻る
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-[#E8EEF7] animate-slide-up">
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
              <div className="flex flex-wrap gap-2 text-sm text-[#2C4875] mb-4">
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
                <p className="text-[#1A2942] whitespace-pre-wrap">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* 稼働条件 */}
        {(profile.workStyle || profile.availableHours || profile.preferredLocation) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-[#E8EEF7] animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4">稼働条件</h2>
            <div className="space-y-3">
              {profile.preferredLocation && (
                <div>
                  <span className="text-[#2C4875] font-medium">希望勤務地:</span>
                  <span className="ml-2">{profile.preferredLocation}</span>
                </div>
              )}
              {profile.workStyle && profile.workStyle.length > 0 && (
                <div>
                  <span className="text-[#2C4875] font-medium">勤務形態:</span>
                  <div className="flex gap-2 mt-1">
                    {profile.workStyle.map((style) => (
                      <span
                        key={style}
                        className="px-3 py-1 badge-cyan rounded-full text-sm"
                      >
                        {style === 'remote' ? 'リモート' : style === 'onsite' ? 'オンサイト' : 'ハイブリッド'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile.availableHours && (
                <div>
                  <span className="text-[#2C4875] font-medium">週の稼働可能時間:</span>
                  <span className="ml-2">{profile.availableHours}時間/週</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 希望条件 */}
        {(profile.desiredMonthlyRate || profile.availableStartDate) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-[#E8EEF7] animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4">希望条件</h2>
            <div className="space-y-3">
              {profile.desiredMonthlyRate && (
                <div>
                  <span className="text-[#2C4875] font-medium">希望月額単価:</span>
                  <span className="ml-2 text-lg font-semibold text-primary-600">
                    {profile.desiredMonthlyRate.min?.toLocaleString()}円 〜 {profile.desiredMonthlyRate.max?.toLocaleString()}円/月
                  </span>
                </div>
              )}
              {profile.availableStartDate && (
                <div>
                  <span className="text-[#2C4875] font-medium">稼働可能開始日:</span>
                  <span className="ml-2 text-lg">
                    {new Date(profile.availableStartDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 保有資格 */}
        {profile.certifications && profile.certifications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-[#E8EEF7] animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4">保有資格</h2>
            <div className="space-y-3">
              {profile.certifications.map((cert, index) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4">
                  <div className="font-semibold">{cert.name}</div>
                  <div className="text-sm text-[#2C4875]">
                    取得日: {new Date(cert.obtainedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AWS実務経験年数 */}
        {profile.awsExperienceYears && profile.awsExperienceYears.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-[#E8EEF7] animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4">AWS実務経験年数</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {profile.awsExperienceYears.map((exp, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-orange-50 to-white">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">{exp.service}</span>
                    <span className="text-xl font-bold text-orange-600">{exp.years}年</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 過去のプロジェクト実績 */}
        {profile.pastProjects && profile.pastProjects.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-[#E8EEF7] animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4">過去のプロジェクト実績</h2>
            <div className="space-y-6">
              {profile.pastProjects.map((project, index) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4 bg-gray-50 p-4 rounded">
                  <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                  <div className="flex gap-4 text-sm text-[#2C4875] mb-3">
                    <span>
                      <span className="font-medium">役割:</span> {project.role}
                    </span>
                    <span>
                      <span className="font-medium">期間:</span> {project.period}
                    </span>
                  </div>
                  <p className="text-[#1A2942] whitespace-pre-wrap mb-3">{project.description}</p>
                  {project.awsServices && project.awsServices.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-[#2C4875]">使用したAWSサービス:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.awsServices.map((service, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* プラットフォーム内評価 */}
        {profile.platformRating && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-[#E8EEF7] animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4">プラットフォーム内評価</h2>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 mb-1">
                    ★ {profile.platformRating.average.toFixed(1)}
                  </div>
                  <div className="text-sm text-[#2C4875]">
                    {profile.platformRating.count}件のレビュー
                  </div>
                </div>
              </div>

              {profile.platformRating.reviews && profile.platformRating.reviews.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-t border-yellow-200 pt-4">企業からのレビュー</h3>
                  {profile.platformRating.reviews.map((review, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-yellow-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-900">{review.companyName}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-600 text-lg">★</span>
                          <span className="font-bold text-yellow-600">{review.rating}</span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-[#1A2942] text-sm mb-2">{review.comment}</p>
                      )}
                      <div className="text-xs text-[#2C4875]/70">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* スキル */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-[#E8EEF7] animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4">スキル</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {profile.skills.map((skill, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">{skill.name}</span>
                    <span className="px-2 py-1 badge-cyan rounded text-xs">
                      {getSkillLevelLabel(skill.level)}
                    </span>
                  </div>
                  {skill.experienceYears && (
                    <div className="text-sm text-[#2C4875]">経験年数: {skill.experienceYears}年</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 専門分野 */}
        {profile.specialties && profile.specialties.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-[#E8EEF7] animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4">専門分野</h2>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-4 py-2 badge-primary rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 職務経歴 */}
        {profile.workHistory && profile.workHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-[#E8EEF7] animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4">職務経歴</h2>
            <div className="space-y-6">
              {profile.workHistory.map((work, index) => (
                <div key={index} className="border-l-4 border-gray-300 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{work.projectName}</h3>
                    <span className="text-sm text-[#2C4875]">
                      {new Date(work.startDate).toLocaleDateString()} - {work.endDate ? new Date(work.endDate).toLocaleDateString() : '現在'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-[#1A2942]">役割:</span> {work.role}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-[#1A2942]">使用技術:</span>
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
                    <span className="font-semibold text-[#1A2942]">業務内容:</span>
                    <p className="text-[#1A2942] mt-1 whitespace-pre-wrap">{work.description}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#1A2942]">担当業務:</span>
                    <p className="text-[#1A2942] mt-1 whitespace-pre-wrap">{work.responsibilities}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 学歴 */}
        {profile.education && profile.education.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-[#E8EEF7] animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4">学歴</h2>
            <div className="space-y-3">
              {profile.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <div className="font-semibold">{edu.school}</div>
                  <div className="text-[#1A2942]">{edu.department}</div>
                  <div className="text-sm text-[#2C4875]">
                    卒業: {new Date(edu.graduatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ポートフォリオ */}
        {profile.portfolio && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-[#E8EEF7] animate-slide-up delay-100">
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
