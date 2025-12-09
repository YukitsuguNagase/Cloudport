import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { EngineerProfile, CompanyProfile } from '../../types/user'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function MyPage() {
  const { user } = useAuth()

  if (!user) {
    return <LoadingSpinner fullScreen />
  }

  const isEngineer = user.userType === 'engineer'
  const profile = user.profile as EngineerProfile | CompanyProfile

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#00E5FF]/10 rounded-full blur-3xl animate-cloud-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl animate-cloud-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10 flex-1">
        <div className="glass-dark rounded-2xl shadow-2xl p-8 border border-[#00E5FF]/20 animate-slide-down">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white font-mono">マイページ</h1>
            <Link
              to="/profile/edit"
              className="btn-primary px-6 py-3 rounded-lg font-semibold"
            >
              編集
            </Link>
          </div>

          {isEngineer ? (
            // エンジニアのプロフィール表示
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-1">表示名</h2>
                <p className="text-lg text-white">{(profile as EngineerProfile).displayName || '未設定'}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-1">メールアドレス</h2>
                <p className="text-lg text-white">{user.email}</p>
              </div>

              {(profile as EngineerProfile).bio && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-1">自己紹介</h2>
                  <p className="text-lg text-white whitespace-pre-wrap">{(profile as EngineerProfile).bio}</p>
                </div>
              )}

              {(profile as EngineerProfile).location && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-1">所在地</h2>
                  <p className="text-lg text-white">{(profile as EngineerProfile).location}</p>
                </div>
              )}

              {(profile as EngineerProfile).preferredLocation && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-1">希望勤務地</h2>
                  <p className="text-lg text-white">{(profile as EngineerProfile).preferredLocation}</p>
                </div>
              )}

              {(profile as EngineerProfile).availableHours && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-1">稼働可能時間（月間）</h2>
                  <p className="text-lg text-white">{(profile as EngineerProfile).availableHours} 時間</p>
                </div>
              )}

              {(profile as EngineerProfile).hourlyRate && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-1">希望時給</h2>
                  <p className="text-lg text-white">
                    {(profile as EngineerProfile).hourlyRate?.min?.toLocaleString()} 円 〜{' '}
                    {(profile as EngineerProfile).hourlyRate?.max?.toLocaleString()} 円
                  </p>
                </div>
              )}

              {(profile as EngineerProfile).skills && (profile as EngineerProfile).skills!.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-2">スキル</h2>
                  <div className="flex flex-wrap gap-2">
                    {(profile as EngineerProfile).skills!.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 badge-cyan rounded-full text-sm"
                      >
                        {skill.name} ({skill.level})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(profile as EngineerProfile).certifications && (profile as EngineerProfile).certifications!.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-2">AWS認定資格</h2>
                  <div className="flex flex-wrap gap-2">
                    {(profile as EngineerProfile).certifications!.map((cert, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 badge-primary rounded-full text-sm"
                      >
                        {cert.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(profile as EngineerProfile).desiredMonthlyRate && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-1">希望月額単価</h2>
                  <p className="text-lg text-white">
                    {(profile as EngineerProfile).desiredMonthlyRate?.min?.toLocaleString()} 円 〜{' '}
                    {(profile as EngineerProfile).desiredMonthlyRate?.max?.toLocaleString()} 円/月
                  </p>
                </div>
              )}

              {(profile as EngineerProfile).availableStartDate && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-1">稼働可能開始日</h2>
                  <p className="text-lg text-white">{new Date((profile as EngineerProfile).availableStartDate!).toLocaleDateString()}</p>
                </div>
              )}

              {(profile as EngineerProfile).awsExperienceYears && (profile as EngineerProfile).awsExperienceYears!.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-2">AWS実務経験年数</h2>
                  <div className="space-y-2">
                    {(profile as EngineerProfile).awsExperienceYears!.map((exp, index) => (
                      <div key={index} className="flex justify-between items-center bg-[#0A1628]/30 px-4 py-2 border border-[#00E5FF]/10 rounded">
                        <span className="text-sm text-[#E8EEF7]/80">{exp.service}</span>
                        <span className="text-sm font-semibold text-white">{exp.years}年</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(profile as EngineerProfile).pastProjects && (profile as EngineerProfile).pastProjects!.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-3">過去のプロジェクト実績</h2>
                  <div className="space-y-4">
                    {(profile as EngineerProfile).pastProjects!.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
                        <p className="text-sm text-[#E8EEF7]/80 mb-2">
                          <span className="font-medium">役割:</span> {project.role} | <span className="font-medium">期間:</span> {project.period}
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{project.description}</p>
                        {project.awsServices && project.awsServices.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project.awsServices.map((service, idx) => (
                              <span key={idx} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                                {service}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(profile as EngineerProfile).platformRating && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-2">プラットフォーム内評価</h2>
                  <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-[#FF6B35]">
                        ★ {(profile as EngineerProfile).platformRating!.average.toFixed(1)}
                      </span>
                      <span className="text-sm text-[#E8EEF7]/80">
                        ({(profile as EngineerProfile).platformRating!.count}件のレビュー)
                      </span>
                    </div>
                    {(profile as EngineerProfile).platformRating!.reviews && (profile as EngineerProfile).platformRating!.reviews!.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {(profile as EngineerProfile).platformRating!.reviews!.map((review, index) => (
                          <div key={index} className="border-t border-yellow-200 pt-3">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-white">{review.companyName}</span>
                              <span className="text-[#FF6B35]">★ {review.rating}</span>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-[#E8EEF7]/80">{review.comment}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 企業のプロフィール表示
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-1">企業名</h2>
                <p className="text-lg text-white">{(profile as CompanyProfile).companyName || '未設定'}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-1">メールアドレス</h2>
                <p className="text-lg text-white">{user.email}</p>
              </div>

              {(profile as CompanyProfile).businessDescription && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-1">事業内容</h2>
                  <p className="text-lg text-white whitespace-pre-wrap">
                    {(profile as CompanyProfile).businessDescription}
                  </p>
                </div>
              )}

              {(profile as CompanyProfile).website && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-1">ウェブサイト</h2>
                  <a
                    href={(profile as CompanyProfile).website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300"
                  >
                    {(profile as CompanyProfile).website}
                  </a>
                </div>
              )}

              {(profile as CompanyProfile).contactEmail && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-1">お問い合わせメール</h2>
                  <p className="text-lg text-white">{(profile as CompanyProfile).contactEmail}</p>
                </div>
              )}

              {(profile as CompanyProfile).phoneNumber && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-1">電話番号</h2>
                  <p className="text-lg text-white">{(profile as CompanyProfile).phoneNumber}</p>
                </div>
              )}

              {(profile as CompanyProfile).industry && (profile as CompanyProfile).industry!.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-[#E8EEF7]/60 mb-2">業種</h2>
                  <div className="flex flex-wrap gap-2">
                    {(profile as CompanyProfile).industry!.map((ind, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 badge-cyan rounded-full text-sm"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyPage
