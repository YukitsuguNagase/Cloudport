import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const location = useLocation()
  const successMessage = location.state?.message
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/jobs')
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました')
    } finally {
      setLoading(false)
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
          <h2 className="text-3xl font-bold text-white text-center mb-2">ログイン</h2>
          <p className="text-[#E8EEF7]/60 text-center mb-8 text-sm">アカウントにアクセス</p>

          {successMessage && (
            <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] p-4 rounded-lg mb-6 animate-slide-down">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {successMessage}
              </div>
            </div>
          )}

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
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E8EEF7] mb-2">
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#00E5FF]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ログイン中...
                  </span>
                ) : (
                  'ログイン'
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-[#00E5FF] hover:text-[#5B8DEF] transition-colors duration-300"
            >
              パスワードをお忘れの方
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-[#00E5FF]/10">
            <p className="text-center text-[#E8EEF7]/60 text-sm">
              アカウントをお持ちでないですか？{' '}
              <Link to="/signup" className="text-[#FF6B35] hover:text-[#FF9F66] font-semibold transition-colors duration-300">
                新規登録
              </Link>
            </p>
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

export default Login
