import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { confirmPassword, forgotPassword } from '../services/auth'
import { useToast } from '../contexts/ToastContext'

function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showSuccess, showError } = useToast()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    // Get email from navigation state
    const stateEmail = location.state?.email
    if (stateEmail) {
      setEmail(stateEmail)
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      showError('メールアドレスを入力してください')
      return
    }

    if (!code.trim()) {
      showError('確認コードを入力してください')
      return
    }

    if (!newPassword.trim()) {
      showError('新しいパスワードを入力してください')
      return
    }

    if (newPassword !== confirmNewPassword) {
      showError('パスワードが一致しません')
      return
    }

    if (newPassword.length < 8) {
      showError('パスワードは8文字以上で入力してください')
      return
    }

    try {
      setLoading(true)
      await confirmPassword(email, code, newPassword)
      showSuccess('パスワードをリセットしました')
      navigate('/login')
    } catch (err: any) {
      console.error('Reset password error:', err)
      if (err.code === 'CodeMismatchException') {
        showError('確認コードが正しくありません')
      } else if (err.code === 'ExpiredCodeException') {
        showError('確認コードの有効期限が切れています。再送信してください')
      } else if (err.code === 'InvalidPasswordException') {
        showError('パスワードは8文字以上で、大文字、小文字、数字を含む必要があります')
      } else {
        showError(err.message || 'パスワードのリセットに失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email.trim()) {
      showError('メールアドレスを入力してください')
      return
    }

    try {
      setResending(true)
      await forgotPassword(email)
      showSuccess('確認コードを再送信しました')
    } catch (err: any) {
      console.error('Resend code error:', err)
      showError(err.message || '確認コードの再送信に失敗しました')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#00E5FF]/10 rounded-full blur-3xl animate-cloud-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl animate-cloud-float" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-md w-full relative z-10 animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold font-mono">
              <span className="gradient-text-cyan">Cloud</span>
              <span className="text-[#FF6B35]">Port</span>
            </h1>
          </Link>
        </div>

        <div className="glass-dark p-8 rounded-2xl border border-[#00E5FF]/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00E5FF]/10 mb-4">
              <svg className="w-8 h-8 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              新しいパスワードの設定
            </h2>
            <p className="text-[#E8EEF7]/60 text-sm">
              メールで送信された確認コードと新しいパスワードを入力してください
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#E8EEF7] mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#00E5FF]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E8EEF7] mb-2">
                確認コード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#00E5FF]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white font-mono text-center text-lg tracking-widest placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-[#E8EEF7]/50 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                メールで送信された6桁のコードを入力してください
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E8EEF7] mb-2">
                新しいパスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#00E5FF]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-[#E8EEF7]/50 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                8文字以上で、大文字、小文字、数字を含む必要があります
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E8EEF7] mb-2">
                新しいパスワード（確認）
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#00E5FF]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  リセット中...
                </span>
              ) : (
                'パスワードをリセット'
              )}
            </button>
          </form>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="w-full text-center text-sm text-[#00E5FF] hover:text-[#5B8DEF] disabled:text-[#E8EEF7]/40 transition-colors duration-300"
            >
              {resending ? '送信中...' : '確認コードを再送信'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-[#00E5FF]/10">
            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-[#00E5FF] hover:text-[#5B8DEF] transition-colors duration-300"
              >
                ログインページに戻る
              </Link>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-[#E8EEF7]/60 hover:text-[#00E5FF] text-sm transition-colors duration-300 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
