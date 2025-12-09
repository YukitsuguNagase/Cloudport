import { useState } from 'react'

interface RefundModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
  contractId: string
  contractAmount: number
  feeAmount: number
}

function RefundModal({ isOpen, onClose, onConfirm, contractId, contractAmount, feeAmount }: RefundModalProps) {
  const [reason, setReason] = useState('')
  const [processing, setProcessing] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setProcessing(true)
    try {
      await onConfirm(reason)
      setReason('')
      onClose()
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    if (!processing) {
      setReason('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-dark p-6 rounded-2xl border border-[#00E5FF]/20 max-w-md w-full">
        <h2 className="text-2xl font-bold gradient-text mb-4">返金処理</h2>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-sm font-semibold mb-2">⚠️ 重要な注意事項</p>
            <p className="text-[#E8EEF7]/80 text-sm">
              この操作は取り消すことができません。返金を実行すると、以下の処理が行われます：
            </p>
            <ul className="list-disc list-inside text-[#E8EEF7]/80 text-sm mt-2 ml-2">
              <li>プラットフォーム手数料の返金</li>
              <li>契約ステータスの変更</li>
              <li>ユーザーへの通知送信</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#E8EEF7]/60">契約ID:</span>
              <span className="text-[#E8EEF7] font-mono">{contractId.substring(0, 16)}...</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#E8EEF7]/60">契約金額:</span>
              <span className="text-[#E8EEF7]">¥{contractAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[#00E5FF]/20 pt-2">
              <span className="text-[#E8EEF7]/60">返金金額（手数料）:</span>
              <span className="text-red-400 font-semibold">¥{feeAmount.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-[#E8EEF7] mb-2">
              返金理由（任意）
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={processing}
              className="w-full px-4 py-3 rounded-lg bg-[#0A1628] border border-[#00E5FF]/20 text-[#E8EEF7] placeholder-[#E8EEF7]/40 focus:outline-none focus:border-[#00E5FF] transition-colors resize-none"
              rows={3}
              placeholder="返金理由を入力してください（任意）"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={processing}
            className="flex-1 px-4 py-3 rounded-lg bg-[#1A2942] text-[#E8EEF7] hover:bg-[#2C4875] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {processing ? '処理中...' : '返金を実行'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RefundModal
