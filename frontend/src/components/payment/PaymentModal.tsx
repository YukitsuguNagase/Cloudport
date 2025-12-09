import { useState, useEffect, useRef } from 'react'

interface PaymentModalProps {
  isOpen: boolean
  amount: number
  contractId: string
  onClose: () => void
  onSuccess: (token: string) => void
  onError: (error: string) => void
}

declare global {
  interface Window {
    Payjp: any
    __payjpInstance?: any
    __payjpElements?: any
  }
}

// Global PAY.JP elements (shared across all instances)
let globalCardNumberElement: any = null
let globalCardExpiryElement: any = null
let globalCardCvcElement: any = null

function PaymentModal({ isOpen, amount, contractId: _contractId, onClose, onSuccess, onError }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [elementsReady, setElementsReady] = useState(false)
  const cardNumberRef = useRef<HTMLDivElement>(null)
  const cardExpiryRef = useRef<HTMLDivElement>(null)
  const cardCvcRef = useRef<HTMLDivElement>(null)
  const isMountedRef = useRef(false)

  // Initialize PAY.JP and mount elements when modal opens
  useEffect(() => {
    if (!isOpen) return

    const payjpPublicKey = import.meta.env.VITE_PAYJP_PUBLIC_KEY
    if (!payjpPublicKey) {
      console.error('PAY.JP public key not found')
      onError('決済システムの設定エラー')
      return
    }

    if (!window.Payjp) {
      console.error('window.Payjp is not available')
      onError('決済システムの読み込みエラー')
      return
    }

    // Use requestAnimationFrame to ensure DOM is fully ready
    const initializePayjp = () => {
      requestAnimationFrame(() => {
        if (!cardNumberRef.current || !cardExpiryRef.current || !cardCvcRef.current) {
          console.error('DOM elements not ready:', {
            cardNumber: !!cardNumberRef.current,
            cardExpiry: !!cardExpiryRef.current,
            cardCvc: !!cardCvcRef.current
          })
          // Retry after a short delay
          setTimeout(initializePayjp, 100)
          return
        }

        try {
          console.log('Initializing PAY.JP...')

          // Initialize PAY.JP only once (global singleton)
          if (!window.__payjpInstance) {
            console.log('Creating new PAY.JP instance...')
            window.__payjpInstance = window.Payjp(payjpPublicKey, {
              threeDSecureWorkflow: 'iframe'
            })
            window.__payjpElements = window.__payjpInstance.elements()

            // Style for elements
            const style = {
              base: {
                color: '#E8EEF7',
                fontSize: '16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                lineHeight: '1.5',
                '::placeholder': {
                  color: '#94A3B8'
                }
              },
              invalid: {
                color: '#FF6B35'
              },
              complete: {
                color: '#00E5FF'
              }
            }

            // Create elements only once
            console.log('Creating elements...')
            globalCardNumberElement = window.__payjpElements.create('cardNumber', { style })
            globalCardExpiryElement = window.__payjpElements.create('cardExpiry', { style })
            globalCardCvcElement = window.__payjpElements.create('cardCvc', { style })
          }

          // Mount elements to current DOM
          if (!isMountedRef.current) {
            console.log('Mounting elements...')
            const cardNumberId = 'payjp-card-number'
            const cardExpiryId = 'payjp-card-expiry'
            const cardCvcId = 'payjp-card-cvc'

            cardNumberRef.current.id = cardNumberId
            cardExpiryRef.current.id = cardExpiryId
            cardCvcRef.current.id = cardCvcId

            globalCardNumberElement.mount('#' + cardNumberId)
            globalCardExpiryElement.mount('#' + cardExpiryId)
            globalCardCvcElement.mount('#' + cardCvcId)

            isMountedRef.current = true
            console.log('PAY.JP elements mounted successfully')
          }

          setElementsReady(true)

        } catch (error) {
          console.error('PAY.JP initialization error:', error)
          onError('決済システムの初期化に失敗しました: ' + (error as Error).message)
        }
      })
    }

    initializePayjp()

    // Cleanup on close - unmount but keep elements for reuse
    return () => {
      if (isMountedRef.current && globalCardNumberElement) {
        try {
          console.log('Unmounting elements...')
          globalCardNumberElement.unmount()
          globalCardExpiryElement.unmount()
          globalCardCvcElement.unmount()
          isMountedRef.current = false
        } catch (error) {
          console.error('Error unmounting elements:', error)
        }
      }
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!window.__payjpInstance || !globalCardNumberElement) {
      onError('カード情報の入力に失敗しました')
      return
    }

    setLoading(true)

    try {
      const result = await window.__payjpInstance.createToken(globalCardNumberElement, {
        three_d_secure: true,
        card: {
          name: 'Test User',
          email: 'test@example.com'
        }
      })

      if (result.error) {
        onError(result.error.message || 'カード情報の検証に失敗しました')
        setLoading(false)
        return
      }

      if (result.id) {
        onSuccess(result.id)
      }
    } catch (err: any) {
      console.error('Token creation error:', err)
      onError(err.message || 'カード情報の処理中にエラーが発生しました')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative glass-dark rounded-2xl border border-[#00E5FF]/20 shadow-2xl max-w-md w-full p-8 animate-scale-in">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#E8EEF7]/60 hover:text-[#E8EEF7] transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">カード情報入力</h2>
            <p className="text-[#E8EEF7]/60 text-sm">プラットフォーム手数料のお支払い</p>
          </div>

          {/* Amount */}
          <div className="bg-[#0A1628]/50 border border-[#00E5FF]/10 p-4 rounded-lg mb-6">
            <div className="text-[#E8EEF7]/60 text-sm mb-1">お支払い金額</div>
            <div className="text-3xl font-bold text-[#00E5FF]">
              ¥{amount.toLocaleString()}
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-[#E8EEF7] text-sm font-medium mb-2">
                カード番号
              </label>
              <div
                ref={cardNumberRef}
                className="bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg px-4 py-3 focus-within:border-[#00E5FF] transition-colors min-h-[44px]"
              ></div>
            </div>

            {/* Expiry and CVC */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#E8EEF7] text-sm font-medium mb-2">
                  有効期限
                </label>
                <div
                  ref={cardExpiryRef}
                  className="bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg px-4 py-3 focus-within:border-[#00E5FF] transition-colors min-h-[44px]"
                ></div>
              </div>

              <div>
                <label className="block text-[#E8EEF7] text-sm font-medium mb-2">
                  CVC
                </label>
                <div
                  ref={cardCvcRef}
                  className="bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg px-4 py-3 focus-within:border-[#00E5FF] transition-colors min-h-[44px]"
                ></div>
              </div>
            </div>

            {/* Test Card Info */}
            <div className="bg-[#5B8DEF]/10 border border-[#5B8DEF]/30 p-3 rounded-lg">
              <p className="text-[#5B8DEF] text-xs font-semibold mb-1">テストカード情報</p>
              <p className="text-[#E8EEF7]/80 text-xs">
                カード番号: 4242 4242 4242 4242<br />
                有効期限: 任意の未来の日付<br />
                CVC: 任意の3桁
              </p>
            </div>

            {/* 3D Secure Notice */}
            <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 p-3 rounded-lg">
              <p className="text-[#00E5FF] text-xs font-semibold mb-1">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                3Dセキュア対応
              </p>
              <p className="text-[#E8EEF7]/80 text-xs">
                カード会社による本人認証が行われる場合があります
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !elementsReady}
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C5A] text-white py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-[#FF6B35]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  処理中...
                </span>
              ) : !elementsReady ? (
                '読み込み中...'
              ) : (
                `¥${amount.toLocaleString()} を支払う`
              )}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full bg-transparent border border-[#E8EEF7]/20 text-[#E8EEF7] py-3 px-4 rounded-lg hover:bg-[#E8EEF7]/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-4 flex items-center justify-center text-[#E8EEF7]/40 text-xs">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            PAY.JPの安全な決済システムを使用しています
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
