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
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-[#00E5FF] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white font-medium">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-20"></div>
        <div className="container mx-auto px-4 py-8 relative z-10">
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
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-20"></div>
        <div className="container mx-auto px-4 py-8 relative z-10">
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
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#00E5FF]/10 rounded-full blur-3xl animate-cloud-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl animate-cloud-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
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

        <div className="glass-dark rounded-2xl shadow-lg p-8 mb-6 border border-[#00E5FF]/20 animate-slide-up">
          <div className="flex items-start gap-6">
            {profile.avatar && (
              <img
                src={profile.avatar}
                alt={profile.displayName}
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 text-white">{profile.displayName}</h1>
              <div className="flex flex-wrap gap-2 text-sm text-[#E8EEF7]/80 mb-4">
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
                <p className="text-[#E8EEF7] whitespace-pre-wrap">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* 稼働条件 */}
        {(profile.workStyle || profile.availableHours || profile.preferredLocation) && (
          <div className="glass-dark rounded-2xl shadow-lg p-8 mb-6 border border-[#00E5FF]/20 animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4 text-white">稼働条件</h2>
            <div className="space-y-3">
              {profile.preferredLocation && (
                <div>
                  <span className="text-[#E8EEF7]/80 font-medium">希望勤務地:</span>
                  <span className="ml-2 text-white">{profile.preferredLocation}</span>
                </div>
              )}
              {profile.workStyle && profile.workStyle.length > 0 && (
                <div>
                  <span className="text-[#E8EEF7]/80 font-medium">勤務形態:</span>
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
                  <span className="text-[#E8EEF7]/80 font-medium">週の稼働可能時間:</span>
                  <span className="ml-2 text-white">{profile.availableHours}時間/週</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 希望条件 */}
        {(profile.desiredMonthlyRate || profile.availableStartDate) && (
          <div className="glass-dark rounded-2xl shadow-lg p-8 mb-6 border border-[#00E5FF]/20 animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4 text-white">希望条件</h2>
            <div className="space-y-3">
              {profile.desiredMonthlyRate && (
                <div>
                  <span className="text-[#E8EEF7]/80 font-medium">希望月額単価:</span>
                  <span className="ml-2 text-lg font-semibold text-[#00E5FF]">
                    {profile.desiredMonthlyRate.min?.toLocaleString()}円 〜 {profile.desiredMonthlyRate.max?.toLocaleString()}円/月
                  </span>
                </div>
              )}
              {profile.availableStartDate && (
                <div>
                  <span className="text-[#E8EEF7]/80 font-medium">稼働可能開始日:</span>
                  <span className="ml-2 text-lg text-white">
                    {new Date(profile.availableStartDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 保有資格 */}
        {profile.certifications && profile.certifications.length > 0 && (
          <div className="glass-dark rounded-2xl shadow-lg p-8 mb-6 border border-[#00E5FF]/20 animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4 text-white">保有資格</h2>
            <div className="space-y-3">
              {profile.certifications.map((cert, index) => (
                <div key={index} className="border-l-4 border-[#00E5FF] pl-4">
                  <div className="font-semibold text-white">{cert.name}</div>
                  <div className="text-sm text-[#E8EEF7]/70">
                    取得日: {new Date(cert.obtainedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AWS実務経験年数 */}
        {profile.awsExperienceYears && profile.awsExperienceYears.length > 0 && (
          <div className="glass-dark rounded-2xl shadow-lg p-8 mb-6 border border-[#00E5FF]/20 animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4 text-white">AWS実務経験年数</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {profile.awsExperienceYears.map((exp, index) => (
                <div key={index} className="border border-[#FF6B35]/30 rounded-lg p-4 bg-gradient-to-br from-[#FF6B35]/10 to-[#0A1628]/50">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">{exp.service}</span>
                    <span className="text-xl font-bold text-[#FF6B35]">{exp.years}年</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 過去のプロジェクト実績 */}
        {profile.pastProjects && profile.pastProjects.length > 0 && (
          <div className="glass-dark rounded-2xl shadow-lg p-8 mb-6 border border-[#00E5FF]/20 animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4 text-white">過去のプロジェクト実績</h2>
            <div className="space-y-6">
              {profile.pastProjects.map((project, index) => (
                <div key={index} className="border-l-4 border-[#00E5FF] pl-4 bg-[#0A1628]/30 p-4 rounded">
                  <h3 className="font-bold text-lg mb-2 text-white">{project.title}</h3>
                  <div className="flex gap-4 text-sm text-[#E8EEF7]/70 mb-3">
                    <span>
                      <span className="font-medium">役割:</span> {project.role}
                    </span>
                    <span>
                      <span className="font-medium">期間:</span> {project.period}
                    </span>
                  </div>
                  <p className="text-[#E8EEF7] whitespace-pre-wrap mb-3">{project.description}</p>
                  {project.awsServices && project.awsServices.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-[#E8EEF7]/80">使用したAWSサービス:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.awsServices.map((service, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-[#00E5FF]/20 text-[#00E5FF] rounded-full text-sm border border-[#00E5FF]/30"
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
          <div className="glass-dark rounded-2xl shadow-lg p-8 mb-6 border border-[#00E5FF]/20 animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4 text-white">プラットフォーム内評価</h2>
            <div className="bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB800]/10 border border-[#FFB800]/30 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#FFB800] mb-1">
                    ★ {profile.platformRating.average.toFixed(1)}
                  </div>
                  <div className="text-sm text-[#E8EEF7]/70">
                    {profile.platformRating.count}件のレビュー
                  </div>
                </div>
              </div>

              {profile.platformRating.reviews && profile.platformRating.reviews.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-white border-t border-[#FFB800]/30 pt-4">企業からのレビュー</h3>
                  {profile.platformRating.reviews.map((review, index) => (
                    <div key={index} className="bg-[#0A1628]/50 rounded-lg p-4 border border-[#FFB800]/20">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-white">{review.companyName}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[#FFB800] text-lg">★</span>
                          <span className="font-bold text-[#FFB800]">{review.rating}</span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-[#E8EEF7] text-sm mb-2">{review.comment}</p>
                      )}
                      <div className="text-xs text-[#E8EEF7]/60">
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
          <div className="glass-dark rounded-2xl shadow-lg p-8 mb-6 border border-[#00E5FF]/20 animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4 text-white">スキル</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {profile.skills.map((skill, index) => (
                <div key={index} className="border border-[#00E5FF]/30 rounded-lg p-4 bg-[#0A1628]/30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white">{skill.name}</span>
                    <span className="px-2 py-1 badge-cyan rounded text-xs">
                      {getSkillLevelLabel(skill.level)}
                    </span>
                  </div>
                  {skill.experienceYears && (
                    <div className="text-sm text-[#E8EEF7]/70">経験年数: {skill.experienceYears}年</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 専門分野 */}
        {profile.specialties && profile.specialties.length > 0 && (
          <div className="glass-dark rounded-2xl shadow-lg p-8 mb-6 border border-[#00E5FF]/20 animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4 text-white">専門分野</h2>
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
          <div className="glass-dark rounded-2xl shadow-lg p-8 mb-6 border border-[#00E5FF]/20 animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4 text-white">職務経歴</h2>
            <div className="space-y-6">
              {profile.workHistory.map((work, index) => (
                <div key={index} className="border-l-4 border-[#5B8DEF] pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white">{work.projectName}</h3>
                    <span className="text-sm text-[#E8EEF7]/70">
                      {new Date(work.startDate).toLocaleDateString()} - {work.endDate ? new Date(work.endDate).toLocaleDateString() : '現在'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-[#E8EEF7]">役割:</span> <span className="text-[#E8EEF7]/80">{work.role}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-[#E8EEF7]">使用技術:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {work.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 bg-[#5B8DEF]/20 text-[#5B8DEF] border border-[#5B8DEF]/30 rounded text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-[#E8EEF7]">業務内容:</span>
                    <p className="text-[#E8EEF7] mt-1 whitespace-pre-wrap">{work.description}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#E8EEF7]">担当業務:</span>
                    <p className="text-[#E8EEF7] mt-1 whitespace-pre-wrap">{work.responsibilities}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 学歴 */}
        {profile.education && profile.education.length > 0 && (
          <div className="glass-dark rounded-2xl shadow-lg p-8 mb-6 border border-[#00E5FF]/20 animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4 text-white">学歴</h2>
            <div className="space-y-3">
              {profile.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-[#5B8DEF] pl-4">
                  <div className="font-semibold text-white">{edu.school}</div>
                  <div className="text-[#E8EEF7]">{edu.department}</div>
                  <div className="text-sm text-[#E8EEF7]/70">
                    卒業: {new Date(edu.graduatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ポートフォリオ */}
        {profile.portfolio && (
          <div className="glass-dark rounded-2xl shadow-lg p-8 mb-6 border border-[#00E5FF]/20 animate-slide-up delay-100">
            <h2 className="text-xl font-bold mb-4 text-white">ポートフォリオ・リンク</h2>
            <div className="space-y-2">
              {profile.portfolio.github && (
                <div>
                  <a
                    href={profile.portfolio.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00E5FF] hover:text-[#5B8DEF] transition-colors hover:underline flex items-center gap-2"
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
                    className="text-[#00E5FF] hover:text-[#5B8DEF] transition-colors hover:underline"
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
                    className="text-[#00E5FF] hover:text-[#5B8DEF] transition-colors hover:underline"
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
                    className="text-[#00E5FF] hover:text-[#5B8DEF] transition-colors hover:underline"
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
                    className="text-[#00E5FF] hover:text-[#5B8DEF] transition-colors hover:underline"
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
