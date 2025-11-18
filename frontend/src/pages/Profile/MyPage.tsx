import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { EngineerProfile, CompanyProfile } from '../../types/user'

function MyPage() {
  const { user } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }

  const isEngineer = user.userType === 'engineer'
  const profile = user.profile as EngineerProfile | CompanyProfile

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">マイページ</h1>
            <Link
              to="/profile/edit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              編集
            </Link>
          </div>

          {isEngineer ? (
            // エンジニアのプロフィール表示
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">表示名</h2>
                <p className="text-lg">{(profile as EngineerProfile).displayName || '未設定'}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">メールアドレス</h2>
                <p className="text-lg">{user.email}</p>
              </div>

              {(profile as EngineerProfile).bio && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">自己紹介</h2>
                  <p className="text-lg whitespace-pre-wrap">{(profile as EngineerProfile).bio}</p>
                </div>
              )}

              {(profile as EngineerProfile).location && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">所在地</h2>
                  <p className="text-lg">{(profile as EngineerProfile).location}</p>
                </div>
              )}

              {(profile as EngineerProfile).availableHours && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">稼働可能時間（月間）</h2>
                  <p className="text-lg">{(profile as EngineerProfile).availableHours} 時間</p>
                </div>
              )}

              {(profile as EngineerProfile).hourlyRate && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">希望時給</h2>
                  <p className="text-lg">
                    {(profile as EngineerProfile).hourlyRate.min?.toLocaleString()} 円 〜{' '}
                    {(profile as EngineerProfile).hourlyRate.max?.toLocaleString()} 円
                  </p>
                </div>
              )}

              {(profile as EngineerProfile).skills && (profile as EngineerProfile).skills!.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-2">スキル</h2>
                  <div className="flex flex-wrap gap-2">
                    {(profile as EngineerProfile).skills!.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill.name} ({skill.level})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(profile as EngineerProfile).certifications && (profile as EngineerProfile).certifications!.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-2">AWS認定資格</h2>
                  <div className="flex flex-wrap gap-2">
                    {(profile as EngineerProfile).certifications!.map((cert, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                      >
                        {cert.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 企業のプロフィール表示
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">企業名</h2>
                <p className="text-lg">{(profile as CompanyProfile).companyName || '未設定'}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">メールアドレス</h2>
                <p className="text-lg">{user.email}</p>
              </div>

              {(profile as CompanyProfile).businessDescription && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">事業内容</h2>
                  <p className="text-lg whitespace-pre-wrap">
                    {(profile as CompanyProfile).businessDescription}
                  </p>
                </div>
              )}

              {(profile as CompanyProfile).website && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">ウェブサイト</h2>
                  <a
                    href={(profile as CompanyProfile).website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-primary-600 hover:underline"
                  >
                    {(profile as CompanyProfile).website}
                  </a>
                </div>
              )}

              {(profile as CompanyProfile).contactEmail && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">お問い合わせメール</h2>
                  <p className="text-lg">{(profile as CompanyProfile).contactEmail}</p>
                </div>
              )}

              {(profile as CompanyProfile).phoneNumber && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">電話番号</h2>
                  <p className="text-lg">{(profile as CompanyProfile).phoneNumber}</p>
                </div>
              )}

              {(profile as CompanyProfile).industry && (profile as CompanyProfile).industry!.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-2">業種</h2>
                  <div className="flex flex-wrap gap-2">
                    {(profile as CompanyProfile).industry!.map((ind, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
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
