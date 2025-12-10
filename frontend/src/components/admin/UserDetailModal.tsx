import { useEffect, useState } from 'react'
import api from '../../services/api'

interface UserDetail {
  userId: string
  email: string
  userType: 'engineer' | 'company'
  createdAt: string
  lastLoginAt?: string
  lastLoginIp?: string
  loginCount?: number
  mfaEnabled?: boolean
  accountStatus?: 'active' | 'disabled' | 'suspended'
  profile?: {
    displayName?: string
    name?: string
    companyName?: string
    skills?: string[]
    bio?: string
    phone?: string
    website?: string
  }
  stats?: {
    jobsPosted?: number
    applicationsSubmitted?: number
    contractsCompleted?: number
    totalEarnings?: number
    totalSpent?: number
  }
}

interface UserDetailModalProps {
  userId: string
  onClose: () => void
}

function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserDetail()
  }, [userId])

  const fetchUserDetail = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/admin/users/${userId}`)
      setUser(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'ユーザー詳細情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass-dark rounded-2xl p-8 max-w-4xl w-full border border-[#00E5FF]/20 shadow-2xl">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass-dark rounded-2xl p-8 max-w-4xl w-full border border-[#00E5FF]/20 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">エラー</h2>
            <button
              onClick={onClose}
              className="text-[#E8EEF7]/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-[#FF6B35]">{error}</p>
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-[#00E5FF] text-[#0A1628] rounded-lg font-semibold hover:bg-[#00E5FF]/90 transition-all"
          >
            閉じる
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-dark rounded-2xl p-8 max-w-4xl w-full border border-[#00E5FF]/20 shadow-2xl my-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold gradient-text-cyan">ユーザー詳細</h2>
          <button
            onClick={onClose}
            className="text-[#E8EEF7]/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-[#0A1628]/50 rounded-xl p-6 border border-[#00E5FF]/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              基本情報
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#E8EEF7]/60 mb-1">ユーザーID</p>
                <p className="text-sm text-white font-mono break-all">{user.userId}</p>
              </div>
              <div>
                <p className="text-sm text-[#E8EEF7]/60 mb-1">メールアドレス</p>
                <p className="text-sm text-white">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-[#E8EEF7]/60 mb-1">表示名</p>
                <p className="text-sm text-white">
                  {user.profile?.displayName || user.profile?.name || user.profile?.companyName || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#E8EEF7]/60 mb-1">ユーザータイプ</p>
                <p className="text-sm">
                  {user.userType === 'engineer' ? (
                    <span className="px-3 py-1 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-semibold">
                      エンジニア
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-semibold">
                      企業
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#E8EEF7]/60 mb-1">アカウント状態</p>
                <p className="text-sm">
                  {(user.accountStatus || 'active') === 'active' ? (
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                      有効
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
                      無効
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#E8EEF7]/60 mb-1">MFA設定</p>
                <p className="text-sm">
                  {user.mfaEnabled ? (
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                      有効
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs font-semibold">
                      無効
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Login Info */}
          <div className="bg-[#0A1628]/50 rounded-xl p-6 border border-[#00E5FF]/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              ログイン情報
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#E8EEF7]/60 mb-1">登録日</p>
                <p className="text-sm text-white">
                  {new Date(user.createdAt).toLocaleString('ja-JP')}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#E8EEF7]/60 mb-1">最終ログイン</p>
                <p className="text-sm text-white">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('ja-JP') : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#E8EEF7]/60 mb-1">ログイン回数</p>
                <p className="text-sm text-white">{user.loginCount || 0}回</p>
              </div>
              <div>
                <p className="text-sm text-[#E8EEF7]/60 mb-1">最終ログインIP</p>
                <p className="text-sm text-white font-mono">{user.lastLoginIp || '-'}</p>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          {user.profile && (
            <div className="bg-[#0A1628]/50 rounded-xl p-6 border border-[#00E5FF]/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                プロフィール
              </h3>
              <div className="space-y-4">
                {user.profile.bio && (
                  <div>
                    <p className="text-sm text-[#E8EEF7]/60 mb-1">自己紹介</p>
                    <p className="text-sm text-white whitespace-pre-wrap">{user.profile.bio}</p>
                  </div>
                )}
                {user.profile.skills && user.profile.skills.length > 0 && (
                  <div>
                    <p className="text-sm text-[#E8EEF7]/60 mb-2">スキル</p>
                    <div className="flex flex-wrap gap-2">
                      {user.profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.profile.phone && (
                    <div>
                      <p className="text-sm text-[#E8EEF7]/60 mb-1">電話番号</p>
                      <p className="text-sm text-white">{user.profile.phone}</p>
                    </div>
                  )}
                  {user.profile.website && (
                    <div>
                      <p className="text-sm text-[#E8EEF7]/60 mb-1">ウェブサイト</p>
                      <a
                        href={user.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#00E5FF] hover:underline"
                      >
                        {user.profile.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          {user.stats && (
            <div className="bg-[#0A1628]/50 rounded-xl p-6 border border-[#00E5FF]/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                統計情報
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {user.userType === 'company' && user.stats.jobsPosted !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#00E5FF]">{user.stats.jobsPosted}</p>
                    <p className="text-xs text-[#E8EEF7]/60 mt-1">投稿した案件</p>
                  </div>
                )}
                {user.userType === 'engineer' && user.stats.applicationsSubmitted !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#00E5FF]">{user.stats.applicationsSubmitted}</p>
                    <p className="text-xs text-[#E8EEF7]/60 mt-1">応募した案件</p>
                  </div>
                )}
                {user.stats.contractsCompleted !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#10B981]">{user.stats.contractsCompleted}</p>
                    <p className="text-xs text-[#E8EEF7]/60 mt-1">完了した契約</p>
                  </div>
                )}
                {user.userType === 'engineer' && user.stats.totalEarnings !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#FFD700]">
                      ¥{user.stats.totalEarnings.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#E8EEF7]/60 mt-1">総収入</p>
                  </div>
                )}
                {user.userType === 'company' && user.stats.totalSpent !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#FFD700]">
                      ¥{user.stats.totalSpent.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#E8EEF7]/60 mt-1">総支出</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#00E5FF] text-[#0A1628] rounded-lg font-semibold hover:bg-[#00E5FF]/90 transition-all"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserDetailModal
