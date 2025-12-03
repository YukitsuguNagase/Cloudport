import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import { sendScout } from '../../services/scouts'
import { getMyJobs } from '../../services/jobs'
import { EngineerSearchResult } from '../../types/scout'
import { Job } from '../../types/job'
import LoadingSpinner from '../common/LoadingSpinner'

interface ScoutModalProps {
  isOpen: boolean
  onClose: () => void
  engineer: EngineerSearchResult
  onSuccess: () => void
}

function ScoutModal({ isOpen, onClose, engineer, onSuccess }: ScoutModalProps) {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchMyJobs()
    }
  }, [isOpen])

  const fetchMyJobs = async () => {
    try {
      setLoadingJobs(true)
      const jobs = await getMyJobs()
      // 募集中の案件のみ
      const openJobs = jobs.filter(job => job.status === 'open')
      setMyJobs(openJobs)
      if (openJobs.length > 0) {
        setSelectedJobId(openJobs[0].jobId)
      }
    } catch (err: any) {
      console.error('Failed to fetch jobs:', err)
      showError('案件の取得に失敗しました')
    } finally {
      setLoadingJobs(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedJobId) {
      showError('案件を選択してください')
      return
    }

    if (message.trim().length < 10) {
      showError('メッセージは10文字以上入力してください')
      return
    }

    setLoading(true)

    try {
      const scout = await sendScout({
        jobId: selectedJobId,
        engineerId: engineer.userId,
        message: message.trim()
      })

      showSuccess('スカウトを送信しました')
      onSuccess()

      // メッセージページに遷移
      navigate(`/messages/${scout.conversationId}`)
    } catch (err: any) {
      console.error('Failed to send scout:', err)
      showError(err.response?.data?.message || 'スカウトの送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">スカウトを送信</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
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

          {/* エンジニア情報 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                {engineer.avatar ? (
                  <img
                    src={engineer.avatar}
                    alt={engineer.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl text-gray-500">
                    {engineer.displayName.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">{engineer.displayName}</h3>
                {engineer.preferredLocation && (
                  <p className="text-sm text-gray-600">{engineer.preferredLocation}</p>
                )}
              </div>
            </div>
          </div>

          {loadingJobs ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : myJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">募集中の案件がありません</p>
              <button
                onClick={onClose}
                className="text-primary-600 hover:underline"
              >
                閉じる
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 案件選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  案件を選択 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {myJobs.map(job => (
                    <option key={job.jobId} value={job.jobId}>
                      {job.title}
                    </option>
                  ))}
                </select>
                {selectedJobId && (
                  <p className="mt-2 text-sm text-gray-500">
                    選択した案件の情報がスカウトメッセージと共に送信されます
                  </p>
                )}
              </div>

              {/* メッセージ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メッセージ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={`${engineer.displayName}さんへのスカウトメッセージを入力してください。\n\n例:\n${engineer.displayName}さん、はじめまして。\n貴殿のプロフィールを拝見し、ぜひ弊社のプロジェクトにご参画いただきたくスカウトさせていただきました。\n\n選択した案件の詳細をご確認いただき、ご興味をお持ちいただけましたらぜひお話しさせてください。`}
                />
                <p className="mt-1 text-sm text-gray-500">
                  10文字以上で入力してください（現在: {message.length}文字）
                </p>
              </div>

              {/* ボタン */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {loading ? '送信中...' : 'スカウトを送信'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScoutModal
