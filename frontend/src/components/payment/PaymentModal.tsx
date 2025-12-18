import { useState } from 'react'
import { useToast } from '../../contexts/ToastContext'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  contractAmount: number
  feeAmount: number
  feePercentage: number
  contractId: string
  jobTitle: string
}

function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  contractAmount,
  feeAmount,
  feePercentage,
  contractId,
  jobTitle,
}: PaymentModalProps) {
  const { showToast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [paymentNote, setPaymentNote] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paymentMethod) {
      showToast('支払い方法を選択してください', 'error')
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/contracts/${contractId}/payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('idToken')}`,
          },
          body: JSON.stringify({
            paymentInfo: {
              method: paymentMethod,
              note: paymentNote,
            },
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '支払い処理に失敗しました')
      }

      showToast('支払い情報を記録しました', 'success')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Payment error:', error)
      showToast(error.message || '支払い処理に失敗しました', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-dark rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#00E5FF]/20">
        {/* Header */}
        <div className="p-6 border-b border-[#00E5FF]/20">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold gradient-text mb-2">手数料支払い</h2>
              <p className="text-[#E8EEF7]/60 text-sm">{jobTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#E8EEF7]/60 hover:text-white transition-colors"
              disabled={isProcessing}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Payment Summary */}
          <div className="glass-dark p-6 rounded-xl mb-6 border border-[#00E5FF]/10">
            <h3 className="text-lg font-semibold mb-4 text-white">支払い金額</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#E8EEF7]/60">契約金額</span>
                <span className="text-white font-semibold">
                  ¥{contractAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#E8EEF7]/60">
                  プラットフォーム手数料 ({feePercentage}%)
                </span>
                <span className="text-[#00E5FF] font-bold text-xl">
                  ¥{feeAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">支払い方法</label>
            <div className="space-y-3">
              <label className="flex items-center p-4 glass-dark rounded-lg border border-[#00E5FF]/20 cursor-pointer hover:border-[#00E5FF]/40 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="text-white font-medium">銀行振込</div>
                  <div className="text-[#E8EEF7]/60 text-sm">
                    指定口座への振込
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 glass-dark rounded-lg border border-[#00E5FF]/20 cursor-pointer hover:border-[#00E5FF]/40 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={paymentMethod === 'credit_card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="text-white font-medium">クレジットカード</div>
                  <div className="text-[#E8EEF7]/60 text-sm">
                    別途ご案内する方法での決済
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 glass-dark rounded-lg border border-[#00E5FF]/20 cursor-pointer hover:border-[#00E5FF]/40 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="other"
                  checked={paymentMethod === 'other'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="text-white font-medium">その他</div>
                  <div className="text-[#E8EEF7]/60 text-sm">
                    請求書払い等
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Note */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">備考（任意）</label>
            <textarea
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="支払いに関するメモがあれば記入してください"
              className="w-full px-4 py-3 bg-[#0A1628] border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:outline-none focus:border-[#00E5FF] resize-none"
              rows={3}
            />
          </div>

          {/* Important Notice */}
          <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-[#FF6B35] mr-3 flex-shrink-0 mt-0.5"
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
              <div className="text-sm text-[#E8EEF7]/80">
                <p className="font-semibold text-[#FF6B35] mb-1">重要なお知らせ</p>
                <p>
                  支払い方法を選択後、別途運営から支払いに関する詳細をご連絡いたします。
                  技術者への契約金額（¥{contractAmount.toLocaleString()}）は直接お支払いください。
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 rounded-lg border border-[#E8EEF7]/20 text-white hover:bg-[#E8EEF7]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  処理中...
                </span>
              ) : (
                '支払い情報を記録'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentModal
