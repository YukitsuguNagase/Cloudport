import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Contract } from '../../types/contract'
import { getContracts, approveContract } from '../../services/contracts'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/common/Pagination'

function ContractList() {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(null)

  // Pagination
  const { currentPage, totalPages, currentItems, goToPage } = usePagination({
    items: contracts,
    itemsPerPage: 20
  })

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    try {
      const data = await getContracts()
      setContracts(data)
    } catch (err: any) {
      setError(err.message || '契約の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (contractId: string) => {
    setPendingApprovalId(contractId)
    setShowApproveConfirm(true)
  }

  const confirmApprove = async () => {
    if (!pendingApprovalId) return

    try {
      setApprovingId(pendingApprovalId)
      const updatedContract = await approveContract(pendingApprovalId)
      // Update local state
      setContracts(contracts.map(c =>
        c.contractId === pendingApprovalId ? updatedContract : c
      ))
      showSuccess('オファーを承認しました')
      setShowApproveConfirm(false)
      setPendingApprovalId(null)
    } catch (err: any) {
      showError(err.message || '承認に失敗しました')
    } finally {
      setApprovingId(null)
    }
  }


  const getStatusBadge = (contract: Contract) => {
    switch (contract.status) {
      case 'pending_engineer':
        return <span className="px-3 py-1 rounded-full text-xs badge-primary">技術者承認待ち</span>
      case 'pending_company':
        return <span className="px-3 py-1 rounded-full text-xs badge-primary">企業承認待ち</span>
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-xs badge-cyan">支払い完了</span>
      default:
        return null
    }
  }

  const needsMyApproval = (contract: Contract) => {
    if (user?.userType === 'engineer' && contract.status === 'pending_engineer') {
      return true
    }
    if (user?.userType === 'company' && contract.status === 'pending_company') {
      return true
    }
    return false
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#00E5FF]/10 rounded-full blur-3xl animate-cloud-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl animate-cloud-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10 flex-1">
        <h1 className="text-3xl font-bold text-white mb-6 font-mono animate-slide-down">契約一覧</h1>

        {error && (
          <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] p-4 rounded-lg mb-6 animate-slide-down">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {currentItems.map((contract: any, index) => (
            <div
              key={contract.contractId}
              className="glass-dark p-6 rounded-2xl border border-[#00E5FF]/20 shadow-xl animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      to={`/jobs/${(contract as any).jobId}?from=contracts`}
                      className="text-lg font-bold text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300"
                    >
                      {contract.jobTitle || '案件名不明'}
                    </Link>
                    {getStatusBadge(contract)}
                  </div>
                  <p className="text-sm text-[#E8EEF7]/60">
                    相手: {contract.otherUser?.displayName || '不明'}
                  </p>
                  <p className="text-sm text-[#E8EEF7]/50">
                    申請日: {new Date(contract.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-[#0A1628]/30 p-4 rounded-lg mb-4 border border-[#00E5FF]/10">
                <div className={`grid ${user?.userType === 'company' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  <div>
                    <p className="text-sm text-[#E8EEF7]/60">契約金額</p>
                    <p className="text-xl font-bold text-white">
                      ¥{contract.contractAmount.toLocaleString()}
                    </p>
                    {user?.userType === 'engineer' && (
                      <p className="text-xs text-[#E8EEF7]/50 mt-1">
                        ※企業から直接お支払いを受けてください
                      </p>
                    )}
                  </div>
                  {user?.userType === 'company' && (
                    <div>
                      <p className="text-sm text-[#E8EEF7]/60">プラットフォーム手数料 ({contract.feePercentage}%)</p>
                      <p className="text-xl font-bold text-[#FF6B35]">
                        ¥{contract.feeAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#E8EEF7]/50 mt-1">
                        ※こちらの手数料のみプラットフォームにお支払いください
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-sm text-[#E8EEF7]/60 mb-4">
                <p>申請者: {contract.initiatedBy === 'engineer' ? '技術者' : '企業'}</p>
                {contract.approvedByEngineer && (
                  <p>技術者承認日時: {new Date(contract.approvedByEngineer).toLocaleString()}</p>
                )}
                {contract.approvedByCompany && (
                  <p>企業承認日時: {new Date(contract.approvedByCompany).toLocaleString()}</p>
                )}
              </div>

              {needsMyApproval(contract) && (
                <button
                  onClick={() => handleApprove(contract.contractId)}
                  disabled={approvingId === contract.contractId}
                  className="w-full bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {approvingId === contract.contractId ? '承認中...' : '契約を承認する'}
                </button>
              )}

              {contract.status === 'paid' && (
                <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 p-4 rounded-lg">
                  <p className="text-[#00E5FF] text-sm font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    オファー承認が完了しました
                  </p>
                  {contract.paidAt && (
                    <p className="text-[#00E5FF]/80 text-xs mt-1">
                      承認日時: {new Date(contract.paidAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {contracts.length === 0 && (
          <div className="glass-dark p-12 rounded-2xl border border-[#00E5FF]/20 shadow-2xl text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00E5FF]/10 mb-4">
              <svg className="w-8 h-8 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-[#E8EEF7]/60">まだ契約がありません</p>
          </div>
        )}

        {/* Pagination */}
        {contracts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}
      </div>

      <ConfirmDialog
        title="契約の承認"
        message="この契約を承認しますか？"
        confirmText="承認"
        confirmButtonClass="bg-green-600 hover:bg-green-700"
        onConfirm={confirmApprove}
        onCancel={() => {
          setShowApproveConfirm(false)
          setPendingApprovalId(null)
        }}
        isOpen={showApproveConfirm}
      />
    </div>
  )
}

export default ContractList
