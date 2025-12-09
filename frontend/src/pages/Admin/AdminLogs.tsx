import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import AdminHeader from '../../components/layout/AdminHeader'

interface SystemLog {
  type: 'payment_error' | 'login_failure' | 'api_error'
  timestamp: number
  message: string
  logGroup: string
  logStream: string
}

interface AccessLog {
  userId: string
  email: string
  displayName: string
  userType: string
  lastLoginAt: string
  lastLoginIp: string
  loginCount: number
  deviceInfo: string
}

interface AccessLogsResponse {
  accessLogs: AccessLog[]
  recentLogins: AccessLog[]
  newDeviceLogins: AccessLog[]
  statistics: {
    totalUsers: number
    usersWithLoginHistory: number
    recentLoginsCount: number
    newDeviceLoginsCount: number
  }
}

interface SystemLogsResponse {
  logs: SystemLog[]
  startTime: number
  endTime: number
  count: number
}

type LogType = 'all' | 'payment_errors' | 'login_failures' | 'api_errors'
type DateRange = '1hour' | '24hours' | '7days' | '30days'
type ViewMode = 'system' | 'access'

function AdminLogs() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('system')

  // System logs state
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])
  const [logType, setLogType] = useState<LogType>('all')
  const [dateRange, setDateRange] = useState<DateRange>('24hours')

  // Access logs state
  const [accessLogsData, setAccessLogsData] = useState<AccessLogsResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/admin/login')
      return
    }

    if (viewMode === 'system') {
      fetchSystemLogs()
    } else {
      fetchAccessLogs()
    }
  }, [user, navigate, viewMode, logType, dateRange])

  const getTimeRange = (): { startTime: number; endTime: number } => {
    const now = Date.now()
    let startTime = now

    switch (dateRange) {
      case '1hour':
        startTime = now - 60 * 60 * 1000
        break
      case '24hours':
        startTime = now - 24 * 60 * 60 * 1000
        break
      case '7days':
        startTime = now - 7 * 24 * 60 * 60 * 1000
        break
      case '30days':
        startTime = now - 30 * 24 * 60 * 60 * 1000
        break
    }

    return { startTime, endTime: now }
  }

  const fetchSystemLogs = async () => {
    try {
      setLoading(true)
      const { startTime, endTime } = getTimeRange()
      const response = await api.get<SystemLogsResponse>(
        `/admin/logs/system?logType=${logType}&startTime=${startTime}&endTime=${endTime}`
      )
      setSystemLogs(response.data.logs)
    } catch (error: any) {
      console.error('Error fetching system logs:', error)
      showToast(error.response?.data?.message || 'システムログの取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchAccessLogs = async () => {
    try {
      setLoading(true)
      const response = await api.get<AccessLogsResponse>('/admin/logs/access')
      setAccessLogsData(response.data)
    } catch (error: any) {
      console.error('Error fetching access logs:', error)
      showToast(error.response?.data?.message || 'アクセスログの取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredAccessLogs = useMemo(() => {
    if (!accessLogsData) return []
    if (!searchTerm) return accessLogsData.accessLogs

    const term = searchTerm.toLowerCase()
    return accessLogsData.accessLogs.filter(
      (log) =>
        log.email.toLowerCase().includes(term) ||
        log.displayName.toLowerCase().includes(term) ||
        log.lastLoginIp.includes(term)
    )
  }, [accessLogsData, searchTerm])

  const getLogTypeLabel = (type: string): string => {
    switch (type) {
      case 'payment_error':
        return '決済エラー'
      case 'login_failure':
        return 'ログイン失敗'
      case 'api_error':
        return 'APIエラー'
      default:
        return '不明'
    }
  }

  const getLogTypeBadgeColor = (type: string): string => {
    switch (type) {
      case 'payment_error':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'login_failure':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'api_error':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

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
          <h1 className="text-3xl font-bold gradient-text mb-2">システムログ管理</h1>
          <p className="text-[#E8EEF7]/60">エラー履歴とアクセスログの監視</p>
        </div>

        {/* View Mode Toggle */}
        <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('system')}
              className={`px-6 py-3 rounded-lg transition-all font-semibold ${
                viewMode === 'system'
                  ? 'bg-[#00E5FF] text-[#0A1628]'
                  : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
              }`}
            >
              システムログ
            </button>
            <button
              onClick={() => setViewMode('access')}
              className={`px-6 py-3 rounded-lg transition-all font-semibold ${
                viewMode === 'access'
                  ? 'bg-[#00E5FF] text-[#0A1628]'
                  : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
              }`}
            >
              アクセスログ
            </button>
          </div>
        </div>

        {/* System Logs View */}
        {viewMode === 'system' && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="glass-dark p-6 rounded-xl border border-red-500/20">
                <p className="text-[#E8EEF7]/60 text-sm mb-2">決済エラー</p>
                <p className="text-3xl font-bold text-red-400">
                  {systemLogs.filter((l) => l.type === 'payment_error').length}
                </p>
              </div>
              <div className="glass-dark p-6 rounded-xl border border-yellow-500/20">
                <p className="text-[#E8EEF7]/60 text-sm mb-2">ログイン失敗</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {systemLogs.filter((l) => l.type === 'login_failure').length}
                </p>
              </div>
              <div className="glass-dark p-6 rounded-xl border border-orange-500/20">
                <p className="text-[#E8EEF7]/60 text-sm mb-2">APIエラー</p>
                <p className="text-3xl font-bold text-orange-400">
                  {systemLogs.filter((l) => l.type === 'api_error').length}
                </p>
              </div>
              <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20">
                <p className="text-[#E8EEF7]/60 text-sm mb-2">総エラー数</p>
                <p className="text-3xl font-bold gradient-text-cyan">{systemLogs.length}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20 mb-6">
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">ログタイプ</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLogType('all')}
                      className={`px-4 py-2 rounded-lg transition-all text-sm ${
                        logType === 'all'
                          ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                          : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                      }`}
                    >
                      全て
                    </button>
                    <button
                      onClick={() => setLogType('payment_errors')}
                      className={`px-4 py-2 rounded-lg transition-all text-sm ${
                        logType === 'payment_errors'
                          ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                          : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                      }`}
                    >
                      決済エラー
                    </button>
                    <button
                      onClick={() => setLogType('login_failures')}
                      className={`px-4 py-2 rounded-lg transition-all text-sm ${
                        logType === 'login_failures'
                          ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                          : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                      }`}
                    >
                      ログイン失敗
                    </button>
                    <button
                      onClick={() => setLogType('api_errors')}
                      className={`px-4 py-2 rounded-lg transition-all text-sm ${
                        logType === 'api_errors'
                          ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                          : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                      }`}
                    >
                      APIエラー
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">期間</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDateRange('1hour')}
                      className={`px-4 py-2 rounded-lg transition-all text-sm ${
                        dateRange === '1hour'
                          ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                          : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                      }`}
                    >
                      過去1時間
                    </button>
                    <button
                      onClick={() => setDateRange('24hours')}
                      className={`px-4 py-2 rounded-lg transition-all text-sm ${
                        dateRange === '24hours'
                          ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                          : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                      }`}
                    >
                      過去24時間
                    </button>
                    <button
                      onClick={() => setDateRange('7days')}
                      className={`px-4 py-2 rounded-lg transition-all text-sm ${
                        dateRange === '7days'
                          ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                          : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                      }`}
                    >
                      過去7日間
                    </button>
                    <button
                      onClick={() => setDateRange('30days')}
                      className={`px-4 py-2 rounded-lg transition-all text-sm ${
                        dateRange === '30days'
                          ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                          : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
                      }`}
                    >
                      過去30日間
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* System Logs Table */}
            <div className="glass-dark rounded-xl border border-[#00E5FF]/20 overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-[#0A1628] border-b border-[#00E5FF]/20 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#00E5FF]">
                        タイプ
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#00E5FF]">
                        日時
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#00E5FF]">
                        メッセージ
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#00E5FF]">
                        ログソース
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00E5FF]/10">
                    {systemLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-[#E8EEF7]/60">
                          該当するログが見つかりませんでした
                        </td>
                      </tr>
                    ) : (
                      systemLogs.map((log, index) => (
                        <tr
                          key={index}
                          className="hover:bg-[#2C4875]/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getLogTypeBadgeColor(
                                log.type
                              )}`}
                            >
                              {getLogTypeLabel(log.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E8EEF7]">
                            {new Date(log.timestamp).toLocaleString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E8EEF7] font-mono max-w-md truncate">
                            {log.message}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E8EEF7]/60 text-xs">
                            {log.logGroup.split('/').pop()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Access Logs View */}
        {viewMode === 'access' && accessLogsData && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20">
                <p className="text-[#E8EEF7]/60 text-sm mb-2">総ユーザー数</p>
                <p className="text-3xl font-bold gradient-text-cyan">
                  {accessLogsData.statistics.totalUsers}
                </p>
              </div>
              <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20">
                <p className="text-[#E8EEF7]/60 text-sm mb-2">ログイン履歴あり</p>
                <p className="text-3xl font-bold gradient-text-cyan">
                  {accessLogsData.statistics.usersWithLoginHistory}
                </p>
              </div>
              <div className="glass-dark p-6 rounded-xl border border-green-500/20">
                <p className="text-[#E8EEF7]/60 text-sm mb-2">24時間以内のログイン</p>
                <p className="text-3xl font-bold text-green-400">
                  {accessLogsData.statistics.recentLoginsCount}
                </p>
              </div>
              <div className="glass-dark p-6 rounded-xl border border-yellow-500/20">
                <p className="text-[#E8EEF7]/60 text-sm mb-2">新規デバイス (7日間)</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {accessLogsData.statistics.newDeviceLoginsCount}
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20 mb-6">
              <input
                type="text"
                placeholder="メールアドレス、ユーザー名、IPアドレスで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#0A1628] border border-[#00E5FF]/20 text-[#E8EEF7] placeholder-[#E8EEF7]/40 focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            {/* Recent Logins Alert */}
            {accessLogsData.newDeviceLogins.length > 0 && (
              <div className="glass-dark p-6 rounded-xl border border-yellow-500/30 mb-6 bg-yellow-500/5">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h4 className="text-yellow-400 font-semibold mb-1">新規デバイスからのログイン検出</h4>
                    <p className="text-[#E8EEF7]/60 text-sm">
                      過去7日間で{accessLogsData.newDeviceLogins.length}
                      件の新規デバイスからのログインが検出されました。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Access Logs Table */}
            <div className="glass-dark rounded-xl border border-[#00E5FF]/20 overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-[#0A1628] border-b border-[#00E5FF]/20 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#00E5FF]">
                        ユーザー
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#00E5FF]">
                        メールアドレス
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#00E5FF]">
                        ユーザータイプ
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#00E5FF]">
                        最終ログイン
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#00E5FF]">
                        IPアドレス
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#00E5FF]">
                        ログイン回数
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00E5FF]/10">
                    {filteredAccessLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[#E8EEF7]/60">
                          該当するログが見つかりませんでした
                        </td>
                      </tr>
                    ) : (
                      filteredAccessLogs.map((log) => (
                        <tr
                          key={log.userId}
                          className="hover:bg-[#2C4875]/30 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-[#E8EEF7] font-medium">
                            {log.displayName}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E8EEF7]/80">{log.email}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                log.userType === 'company'
                                  ? 'bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30'
                                  : 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30'
                              }`}
                            >
                              {log.userType === 'company' ? '企業' : 'エンジニア'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E8EEF7]">
                            {new Date(log.lastLoginAt).toLocaleString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E8EEF7]/60 font-mono">
                            {log.lastLoginIp}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#E8EEF7]">{log.loginCount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminLogs
