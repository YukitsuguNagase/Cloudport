import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserType } from '../types/user'

function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<UserType>('engineer')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 利用規約への同意チェック
    if (!agreedToTerms) {
      setError('利用規約とプライバシーポリシーに同意してください')
      return
    }

    setLoading(true)

    try {
      await signup(email, password, userType)
      navigate('/verify-email', { state: { email, password } })
    } catch (err: any) {
      setError(err.message || 'サインアップに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      <div className="absolute top-10 right-10 w-80 h-80 bg-[#FF6B35]/10 rounded-full blur-3xl animate-cloud-float"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-3xl animate-cloud-float" style={{ animationDelay: '3s' }}></div>

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
          <h2 className="text-3xl font-bold text-white text-center mb-2">新規登録</h2>
          <p className="text-[#E8EEF7]/60 text-center mb-8 text-sm">アカウントを作成</p>

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
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-[#E8EEF7] mb-3">
                ユーザータイプ
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('engineer')}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${userType === 'engineer'
                      ? 'border-[#00E5FF] bg-[#00E5FF]/10'
                      : 'border-[#00E5FF]/20 bg-[#0A1628]/30 hover:border-[#00E5FF]/40'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className={`w-8 h-8 ${userType === 'engineer' ? 'text-[#00E5FF]' : 'text-[#E8EEF7]/60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span className={`font-semibold ${userType === 'engineer' ? 'text-[#00E5FF]' : 'text-[#E8EEF7]/80'}`}>技術者</span>
                  </div>
                  {userType === 'engineer' && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-5 h-5 text-[#00E5FF]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setUserType('company')}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${userType === 'company'
                      ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                      : 'border-[#FF6B35]/20 bg-[#0A1628]/30 hover:border-[#FF6B35]/40'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className={`w-8 h-8 ${userType === 'company' ? 'text-[#FF6B35]' : 'text-[#E8EEF7]/60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className={`font-semibold ${userType === 'company' ? 'text-[#FF6B35]' : 'text-[#E8EEF7]/80'}`}>企業</span>
                  </div>
                  {userType === 'company' && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-5 h-5 text-[#FF6B35]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </div>

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
              <p className="text-xs text-[#E8EEF7]/50 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                8文字以上、大文字・小文字・数字を含めてください
              </p>
            </div>

            <div className="border-t border-[#00E5FF]/10 pt-6">
              <label className="flex items-start cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 text-[#00E5FF] bg-[#0A1628]/50 border-[#00E5FF]/30 rounded focus:ring-2 focus:ring-[#00E5FF] transition-all duration-300"
                  />
                </div>
                <span className="ml-3 text-sm text-[#E8EEF7]/80 leading-relaxed">
                  <Link to="/terms" target="_blank" className="text-[#00E5FF] hover:text-[#5B8DEF] transition-colors duration-300 underline">
                    利用規約
                  </Link>
                  および
                  <Link to="/privacy" target="_blank" className="text-[#00E5FF] hover:text-[#5B8DEF] transition-colors duration-300 underline">
                    プライバシーポリシー
                  </Link>
                  に同意します <span className="text-[#FF6B35] font-bold">*</span>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  登録中...
                </span>
              ) : (
                '登録'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#00E5FF]/10">
            <p className="text-center text-[#E8EEF7]/60 text-sm">
              すでにアカウントをお持ちですか？{' '}
              <Link to="/login" className="text-[#FF6B35] hover:text-[#FF9F66] font-semibold transition-colors duration-300">
                ログイン
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

export default SignUp
