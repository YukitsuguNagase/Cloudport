import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

const ADMIN_EMAIL = 'yukinag@dotqinc.com'

function AdminLogin() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if email is admin email
    if (email !== ADMIN_EMAIL) {
      showToast('管理者権限がありません', 'error')
      return
    }

    try {
      setLoading(true)
      await login(email, password)

      // Show warning if MFA is not enabled (will be checked in dashboard)
      showToast('ログインしました', 'success')
      navigate('/admin/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)

      // Handle MFA required error
      if (error.code === 'SOFTWARE_TOKEN_MFA_NOT_FOUND' || error.code === 'SMS_MFA') {
        showToast('MFAの設定が必要です。設定を完了してください。', 'warning')
      } else {
        showToast(error.message || 'ログインに失敗しました', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-2">
            <span className="gradient-text-cyan">Cloud</span>
            <span className="text-[#FF6B35]">Port</span>
          </h1>
          <p className="text-[#E8EEF7]/60 text-sm">管理者ログイン</p>
        </div>

        {/* Login Form */}
        <div className="glass-dark p-8 rounded-2xl border border-[#00E5FF]/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#E8EEF7] mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-[#0A1628] border border-[#00E5FF]/20 text-[#E8EEF7] placeholder-[#E8EEF7]/40 focus:outline-none focus:border-[#00E5FF] transition-colors"
                placeholder="admin@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#E8EEF7] mb-2">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-[#0A1628] border border-[#00E5FF]/20 text-[#E8EEF7] placeholder-[#E8EEF7]/40 focus:outline-none focus:border-[#00E5FF] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] text-[#0A1628] font-semibold hover:shadow-lg hover:shadow-[#00E5FF]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-lg">
            <p className="text-xs text-[#E8EEF7]/60 text-center">
              このページは管理者専用です。<br />
              不正アクセスは記録され、法的措置の対象となる場合があります。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
