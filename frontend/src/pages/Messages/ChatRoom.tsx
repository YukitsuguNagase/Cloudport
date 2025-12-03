import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getConversation, getMessages, sendMessage, markAsRead } from '../../services/messages'
import { Message, Conversation } from '../../types/message'
import { createContract, getContracts } from '../../services/contracts'
import { Contract } from '../../types/contract'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { validateChatMessage, sanitizeInput } from '../../utils/validation'

function ChatRoom() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { user } = useAuth()
  const { showSuccess, showError, showWarning } = useToast()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [showContractForm, setShowContractForm] = useState(false)
  const [contractAmount, setContractAmount] = useState('')
  const [creatingContract, setCreatingContract] = useState(false)
  const [existingContract, setExistingContract] = useState<Contract | null>(null)
  const [showContractConfirm, setShowContractConfirm] = useState(false)
  const [pendingContractAmount, setPendingContractAmount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conversationId) {
      fetchConversationDetails()
      fetchMessages()
      checkExistingContract()
      // Mark messages as read when entering the chat room
      markAsRead(conversationId).catch(console.error)
    }
  }, [conversationId])

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversationDetails = async () => {
    try {
      const data = await getConversation(conversationId!)
      setConversation(data)
    } catch (err: any) {
      console.error('Failed to fetch conversation details:', err)
      // Don't set error for this, as messages will still work
    }
  }

  const fetchMessages = async () => {
    try {
      const data = await getMessages(conversationId!)
      setMessages(data)
    } catch (err: any) {
      setError(err.message || 'メッセージの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const checkExistingContract = async () => {
    try {
      const contracts = await getContracts()
      const conversation = await getConversation(conversationId!)

      if (conversation.applicationId) {
        const contract = contracts.find(c => c.applicationId === conversation.applicationId)
        setExistingContract(contract || null)
      }
    } catch (err) {
      console.error('Failed to check existing contract:', err)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (sending) {
      return
    }

    // Validate message
    const validation = validateChatMessage(newMessage)
    if (!validation.isValid) {
      showError(validation.error!)
      return
    }

    try {
      setSending(true)
      const message = await sendMessage(conversationId!, { content: sanitizeInput(newMessage) })
      setMessages([...messages, message])
      setNewMessage('')
    } catch (err: any) {
      showError(err.message || 'メッセージの送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!conversation?.applicationId) {
      showWarning('オファー申請に必要な情報が不足しています')
      return
    }

    const amount = parseInt(contractAmount)

    if (isNaN(amount) || amount <= 0) {
      showWarning('有効なオファー金額を入力してください')
      return
    }

    setPendingContractAmount(amount)
    setShowContractConfirm(true)
  }

  const confirmCreateContract = async () => {
    const amount = pendingContractAmount

    try {
      setCreatingContract(true)
      const contract = await createContract({
        applicationId: conversation!.applicationId!,
        contractAmount: amount,
      })
      setExistingContract(contract)

      // Send automatic notification message (visible to both parties)
      try {
        const notificationMessage = await sendMessage(conversationId!, {
          content: `📋 オファー申請を受け取りました\n\n契約金額: ¥${amount.toLocaleString()}\n\n内容をご確認の上、承認をお願いいたします。`,
        })
        setMessages([...messages, notificationMessage])
      } catch (msgErr) {
        console.error('Failed to send auto message:', msgErr)
        // Continue even if auto message fails
      }

      showSuccess('オファー申請を送信しました。相手の承認をお待ちください。')
      setShowContractForm(false)
      setContractAmount('')
      setShowContractConfirm(false)
    } catch (err: any) {
      showError(err.message || 'オファー申請に失敗しました')
    } finally {
      setCreatingContract(false)
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

      <div className="container mx-auto px-4 py-4 relative z-10">
        <Link to="/messages" className="text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300 font-medium inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          メッセージ一覧に戻る
        </Link>
      </div>

      {error && (
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] p-4 rounded-lg mb-4 animate-slide-down">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        </div>
      )}

      {conversation?.isJobDeleted && (
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-[#FF6B35]/10 border-l-4 border-[#FF6B35] p-4 rounded-lg mb-4 animate-slide-down">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-[#FF6B35]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#FF6B35]">
                  <span className="font-bold">この案件は削除されました。</span><br />
                  これまでのメッセージ履歴は閲覧できますが、新しいメッセージの送信やオファー申請はできません。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 container mx-auto px-4 pb-4 flex flex-col relative z-10" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="glass-dark rounded-2xl border border-[#00E5FF]/20 shadow-2xl flex flex-col flex-1 overflow-hidden animate-slide-up">
          {/* Conversation header */}
          {conversation && (
            <div className="border-b border-[#00E5FF]/20 p-4 bg-[#0A1628]/30">
              <div className="flex items-center gap-3">
                {conversation.otherUser?.avatar && (
                  <img
                    src={conversation.otherUser.avatar}
                    alt={conversation.otherUser.displayName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#00E5FF]/30"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white">
                    {conversation.otherUser?.displayName || '相手のユーザー'}
                  </h2>
                  <div className="text-sm text-[#E8EEF7]/60">
                    案件: {conversation.isJobDeleted ? (
                      <span>
                        {conversation.jobTitle || '不明'}
                        <span className="ml-2 text-[#FF6B35] font-semibold">(削除済み)</span>
                      </span>
                    ) : (
                      <Link
                        to={`/jobs/${conversation.jobId}?from=messages&conversationId=${conversationId}`}
                        className="text-[#00E5FF] hover:text-[#5B8DEF] hover:underline transition-colors duration-300"
                      >
                        {conversation.jobTitle || '不明'}
                      </Link>
                    )}
                  </div>
                </div>
                {user?.userType === 'company' && !existingContract && !conversation.isJobDeleted && (
                  <button
                    onClick={() => setShowContractForm(!showContractForm)}
                    className="bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all duration-300 text-sm font-semibold"
                  >
                    {showContractForm ? 'キャンセル' : 'オファー申請'}
                  </button>
                )}
                {existingContract && (
                  <div className="text-sm">
                    <Link
                      to="/contracts"
                      className="px-4 py-2 bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 rounded-lg hover:bg-[#00E5FF]/30 transition-all duration-300 inline-flex items-center gap-2 font-semibold"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      オファー申請済み
                    </Link>
                  </div>
                )}
              </div>

              {/* Contract form */}
              {user?.userType === 'company' && !existingContract && !conversation.isJobDeleted && showContractForm && (
                <form onSubmit={handleCreateContract} className="mt-4 p-4 bg-[#0A1628]/50 rounded-lg border border-[#00E5FF]/30">
                  <h3 className="text-md font-bold text-white mb-3">オファー申請フォーム</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      オファー金額 (円)
                    </label>
                    <input
                      type="number"
                      value={contractAmount}
                      onChange={(e) => setContractAmount(e.target.value)}
                      placeholder="例: 500000"
                      className="w-full border border-[#00E5FF]/20 bg-[#0A1628]/50 text-white placeholder-[#E8EEF7]/40 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] transition-all duration-300"
                      required
                    />
                  </div>
                  {contractAmount && (
                    <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 p-3 rounded-lg mb-4">
                      <p className="text-sm text-[#E8EEF7] mb-2">
                        プラットフォーム手数料 (10%): <span className="font-bold text-[#FF6B35]">
                          ¥{Math.round((parseInt(contractAmount) || 0) * 10 / 100).toLocaleString()}
                        </span>
                      </p>
                      <p className="text-xs text-[#E8EEF7]/60">
                        ※技術者への契約金額のお支払いは、企業と技術者で直接行ってください
                      </p>
                      <p className="text-xs text-[#E8EEF7]/60 mt-1">
                        ※プラットフォーム手数料のみ、オファー成立時に企業からプラットフォームへお支払いいただきます
                      </p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={creatingContract}
                    className="w-full bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {creatingContract ? '申請中...' : 'オファー申請を送信'}
                  </button>
                </form>
              )}
            </div>
          )}
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0A1628]/20">
            {messages.length === 0 ? (
              <div className="text-center py-20 text-[#E8EEF7]/60">
                <p className="text-sm">まだメッセージがありません。最初のメッセージを送ってみましょう。</p>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isMyMessage = message.senderId === user?.userId

                  return (
                    <div
                      key={message.messageId}
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} animate-slide-up`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-3 ${
                          isMyMessage
                            ? 'bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white'
                            : 'bg-[#E8EEF7]/10 border border-[#E8EEF7]/20 text-[#E8EEF7]'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            isMyMessage ? 'text-white/70' : 'text-[#E8EEF7]/50'
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message input */}
          <div className="border-t border-[#00E5FF]/20 p-4 bg-[#0A1628]/30">
            {conversation?.isJobDeleted ? (
              <div className="text-center py-4 text-[#E8EEF7]/60">
                <p className="text-sm">案件が削除されたため、メッセージの送信はできません。</p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                  placeholder="メッセージを入力... (Shift+Enterで改行)"
                  className="flex-1 border border-[#00E5FF]/20 bg-[#0A1628]/50 text-white placeholder-[#E8EEF7]/40 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] resize-none transition-all duration-300"
                  rows={3}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed self-end font-semibold"
                >
                  {sending ? '送信中...' : '送信'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        title="オファー申請の確認"
        message={`契約金額: ¥${pendingContractAmount.toLocaleString()}\n（技術者へ直接お支払いください）\n\nプラットフォーム手数料 (10%): ¥${Math.round(pendingContractAmount * 0.1).toLocaleString()}\n（プラットフォームへお支払いいただきます）\n\nこの内容でオファー申請を行いますか？`}
        confirmText="申請する"
        cancelText="キャンセル"
        onConfirm={confirmCreateContract}
        onCancel={() => setShowContractConfirm(false)}
        isOpen={showContractConfirm}
      />
    </div>
  )
}

export default ChatRoom
