import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Contract } from '../../types/contract'
import { getContracts } from '../../services/contracts'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/common/Pagination'

function PaymentList() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination
  const { currentPage, totalPages, currentItems, goToPage } = usePagination({
    items: payments,
    itemsPerPage: 20
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const contracts = await getContracts()
      // Filter only paid contracts
      const paidContracts = contracts.filter(c => c.status === 'paid')
      // Sort by payment date (newest first)
      paidContracts.sort((a, b) => {
        const dateA = a.paidAt ? new Date(a.paidAt).getTime() : 0
        const dateB = b.paidAt ? new Date(b.paidAt).getTime() : 0
        return dateB - dateA
      })
      setPayments(paidContracts)
    } catch (err: any) {
      setError(err.message || '支払い履歴の取得に失敗しました')
    } finally {
      setLoading(false)
    }
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

      <div className="container mx-auto px-4 py-8 relative z-10 flex-1">
        <h1 className="text-3xl font-bold text-white mb-6 font-mono animate-slide-down">支払い履歴</h1>

        {error && (
          <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] p-4 rounded-lg mb-6 animate-slide-down">
            {error}
          </div>
        )}

        {payments.length === 0 ? (
          <div className="glass-dark p-12 rounded-2xl border border-[#00E5FF]/20 shadow-2xl text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00E5FF]/10 mb-4">
              <svg className="w-8 h-8 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-[#E8EEF7]">まだ支払い履歴がありません</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block glass-dark rounded-2xl border border-[#00E5FF]/20 shadow-2xl overflow-hidden animate-slide-up">
              <table className="min-w-full divide-y divide-[#00E5FF]/10">
                <thead className="bg-[#0A1628]/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#00E5FF] uppercase tracking-wider">
                      支払日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#00E5FF] uppercase tracking-wider">
                      案件名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#00E5FF] uppercase tracking-wider">
                      相手
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#00E5FF] uppercase tracking-wider">
                      契約金額
                    </th>
                    {user?.userType === 'company' && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-[#00E5FF] uppercase tracking-wider">
                        手数料
                      </th>
                    )}
                    <th className="px-6 py-3 text-center text-xs font-medium text-[#00E5FF] uppercase tracking-wider">
                      詳細
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#00E5FF]/10">
                  {currentItems.map((payment: any) => {
                    const isCompany = user?.userType === 'company'

                    return (
                      <tr key={payment.contractId} className="hover:bg-[#00E5FF]/5 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E8EEF7]">
                          {payment.paidAt
                            ? new Date(payment.paidAt).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#E8EEF7]">
                          {payment.jobTitle || '案件名不明'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E8EEF7]">
                          {payment.otherUser?.displayName || '不明'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-[#00E5FF]">
                          ¥{payment.contractAmount.toLocaleString()}
                        </td>
                        {isCompany && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-[#FF6B35]">
                            ¥{payment.feeAmount.toLocaleString()}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <Link
                            to={`/contracts/${payment.contractId}`}
                            className="text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300"
                          >
                            詳細
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Summary */}
              {user?.userType === 'company' && payments.length > 0 && (
                <div className="bg-[#0A1628]/50 px-6 py-4 border-t border-[#00E5FF]/20">
                  <div className="flex justify-end space-x-8">
                    <div className="text-right">
                      <p className="text-sm text-[#E8EEF7]">契約金額合計</p>
                      <p className="text-xs text-[#E8EEF7]/60 mt-1">（技術者へ直接支払い）</p>
                      <p className="text-lg font-semibold text-[#00E5FF]">
                        ¥
                        {payments
                          .reduce((sum, p) => sum + p.contractAmount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#E8EEF7]">手数料合計</p>
                      <p className="text-xs text-[#E8EEF7]/60 mt-1">（プラットフォームへ支払い済み）</p>
                      <p className="text-xl font-bold text-[#FF6B35]">
                        ¥
                        {payments
                          .reduce((sum, p) => sum + p.feeAmount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {user?.userType === 'engineer' && payments.length > 0 && (
                <div className="bg-[#0A1628]/50 px-6 py-4 border-t border-[#00E5FF]/20">
                  <div className="flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-[#E8EEF7]">契約金額合計</p>
                      <p className="text-xs text-[#E8EEF7]/60 mt-1">（企業から直接受け取り）</p>
                      <p className="text-xl font-bold text-[#00E5FF]">
                        ¥
                        {payments
                          .reduce((sum, p) => sum + p.contractAmount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {currentItems.map((payment: any) => {
                const isCompany = user?.userType === 'company'

                return (
                  <div key={payment.contractId} className="glass-dark rounded-2xl border border-[#00E5FF]/20 shadow-2xl p-4 animate-slide-up">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-[#E8EEF7]/60">支払日</p>
                        <p className="text-sm font-medium text-[#E8EEF7]">
                          {payment.paidAt
                            ? new Date(payment.paidAt).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              })
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#E8EEF7]/60">案件名</p>
                        <p className="text-sm font-medium text-[#E8EEF7]">
                          {payment.jobTitle || '案件名不明'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#E8EEF7]/60">相手</p>
                        <p className="text-sm font-medium text-[#E8EEF7]">
                          {payment.otherUser?.displayName || '不明'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#E8EEF7]/60">契約金額</p>
                        <p className="text-lg font-bold text-[#00E5FF]">
                          ¥{payment.contractAmount.toLocaleString()}
                        </p>
                      </div>
                      {isCompany && (
                        <div>
                          <p className="text-xs text-[#E8EEF7]/60">手数料</p>
                          <p className="text-lg font-bold text-[#FF6B35]">
                            ¥{payment.feeAmount.toLocaleString()}
                          </p>
                        </div>
                      )}
                      <Link
                        to={`/contracts/${payment.contractId}`}
                        className="block w-full text-center bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white py-2 rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all duration-300 font-semibold"
                      >
                        詳細を見る
                      </Link>
                    </div>
                  </div>
                )
              })}

              {/* Mobile Summary */}
              {user?.userType === 'company' && payments.length > 0 && (
                <div className="glass-dark rounded-2xl border border-[#00E5FF]/20 shadow-2xl p-4 animate-slide-up">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-[#E8EEF7]">契約金額合計</p>
                      <p className="text-xs text-[#E8EEF7]/60">（技術者へ直接支払い）</p>
                      <p className="text-xl font-bold text-[#00E5FF]">
                        ¥
                        {payments
                          .reduce((sum, p) => sum + p.contractAmount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <div className="border-t border-[#00E5FF]/20 pt-3">
                      <p className="text-sm text-[#E8EEF7]">手数料合計</p>
                      <p className="text-xs text-[#E8EEF7]/60">（プラットフォームへ支払い済み）</p>
                      <p className="text-xl font-bold text-[#FF6B35]">
                        ¥
                        {payments
                          .reduce((sum, p) => sum + p.feeAmount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {user?.userType === 'engineer' && payments.length > 0 && (
                <div className="glass-dark rounded-2xl border border-[#00E5FF]/20 shadow-2xl p-4 animate-slide-up">
                  <div>
                    <p className="text-sm text-[#E8EEF7]">契約金額合計</p>
                    <p className="text-xs text-[#E8EEF7]/60">（企業から直接受け取り）</p>
                    <p className="text-xl font-bold text-[#00E5FF]">
                      ¥
                      {payments
                        .reduce((sum, p) => sum + p.contractAmount, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {payments.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentList
