import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import AdminHeader from '../../components/layout/AdminHeader'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AdminContract {
  contractId: string
  applicationId: string
  jobId: string
  engineerId: string
  companyId: string
  status: string
  contractAmount: number
  feeAmount: number
  feePercentage: number
  paymentId?: string
  paymentMethod?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
  engineerName?: string
  companyName?: string
  jobTitle?: string
}

type DateRange = '7days' | '30days' | '3months' | 'all'

function AdminDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [contracts, setContracts] = useState<AdminContract[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>('30days')

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

    fetchContracts()
  }, [user, navigate])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/contracts')
      setContracts(response.data)
    } catch (error) {
      console.error('Error fetching contracts:', error)
      showToast('取引履歴の取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }


  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      '契約ID',
      '案件名',
      '企業名',
      '技術者名',
      '契約金額',
      '手数料',
      'ステータス',
      '決済ID',
      '決済日時',
      '作成日時',
    ]

    const csvRows = [
      headers.join(','),
      ...filteredContracts.map((contract) =>
        [
          contract.contractId,
          `"${contract.jobTitle || '-'}"`,
          `"${contract.companyName || '-'}"`,
          `"${contract.engineerName || '-'}"`,
          contract.contractAmount,
          contract.feeAmount,
          contract.status,
          contract.paymentId || '-',
          contract.paidAt
            ? new Date(contract.paidAt).toLocaleDateString('ja-JP')
            : '-',
          new Date(contract.createdAt).toLocaleDateString('ja-JP'),
        ].join(',')
      ),
    ]

    const csvContent = csvRows.join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `contracts_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast('CSVファイルをエクスポートしました', 'success')
  }

  const filteredContracts = contracts.filter((contract) => {
    // Filter by status
    if (filter === 'paid' && contract.status !== 'paid') return false
    if (filter === 'pending' && contract.status === 'paid') return false

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        contract.contractId.toLowerCase().includes(term) ||
        contract.paymentId?.toLowerCase().includes(term) ||
        contract.engineerName?.toLowerCase().includes(term) ||
        contract.companyName?.toLowerCase().includes(term) ||
        contract.jobTitle?.toLowerCase().includes(term)
      )
    }

    return true
  })

  const totalFeeRevenue = contracts
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + c.feeAmount, 0)

  const totalContractValue = contracts
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + c.contractAmount, 0)

  // Calculate date range filter
  const getDateRangeFilter = (range: DateRange): Date | null => {
    const now = new Date()
    switch (range) {
      case '7days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case '30days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      case '3months':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      case 'all':
        return null
    }
  }

  // Filter contracts by date range
  const dateFilteredContracts = useMemo(() => {
    const startDate = getDateRangeFilter(dateRange)
    if (!startDate) return contracts
    return contracts.filter((c) => {
      const contractDate = new Date(c.paidAt || c.createdAt)
      return contractDate >= startDate
    })
  }, [contracts, dateRange])

  // Generate revenue chart data
  const revenueChartData = useMemo(() => {
    const paidContracts = dateFilteredContracts.filter((c) => c.status === 'paid' && c.paidAt)

    // Group by date
    const groupedByDate: Record<string, { date: string; revenue: number; contracts: number }> = {}

    paidContracts.forEach((contract) => {
      const date = new Date(contract.paidAt!)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { date: dateKey, revenue: 0, contracts: 0 }
      }

      groupedByDate[dateKey].revenue += contract.feeAmount
      groupedByDate[dateKey].contracts += 1
    })

    // Convert to array and sort by date
    return Object.values(groupedByDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        date: new Date(item.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
        revenue: Math.round(item.revenue),
        contracts: item.contracts,
      }))
  }, [dateFilteredContracts])

  // Calculate refund rate
  const refundRate = useMemo(() => {
    const paidCount = dateFilteredContracts.filter((c) => c.status === 'paid').length
    const refundedCount = dateFilteredContracts.filter((c) => c.status === 'refunded').length
    if (paidCount + refundedCount === 0) return 0
    return ((refundedCount / (paidCount + refundedCount)) * 100).toFixed(1)
  }, [dateFilteredContracts])

  // Calculate success rate (contracts that reached 'paid' status)
  const successRate = useMemo(() => {
    const totalContracts = dateFilteredContracts.length
    const successfulContracts = dateFilteredContracts.filter(
      (c) => c.status === 'paid' || c.status === 'completed'
    ).length
    if (totalContracts === 0) return 0
    return ((successfulContracts / totalContracts) * 100).toFixed(1)
  }, [dateFilteredContracts])

  // Calculate pending contracts
  const pendingCount = useMemo(() => {
    return dateFilteredContracts.filter((c) => c.status === 'pending' || c.status === 'approved').length
  }, [dateFilteredContracts])

  // Calculate average contract value
  const avgContractValue = useMemo(() => {
    const paidContracts = dateFilteredContracts.filter((c) => c.status === 'paid')
    if (paidContracts.length === 0) return 0
    const total = paidContracts.reduce((sum, c) => sum + c.contractAmount, 0)
    return Math.round(total / paidContracts.length)
  }, [dateFilteredContracts])

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
        <h1 className="text-3xl font-bold gradient-text mb-2">管理者ダッシュボード</h1>
        <p className="text-[#E8EEF7]/60">取引履歴管理</p>
      </div>

      {/* MFA Warning Banner */}
      <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-yellow-400 font-semibold mb-1">セキュリティ推奨</h3>
            <p className="text-[#E8EEF7]/80 text-sm">
              管理者アカウントには多要素認証（MFA）の設定を強く推奨します。
              プロフィール設定からMFAを有効化してください。
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20">
          <p className="text-[#E8EEF7]/60 text-sm mb-2">総取引件数</p>
          <p className="text-3xl font-bold gradient-text-cyan">{contracts.length}</p>
          <p className="text-xs text-[#E8EEF7]/40 mt-2">全期間</p>
        </div>
        <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20">
          <p className="text-[#E8EEF7]/60 text-sm mb-2">手数料収益</p>
          <p className="text-3xl font-bold gradient-text-cyan">¥{totalFeeRevenue.toLocaleString()}</p>
          <p className="text-xs text-[#E8EEF7]/40 mt-2">決済済み合計</p>
        </div>
        <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20">
          <p className="text-[#E8EEF7]/60 text-sm mb-2">総契約金額</p>
          <p className="text-3xl font-bold gradient-text-cyan">¥{totalContractValue.toLocaleString()}</p>
          <p className="text-xs text-[#E8EEF7]/40 mt-2">決済済み合計</p>
        </div>
        <div className="glass-dark p-6 rounded-xl border border-[#10B981]/20">
          <p className="text-[#E8EEF7]/60 text-sm mb-2">成約率</p>
          <p className="text-3xl font-bold text-[#10B981]">{successRate}%</p>
          <p className="text-xs text-[#E8EEF7]/40 mt-2">決済完了率</p>
        </div>
      </div>

      {/* Additional Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-dark p-6 rounded-xl border border-[#F59E0B]/20">
          <p className="text-[#E8EEF7]/60 text-sm mb-2">待機中</p>
          <p className="text-3xl font-bold text-[#F59E0B]">{pendingCount}</p>
          <p className="text-xs text-[#E8EEF7]/40 mt-2">未決済契約</p>
        </div>
        <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20">
          <p className="text-[#E8EEF7]/60 text-sm mb-2">平均契約単価</p>
          <p className="text-3xl font-bold gradient-text-cyan">¥{avgContractValue.toLocaleString()}</p>
          <p className="text-xs text-[#E8EEF7]/40 mt-2">決済済み平均</p>
        </div>
        <div className="glass-dark p-6 rounded-xl border border-[#EF4444]/20">
          <p className="text-[#E8EEF7]/60 text-sm mb-2">返金率</p>
          <p className="text-3xl font-bold text-[#EF4444]">{refundRate}%</p>
          <p className="text-xs text-[#E8EEF7]/40 mt-2">返金/全決済</p>
        </div>
        <div className="glass-dark p-6 rounded-xl border border-[#8B5CF6]/20">
          <p className="text-[#E8EEF7]/60 text-sm mb-2">決済済み</p>
          <p className="text-3xl font-bold text-[#8B5CF6]">
            {dateFilteredContracts.filter((c) => c.status === 'paid').length}
          </p>
          <p className="text-xs text-[#E8EEF7]/40 mt-2">選択期間内</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-white">統計期間</h3>
          <div className="flex gap-2">
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
            <button
              onClick={() => setDateRange('3months')}
              className={`px-4 py-2 rounded-lg transition-all text-sm ${
                dateRange === '3months'
                  ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                  : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
              }`}
            >
              過去3ヶ月
            </button>
            <button
              onClick={() => setDateRange('all')}
              className={`px-4 py-2 rounded-lg transition-all text-sm ${
                dateRange === 'all'
                  ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                  : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
              }`}
            >
              全期間
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      {revenueChartData.length > 0 && (
        <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">期間別手数料収益</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C4875" />
              <XAxis dataKey="date" stroke="#E8EEF7" />
              <YAxis stroke="#E8EEF7" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A2942',
                  border: '1px solid #00E5FF',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#E8EEF7' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="手数料収益 (¥)"
                stroke="#00E5FF"
                strokeWidth={2}
                dot={{ fill: '#00E5FF', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Contracts Bar Chart */}
      {revenueChartData.length > 0 && (
        <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">日別契約件数</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C4875" />
              <XAxis dataKey="date" stroke="#E8EEF7" />
              <YAxis stroke="#E8EEF7" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A2942',
                  border: '1px solid #00E5FF',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#E8EEF7' }}
              />
              <Legend />
              <Bar dataKey="contracts" name="契約件数" fill="#00E5FF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="glass-dark p-6 rounded-xl border border-[#00E5FF]/20 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2">
              <h3 className="text-lg font-semibold text-white">取引フィルター</h3>
            </div>
            <button
              onClick={exportToCSV}
              disabled={filteredContracts.length === 0}
              className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSVエクスポート
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                  : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
              }`}
            >
              全て
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'paid'
                  ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                  : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
              }`}
            >
              決済済み
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'pending'
                  ? 'bg-[#00E5FF] text-[#0A1628] font-semibold'
                  : 'bg-[#1A2942] text-[#E8EEF7]/60 hover:bg-[#2C4875]'
              }`}
            >
              未決済
            </button>
          </div>

          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="契約ID、決済ID、企業名、技術者名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#0A1628] border border-[#00E5FF]/20 text-[#E8EEF7] placeholder-[#E8EEF7]/40 focus:outline-none focus:border-[#00E5FF]"
            />
          </div>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="glass-dark rounded-xl border border-[#00E5FF]/20 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full min-w-[1400px]">
            <thead className="bg-[#0A1628] border-b border-[#00E5FF]/20 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider whitespace-nowrap w-[280px]">
                  契約ID
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider min-w-[200px]">
                  案件
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider whitespace-nowrap w-[120px]">
                  企業
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider whitespace-nowrap w-[120px]">
                  技術者
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider whitespace-nowrap w-[100px]">
                  契約金額
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider whitespace-nowrap w-[100px]">
                  手数料
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider whitespace-nowrap w-[100px]">
                  ステータス
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider whitespace-nowrap w-[280px]">
                  決済ID
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-[#E8EEF7]/60 uppercase tracking-wider whitespace-nowrap w-[140px]">
                  決済日時
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00E5FF]/10">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-[#E8EEF7]/60">
                    該当する取引がありません
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => (
                  <tr key={contract.contractId} className="hover:bg-[#0A1628]/50 transition-colors">
                    <td className="px-4 py-3 text-xs text-[#E8EEF7] font-mono">
                      {contract.contractId}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#E8EEF7]">
                      {contract.jobTitle || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#E8EEF7]">
                      {contract.companyName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#E8EEF7]">
                      {contract.engineerName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#E8EEF7] font-semibold">
                      ¥{contract.contractAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#00E5FF] font-semibold">
                      ¥{contract.feeAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {contract.status === 'paid' ? (
                        <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold whitespace-nowrap">
                          決済済み
                        </span>
                      ) : contract.status === 'refunded' ? (
                        <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold whitespace-nowrap">
                          返金済み
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold whitespace-nowrap">
                          {contract.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#E8EEF7] font-mono">
                      {contract.paymentId || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#E8EEF7]/60">
                      {contract.paidAt
                        ? new Date(contract.paidAt).toLocaleString('ja-JP', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
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
        表示件数: {filteredContracts.length} / 全{contracts.length}件
      </div>
      </div>
    </div>
  )
}

export default AdminDashboard
