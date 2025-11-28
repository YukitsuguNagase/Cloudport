import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getConversation, getMessages, sendMessage, markAsRead } from '../../services/messages'
import { Message, Conversation } from '../../types/message'
import { createContract, getContracts } from '../../services/contracts'
import { Contract } from '../../types/contract'
import { useAuth } from '../../contexts/AuthContext'

function ChatRoom() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
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

    if (!newMessage.trim() || sending) {
      return
    }

    try {
      setSending(true)
      const message = await sendMessage(conversationId!, { content: newMessage.trim() })
      setMessages([...messages, message])
      setNewMessage('')
    } catch (err: any) {
      alert(err.message || 'メッセージの送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!conversation?.applicationId) {
      alert('契約申請に必要な情報が不足しています')
      return
    }

    const amount = parseInt(contractAmount)

    if (isNaN(amount) || amount <= 0) {
      alert('有効な契約金額を入力してください')
      return
    }

    const feePercentage = 10 // 標準手数料率 10%
    const feeAmount = Math.round(amount * feePercentage / 100)

    if (!confirm(`契約金額: ¥${amount.toLocaleString()}\n手数料 (${feePercentage}%): ¥${feeAmount.toLocaleString()}\n\nこの内容で契約申請を行いますか？`)) {
      return
    }

    try {
      setCreatingContract(true)
      const contract = await createContract({
        applicationId: conversation.applicationId,
        contractAmount: amount,
      })
      setExistingContract(contract)
      alert('契約申請を送信しました。相手の承認をお待ちください。')
      setShowContractForm(false)
      setContractAmount('')
    } catch (err: any) {
      alert(err.message || '契約申請に失敗しました')
    } finally {
      setCreatingContract(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-4">
        <Link to="/messages" className="text-primary-600 hover:underline">
          ← メッセージ一覧に戻る
        </Link>
      </div>

      {error && (
        <div className="container mx-auto px-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        </div>
      )}

      <div className="flex-1 container mx-auto px-4 pb-4 flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="bg-white rounded-lg shadow-md flex flex-col flex-1 overflow-hidden">
          {/* Conversation header */}
          {conversation && (
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                {conversation.otherUser?.avatar && (
                  <img
                    src={conversation.otherUser.avatar}
                    alt={conversation.otherUser.displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900">
                    {conversation.otherUser?.displayName || '相手のユーザー'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    案件: {conversation.jobTitle || '不明'}
                  </p>
                </div>
                {user?.userType === 'company' && !existingContract && (
                  <button
                    onClick={() => setShowContractForm(!showContractForm)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm"
                  >
                    {showContractForm ? 'キャンセル' : '契約申請'}
                  </button>
                )}
                {existingContract && (
                  <div className="text-sm">
                    <Link
                      to="/contracts"
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition inline-flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      契約申請済み
                    </Link>
                  </div>
                )}
              </div>

              {/* Contract form */}
              {user?.userType === 'company' && !existingContract && showContractForm && (
                <form onSubmit={handleCreateContract} className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <h3 className="text-md font-bold mb-3">契約申請フォーム</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      契約金額 (円)
                    </label>
                    <input
                      type="number"
                      value={contractAmount}
                      onChange={(e) => setContractAmount(e.target.value)}
                      placeholder="例: 500000"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  {contractAmount && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-600">
                        手数料 (10%): <span className="font-bold text-red-600">
                          ¥{Math.round((parseInt(contractAmount) || 0) * 10 / 100).toLocaleString()}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ※契約成立時に企業側にプラットフォーム手数料として請求されます
                      </p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={creatingContract}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {creatingContract ? '申請中...' : '契約申請を送信'}
                  </button>
                </form>
              )}
            </div>
          )}
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                まだメッセージがありません。最初のメッセージを送ってみましょう。
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isMyMessage = message.senderId === user?.userId

                  return (
                    <div
                      key={message.messageId}
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isMyMessage
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isMyMessage ? 'text-primary-100' : 'text-gray-500'
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
          <div className="border-t border-gray-200 p-4">
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
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={3}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed self-end"
              >
                {sending ? '送信中...' : '送信'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatRoom
