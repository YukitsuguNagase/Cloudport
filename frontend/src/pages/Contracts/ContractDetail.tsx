import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Contract } from '../../types/contract'
import { getContractDetail, approveContract, processPayment } from '../../services/contracts'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import PaymentModal from '../../components/payment/PaymentModal'

function ContractDetail() {
  const { contractId } = useParams<{ contractId: string }>()
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (contractId) {
      fetchContractDetail()
    }
  }, [contractId])

  const fetchContractDetail = async () => {
    try {
      const data = await getContractDetail(contractId!)
      setContract(data)
    } catch (err: any) {
      setError(err.message || '契約の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = () => {
    setShowApproveConfirm(true)
  }

  const confirmApprove = async () => {
    if (!contractId) return

    try {
      setApprovingId(contractId)
      const updatedContract = await approveContract(contractId)
      setContract(updatedContract)
      showSuccess('契約を承認しました')
      setShowApproveConfirm(false)
    } catch (err: any) {
      showError(err.message || '承認に失敗しました')
    } finally {
      setApprovingId(null)
    }
  }

  const handlePayment = () => {
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async (token: string) => {
    setProcessing(true)
    try {
      const updatedContract = await processPayment(contractId!, token)
      setContract(updatedContract)
      setShowPaymentModal(false)
      showSuccess('決済が完了しました')
    } catch (err: any) {
      showError(err.message || '決済に失敗しました')
    } finally {
      setProcessing(false)
    }
  }

  const handlePaymentError = (error: string) => {
    showError(error)
    setProcessing(false)
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_engineer':
        return <span className="px-3 py-1 rounded-full text-xs badge-primary">技術者承認待ち</span>
      case 'pending_company':
        return <span className="px-3 py-1 rounded-full text-xs badge-primary">企業承認待ち</span>
      case 'pending_payment':
        return <span className="px-3 py-1 rounded-full text-xs badge-warning">決済待ち</span>
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-xs badge-cyan">支払い完了</span>
      case 'refunded':
        return <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-400">返金済み</span>
      default:
        return null
    }
  }

  const needsMyApproval = () => {
    if (!contract) return false
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

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 tech-grid opacity-20"></div>
        <div className="container mx-auto px-4 py-8 relative z-10 flex-1">
          <div className="mb-6 animate-slide-down">
            <Link to="/contracts" className="text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300 font-medium">
              ← 契約一覧に戻る
            </Link>
          </div>
          <div className="glass-dark p-12 rounded-2xl border border-[#FF6B35]/30 shadow-2xl text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF6B35]/10 mb-4">
              <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[#FF6B35]">{error || '契約が見つかりません'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#00E5FF]/10 rounded-full blur-3xl animate-cloud-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl animate-cloud-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10 flex-1">
        <div className="mb-6 animate-slide-down">
          <Link to="/contracts" className="text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300 font-medium">
            ← 契約一覧に戻る
          </Link>
        </div>

        <div className="glass-dark rounded-2xl border border-[#00E5FF]/20 shadow-2xl p-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white font-mono">契約詳細</h1>
            {getStatusBadge(contract.status)}
          </div>

          <div className="space-y-6">
            {/* 案件情報 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-[#00E5FF]/20">案件情報</h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-[#E8EEF7]/60 w-32">案件名:</span>
                  <span className="font-medium text-[#E8EEF7]">{(contract as any).jobTitle || '不明'}</span>
                </div>
                <div className="flex">
                  <span className="text-[#E8EEF7]/60 w-32">相手:</span>
                  <span className="font-medium text-[#E8EEF7]">{(contract as any).otherUser?.displayName || '不明'}</span>
                </div>
              </div>
            </section>

            {/* 金額情報 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-[#00E5FF]/20">金額情報</h2>
              <div className="bg-[#0A1628]/50 border border-[#00E5FF]/10 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#E8EEF7]">契約金額:</span>
                  <span className="text-2xl font-bold text-[#00E5FF]">
                    ¥{contract.contractAmount.toLocaleString()}
                  </span>
                </div>
                {user?.userType === 'engineer' && (
                  <div className="text-xs text-[#E8EEF7]/60 mt-1">
                    ※企業から直接お支払いを受けてください
                  </div>
                )}
                {user?.userType === 'company' && (
                  <>
                    <div className="text-xs text-[#E8EEF7]/60 mt-1">
                      ※技術者へ直接お支払いください
                    </div>
                    <div className="border-t border-[#00E5FF]/20 pt-3 mt-3"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#E8EEF7]">プラットフォーム手数料 ({contract.feePercentage}%):</span>
                      <span className="text-xl font-semibold text-[#FF6B35]">
                        ¥{contract.feeAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-[#E8EEF7]/60 mt-1">
                      ※こちらの手数料のみプラットフォームにお支払いください
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* 承認状況 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-[#00E5FF]/20">承認状況</h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-[#E8EEF7]/60 w-32">申請者:</span>
                  <span className="font-medium text-[#E8EEF7]">
                    {contract.initiatedBy === 'engineer' ? '技術者' : '企業'}
                  </span>
                </div>
                {contract.approvedByEngineer && (
                  <div className="flex">
                    <span className="text-[#E8EEF7]/60 w-32">技術者承認:</span>
                    <span className="font-medium text-[#00E5FF]">
                      ✓ {new Date(contract.approvedByEngineer).toLocaleString('ja-JP')}
                    </span>
                  </div>
                )}
                {contract.approvedByCompany && (
                  <div className="flex">
                    <span className="text-[#E8EEF7]/60 w-32">企業承認:</span>
                    <span className="font-medium text-[#00E5FF]">
                      ✓ {new Date(contract.approvedByCompany).toLocaleString('ja-JP')}
                    </span>
                  </div>
                )}
                {contract.paidAt && (
                  <div className="flex">
                    <span className="text-[#E8EEF7]/60 w-32">支払日時:</span>
                    <span className="font-medium text-[#5B8DEF]">
                      ✓ {new Date(contract.paidAt).toLocaleString('ja-JP')}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* その他の情報 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-[#00E5FF]/20">その他の情報</h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="text-[#E8EEF7]/60 w-32">契約ID:</span>
                  <span className="text-sm font-mono text-[#E8EEF7]/80">{contract.contractId}</span>
                </div>
                <div className="flex">
                  <span className="text-[#E8EEF7]/60 w-32">作成日時:</span>
                  <span className="font-medium text-[#E8EEF7]">{new Date(contract.createdAt).toLocaleString('ja-JP')}</span>
                </div>
                <div className="flex">
                  <span className="text-[#E8EEF7]/60 w-32">更新日時:</span>
                  <span className="font-medium text-[#E8EEF7]">{new Date(contract.updatedAt).toLocaleString('ja-JP')}</span>
                </div>
              </div>
            </section>

            {/* アクションボタン */}
            <div className="pt-4">
              {needsMyApproval() && (
                <button
                  onClick={handleApprove}
                  disabled={!!approvingId}
                  className="w-full bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {approvingId ? '承認中...' : '契約を承認する'}
                </button>
              )}

              {contract.status === 'pending_payment' && user?.userType === 'company' && (
                <div className="space-y-4">
                  <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 p-4 rounded-lg">
                    <p className="text-[#FF6B35] font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      プラットフォーム手数料のお支払い
                    </p>
                    <p className="text-[#E8EEF7] text-sm mt-2">
                      技術者が契約を承認しました。プラットフォーム手数料をお支払いいただくと契約が成立します。
                    </p>
                    <p className="text-[#E8EEF7]/80 text-xs mt-2">
                      ※技術者への契約金額は直接お支払いください
                    </p>
                  </div>
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C5A] text-white py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-[#FF6B35]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {processing ? '処理中...' : `プラットフォーム手数料を支払う (¥${contract.feeAmount.toLocaleString()})`}
                  </button>
                </div>
              )}

              {contract.status === 'pending_payment' && user?.userType === 'engineer' && (
                <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 p-4 rounded-lg">
                  <p className="text-[#00E5FF] font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    企業の決済待ち
                  </p>
                  <p className="text-[#E8EEF7] text-sm mt-2">
                    企業がプラットフォーム手数料を支払うと契約が成立します。
                  </p>
                </div>
              )}

              {contract.status === 'paid' && (
                <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 p-4 rounded-lg">
                  <p className="text-[#00E5FF] font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    オファー承認が完了しました
                  </p>
                  <p className="text-[#E8EEF7] text-sm mt-2">
                    この契約は成立しています。お疲れさまでした。
                  </p>
                  {contract.paymentMethod && (
                    <p className="text-[#E8EEF7]/60 text-xs mt-2">
                      決済方法: {contract.paymentMethod}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 承認確認ダイアログ */}
      <ConfirmDialog
        title="契約の承認"
        message="この契約を承認しますか？"
        confirmText="承認"
        confirmButtonClass="bg-green-600 hover:bg-green-700"
        onConfirm={confirmApprove}
        onCancel={() => setShowApproveConfirm(false)}
        isOpen={showApproveConfirm}
      />

      {/* 決済モーダル */}
      {contract && (
        <PaymentModal
          isOpen={showPaymentModal}
          amount={contract.feeAmount}
          contractId={contractId!}
          onClose={() => !processing && setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </div>
  )
}

export default ContractDetail
