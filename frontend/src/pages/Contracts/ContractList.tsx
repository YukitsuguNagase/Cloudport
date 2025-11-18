import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Contract } from '../../types/contract'
import { getContracts, approveContract, processPayment } from '../../services/contracts'
import { useAuth } from '../../contexts/AuthContext'

function ContractList() {
  const { user } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [payingId, setPayingId] = useState<string | null>(null)

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
    if (!confirm('この契約を承認しますか？')) {
      return
    }

    try {
      setApprovingId(contractId)
      const updatedContract = await approveContract(contractId)
      // Update local state
      setContracts(contracts.map(c =>
        c.contractId === contractId ? updatedContract : c
      ))
      alert('契約を承認しました')
    } catch (err: any) {
      alert(err.message || '承認に失敗しました')
    } finally {
      setApprovingId(null)
    }
  }

  const handlePayment = async (contractId: string, amount: number, fee: number) => {
    const total = amount + fee
    if (!confirm(
      `【デモ支払い】\n\n` +
      `契約金額: ¥${amount.toLocaleString()}\n` +
      `手数料: ¥${fee.toLocaleString()}\n` +
      `合計: ¥${total.toLocaleString()}\n\n` +
      `この金額で支払いを実行しますか？\n` +
      `※これはデモ機能です。実際の決済は行われません。`
    )) {
      return
    }

    try {
      setPayingId(contractId)
      const updatedContract = await processPayment(contractId)
      // Update local state
      setContracts(contracts.map(c =>
        c.contractId === contractId ? updatedContract : c
      ))
      alert('デモ支払いが完了しました！\n※本番環境では実際の決済処理が行われます。')
    } catch (err: any) {
      alert(err.message || '支払い処理に失敗しました')
    } finally {
      setPayingId(null)
    }
  }

  const getStatusBadge = (contract: Contract) => {
    switch (contract.status) {
      case 'pending_engineer':
        return <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">技術者承認待ち</span>
      case 'pending_company':
        return <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">企業承認待ち</span>
      case 'approved':
        return <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">承認済み（支払い待ち）</span>
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">支払い完了</span>
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
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">契約一覧</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {contracts.map((contract: any) => (
            <div
              key={contract.contractId}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">
                      {contract.jobTitle || '案件名不明'}
                    </h3>
                    {getStatusBadge(contract)}
                  </div>
                  <p className="text-sm text-gray-600">
                    相手: {contract.otherUser?.displayName || '不明'}
                  </p>
                  <p className="text-sm text-gray-500">
                    申請日: {new Date(contract.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">契約金額</p>
                    <p className="text-xl font-bold text-gray-900">
                      ¥{contract.contractAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">手数料 ({contract.feePercentage}%)</p>
                    <p className="text-xl font-bold text-red-600">
                      ¥{contract.feeAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
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
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {approvingId === contract.contractId ? '承認中...' : '契約を承認する'}
                </button>
              )}

              {contract.status === 'approved' && (
                <>
                  {user?.userType === 'company' ? (
                    <button
                      onClick={() => handlePayment(contract.contractId, contract.contractAmount, contract.feeAmount)}
                      disabled={payingId === contract.contractId}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                    >
                      {payingId === contract.contractId ? '処理中...' : '💳 支払いを実行する（デモ）'}
                    </button>
                  ) : (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-green-800 text-sm font-semibold">
                        双方承認済みです。企業側の支払いをお待ちください。
                      </p>
                    </div>
                  )}
                </>
              )}

              {contract.status === 'paid' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm font-semibold">
                    ✅ 支払いが完了しました。
                  </p>
                  {contract.paidAt && (
                    <p className="text-blue-700 text-xs mt-1">
                      支払日時: {new Date(contract.paidAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {contracts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            まだ契約がありません
          </div>
        )}
      </div>
    </div>
  )
}

export default ContractList
