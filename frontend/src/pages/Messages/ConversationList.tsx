import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getConversations } from '../../services/messages'
import { useAuth } from '../../contexts/AuthContext'

interface EnrichedConversation {
  conversationId: string
  applicationId: string
  jobId: string
  jobTitle: string
  engineerId: string
  companyId: string
  lastMessageAt: string
  unreadCountEngineer: number
  unreadCountCompany: number
  otherUser: {
    userId: string
    displayName: string
    avatar?: string
  } | null
}

function ConversationList() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<EnrichedConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const data = await getConversations()
      setConversations(data as EnrichedConversation[])
    } catch (err: any) {
      setError(err.message || 'メッセージ一覧の取得に失敗しました')
    } finally {
      setLoading(false)
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

  const unreadCount = user?.userType === 'engineer'
    ? conversations.reduce((sum, conv) => sum + conv.unreadCountEngineer, 0)
    : conversations.reduce((sum, conv) => sum + conv.unreadCountCompany, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">メッセージ</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">未読: {unreadCount}件</p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            メッセージはまだありません
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => {
              const isUnread = user?.userType === 'engineer'
                ? conversation.unreadCountEngineer > 0
                : conversation.unreadCountCompany > 0

              return (
                <Link
                  key={conversation.conversationId}
                  to={`/messages/${conversation.conversationId}`}
                  className={`block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition ${
                    isUnread ? 'border-l-4 border-primary-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {conversation.otherUser?.avatar && (
                      <img
                        src={conversation.otherUser.avatar}
                        alt={conversation.otherUser.displayName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    {!conversation.otherUser?.avatar && (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">
                          {conversation.otherUser?.displayName?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">
                            {conversation.otherUser?.displayName || '不明なユーザー'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            案件: {conversation.jobTitle || '不明'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(conversation.lastMessageAt).toLocaleDateString()}
                            {' '}
                            {new Date(conversation.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {isUnread && (
                            <span className="inline-block mt-1 px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                              新着
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationList
