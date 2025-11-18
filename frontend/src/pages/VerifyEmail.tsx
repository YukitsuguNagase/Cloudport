import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import * as authService from '../services/auth'

function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.confirmSignUp(email, code)
      navigate('/login', {
        state: { message: 'メールアドレスの確認が完了しました。ログインしてください。' }
      })
    } catch (err: any) {
      setError(err.message || '確認コードが無効です')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setResendMessage('')

    try {
      await authService.resendConfirmationCode(email)
      setResendMessage('確認コードを再送信しました。メールをご確認ください。')
    } catch (err: any) {
      setError(err.message || '確認コードの再送信に失敗しました')
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-red-600 mb-4">メールアドレスが見つかりません</p>
            <button
              onClick={() => navigate('/signup')}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
            >
              会員登録に戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            メールアドレスの確認
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {email} に確認コードを送信しました
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {resendMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {resendMessage}
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                確認コード
              </label>
              <input
                id="code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? '確認中...' : '確認する'}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={handleResendCode}
              className="w-full text-sm text-primary-600 hover:text-primary-700"
            >
              確認コードを再送信する
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
