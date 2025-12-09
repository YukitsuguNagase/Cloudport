import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import AdminHeader from '../../components/layout/AdminHeader'

interface AdminUser {
  userId: string
  email: string
  displayName?: string
  userType: 'engineer' | 'company'
  createdAt: string
  lastLoginAt?: string
  mfaEnabled?: boolean
  accountStatus?: 'active' | 'disabled' | 'suspended'
}

type UserTypeFilter = 'all' | 'engineer' | 'company'
type AccountStatusFilter = 'all' | 'active' | 'disabled'
type MFAFilter = 'all' | 'enabled' | 'disabled'

function AdminUsers() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [userTypeFilter, setUserTypeFilter] = useState<UserTypeFilter>('all')
  const [accountStatusFilter, setAccountStatusFilter] = useState<AccountStatusFilter>('all')
  const [mfaFilter, setMFAFilter] = useState<MFAFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/admin/login')
      return
    }

    // Check if user is admin
    if (user.email !== 'yukinag@dotqinc.com') {
      showToast('管理者権限が必要です', 'error')
      navigate('/')
      return
    }

    fetchUsers()
  }, [user, navigate])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      showToast('ユーザー情報の取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    // User type filter
    if (userTypeFilter !== 'all' && u.userType !== userTypeFilter) return false

    // Account status filter
    const status = u.accountStatus || 'active'
    if (accountStatusFilter !== 'all' && status !== accountStatusFilter) return false

    // MFA filter
    if (mfaFilter !== 'all') {
      const hasMFA = u.mfaEnabled || false
      if (mfaFilter === 'enabled' && !hasMFA) return false
      if (mfaFilter === 'disabled' && hasMFA) return false
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        u.userId.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.displayName?.toLowerCase().includes(term)
      )
    }

    return true
  })

  const totalUsers = users.length
  const engineerCount = users.filter((u) => u.userType === 'engineer').length
  const companyCount = users.filter((u) => u.userType === 'company').length
  const mfaEnabledCount = users.filter((u) => u.mfaEnabled).length

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF]"></div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875]">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">ユーザー管理</h1>
          <p className="text-[#E8EEF7]/60">登録ユーザーの一覧と管理</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20">
            <p className="text-[#E8EEF7]/60 text-sm mb-2">総ユーザー数</p>
            <p className="text-3xl font-bold gradient-text-cyan">{totalUsers}</p>
          </div>
          <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20">
            <p className="text-[#E8EEF7]/60 text-sm mb-2">エンジニア</p>
            <p className="text-3xl font-bold text-[#00E5FF]">{engineerCount}</p>
          </div>
          <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20">
            <p className="text-[#E8EEF7]/60 text-sm mb-2">企業</p>
            <p className="text-3xl font-bold text-[#FF6B35]">{companyCount}</p>
          </div>
          <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20">
            <p className="text-[#E8EEF7]/60 text-sm mb-2">MFA有効</p>
            <p className="text-3xl font-bold text-[#10B981]">{mfaEnabledCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20 mb-6">
          <div className="space-y-4">
            {/* User Type Filter */}
            <div>
              <label className="text-sm font-medium text-[#E8EEF7]/80 mb-2 block">ユーザータイプ</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setUserTypeFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    userTypeFilter === 'all'
                      ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                      : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                  }`}
                >
                  全て
                </button>
                <button
                  onClick={() => setUserTypeFilter('engineer')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    userTypeFilter === 'engineer'
                      ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                      : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                  }`}
                >
                  エンジニア
                </button>
                <button
                  onClick={() => setUserTypeFilter('company')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    userTypeFilter === 'company'
                      ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                      : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                  }`}
                >
                  企業
                </button>
              </div>
            </div>

            {/* Account Status & MFA Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#E8EEF7]/80 mb-2 block">アカウント状態</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAccountStatusFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      accountStatusFilter === 'all'
                        ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                        : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                    }`}
                  >
                    全て
                  </button>
                  <button
                    onClick={() => setAccountStatusFilter('active')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      accountStatusFilter === 'active'
                        ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                        : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                    }`}
                  >
                    有効
                  </button>
                  <button
                    onClick={() => setAccountStatusFilter('disabled')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      accountStatusFilter === 'disabled'
                        ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                        : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                    }`}
                  >
                    無効
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#E8EEF7]/80 mb-2 block">MFA設定</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMFAFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      mfaFilter === 'all'
                        ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                        : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                    }`}
                  >
                    全て
                  </button>
                  <button
                    onClick={() => setMFAFilter('enabled')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      mfaFilter === 'enabled'
                        ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                        : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                    }`}
                  >
                    有効
                  </button>
                  <button
                    onClick={() => setMFAFilter('disabled')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      mfaFilter === 'disabled'
                        ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                        : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                    }`}
                  >
                    無効
                  </button>
                </div>
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="text-sm font-medium text-[#E8EEF7]/80 mb-2 block">検索</label>
              <input
                type="text"
                placeholder="ユーザーID、メールアドレス、名前で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#0A1628] border border-[#00E5FF]/20 text-[#E8EEF7] placeholder-[#E8EEF7]/40 focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-dark rounded-xl border border-[#00E5FF]/20 overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-[#0A1628] border-b border-[#00E5FF]/20 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider whitespace-nowrap w-[280px]">
                    ユーザーID
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider min-w-[200px]">
                    メールアドレス
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider min-w-[150px]">
                    ユーザー名
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider whitespace-nowrap w-[100px]">
                    タイプ
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider whitespace-nowrap w-[80px]">
                    MFA
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider whitespace-nowrap w-[100px]">
                    状態
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider whitespace-nowrap w-[140px]">
                    登録日
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider whitespace-nowrap w-[140px]">
                    最終ログイン
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider whitespace-nowrap w-[80px]">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00E5FF]/10">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-[#E8EEF7]/60">
                      該当するユーザーがありません
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.userId} className="hover:bg-[#0A1628]/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-[#E8EEF7] font-mono">
                        {u.userId}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#E8EEF7]">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#E8EEF7]">
                        {u.displayName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {u.userType === 'engineer' ? (
                          <span className="px-2 py-1 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] text-xs font-semibold whitespace-nowrap">
                            エンジニア
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-semibold whitespace-nowrap">
                            企業
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {u.mfaEnabled ? (
                          <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold whitespace-nowrap">
                            有効
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs font-semibold whitespace-nowrap">
                            無効
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {(u.accountStatus || 'active') === 'active' ? (
                          <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold whitespace-nowrap">
                            有効
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold whitespace-nowrap">
                            無効
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#E8EEF7]/60">
                        {new Date(u.createdAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#E8EEF7]/60">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                            })
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          className="px-2 py-1 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF] hover:bg-[#00E5FF]/30 transition-colors text-xs font-semibold whitespace-nowrap"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 text-sm text-[#E8EEF7]/60 text-right">
          表示件数: {filteredUsers.length} / 全{users.length}件
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
