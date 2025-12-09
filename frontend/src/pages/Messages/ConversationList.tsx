import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getConversations, deleteConversation } from '../../services/messages'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/common/Pagination'
import ConfirmDialog from '../../components/common/ConfirmDialog'

interface EnrichedConversation {
  conversationId: string
  applicationId: string
  jobId: string
  jobTitle: string
  jobDescription?: string
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
  const { showSuccess, showError } = useToast()
  const [conversations, setConversations] = useState<EnrichedConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)

  // Pagination
  const { currentPage, totalPages, currentItems, goToPage } = usePagination({
    items: conversations,
    itemsPerPage: 20
  })

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

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setConversationToDelete(conversationId)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!conversationToDelete) return

    try {
      await deleteConversation(conversationToDelete)
      showSuccess('会話を削除しました')
      setConversations(conversations.filter(c => c.conversationId !== conversationToDelete))
      setDeleteConfirmOpen(false)
      setConversationToDelete(null)
    } catch (err: any) {
      showError(err.message || '会話の削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-20"></div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center py-20">
            <svg className="animate-spin h-12 w-12 mx-auto text-[#00E5FF]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-white mt-4">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  const unreadCount = user?.userType === 'engineer'
    ? conversations.reduce((sum, conv) => sum + conv.unreadCountEngineer, 0)
    : conversations.reduce((sum, conv) => sum + conv.unreadCountCompany, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#00E5FF]/10 rounded-full blur-3xl animate-cloud-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl animate-cloud-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10 flex-1">
        <div className="flex justify-between items-center mb-6 animate-slide-down">
          <div>
            <h1 className="text-3xl font-bold text-white font-mono">メッセージ</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-[#E8EEF7]/60 mt-1">未読: <span className="text-[#FF6B35] font-bold">{unreadCount}件</span></p>
            )}
          </div>
        </div>

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

        {conversations.length === 0 ? (
          <div className="glass-dark p-12 rounded-2xl border border-[#00E5FF]/20 shadow-2xl text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00E5FF]/10 mb-4">
              <svg className="w-8 h-8 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-[#E8EEF7]/60">メッセージはまだありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentItems.map((conversation, index) => {
              const isUnread = user?.userType === 'engineer'
                ? conversation.unreadCountEngineer > 0
                : conversation.unreadCountCompany > 0

              return (
                <div
                  key={conversation.conversationId}
                  className={`relative block glass-dark p-6 rounded-2xl border shadow-xl hover:shadow-2xl transition-all duration-300 card-hover animate-slide-up ${
                    isUnread ? 'border-[#FF6B35] ring-2 ring-[#FF6B35]/30' : 'border-[#00E5FF]/20'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Link to={`/messages/${conversation.conversationId}`} className="block">
                    <div className="flex flex-col gap-4">
                      {/* Top row: User info + timestamp + delete button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {conversation.otherUser?.avatar ? (
                            <img
                              src={conversation.otherUser.avatar}
                              alt={conversation.otherUser.displayName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-[#00E5FF]/30"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-[#2C4875]/30 border border-[#00E5FF]/20 flex items-center justify-center">
                              <span className="text-[#00E5FF] font-semibold text-lg">
                                {conversation.otherUser?.displayName?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-base text-white">
                              {conversation.otherUser?.displayName || '不明なユーザー'}
                            </h3>
                            <p className="text-xs text-[#E8EEF7]/40">
                              {new Date(conversation.lastMessageAt).toLocaleDateString()}
                              {' '}
                              {new Date(conversation.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isUnread && (
                            <span className="px-3 py-1 bg-[#FF6B35] text-white text-xs rounded-full font-bold">
                              新着
                            </span>
                          )}
                          <button
                            onClick={(e) => handleDeleteClick(e, conversation.conversationId)}
                            className="p-2 text-[#E8EEF7]/50 hover:text-[#FF6B35] hover:bg-[#FF6B35]/10 rounded-lg transition-all duration-300"
                            title="この会話を削除"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                    {/* Job info section - Large and prominent */}
                    <div className="pl-1 border-l-4 border-[#00E5FF]/40">
                      <div className="ml-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-[#00E5FF] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs font-bold text-[#00E5FF] uppercase tracking-wider">案件</span>
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2 leading-tight">
                          {conversation.jobTitle || '不明な案件'}
                        </h4>
                        {conversation.jobDescription && (
                          <p className="text-sm text-[#E8EEF7]/70 leading-relaxed line-clamp-2">
                            {conversation.jobDescription}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {conversations.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}
      </div>

      <ConfirmDialog
        title="会話を削除"
        message="この会話を削除してもよろしいですか？この操作は取り消せません。"
        confirmText="削除"
        cancelText="キャンセル"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false)
          setConversationToDelete(null)
        }}
        isOpen={deleteConfirmOpen}
      />
    </div>
  )
}

export default ConversationList
