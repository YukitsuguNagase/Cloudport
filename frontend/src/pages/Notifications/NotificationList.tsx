import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { getNotifications, markAsRead } from '../../services/notifications'
import { Notification } from '../../types/notification'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/common/Pagination'

function NotificationList() {
  const { getIdToken } = useAuth()
  const { showError } = useToast()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  // Pagination
  const { currentPage, totalPages, currentItems, goToPage } = usePagination({
    items: notifications,
    itemsPerPage: 20
  })

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const idToken = await getIdToken()
      const data = await getNotifications(idToken)
      setNotifications(data)
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err)
      showError(err.message || '通知の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read if not already read
      if (!notification.isRead) {
        const idToken = await getIdToken()
        await markAsRead(idToken, notification.notificationId)

        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.notificationId === notification.notificationId
              ? { ...n, isRead: true }
              : n
          )
        )
      }

      // Navigate to the related page if link exists
      if (notification.link) {
        navigate(notification.link)
      }
    } catch (err: any) {
      console.error('Failed to mark as read:', err)
      showError(err.message || '通知の既読設定に失敗しました')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_application':
        return (
          <svg className="w-6 h-6 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'new_message':
        return (
          <svg className="w-6 h-6 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )
      case 'contract_request':
        return (
          <svg className="w-6 h-6 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'contract_approved':
        return (
          <svg className="w-6 h-6 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6 text-[#E8EEF7]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return `${diffInMinutes}分前`
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) {
        return `${diffInDays}日前`
      } else {
        return date.toLocaleDateString('ja-JP')
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#00E5FF]/10 rounded-full blur-3xl animate-cloud-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl animate-cloud-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10 flex-1">
        <h1 className="text-3xl font-bold text-white mb-8 font-mono animate-slide-down">通知</h1>

        {notifications.length === 0 ? (
          <div className="glass-dark p-12 rounded-2xl border border-[#00E5FF]/20 shadow-2xl text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00E5FF]/10 mb-4">
              <svg className="w-8 h-8 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-[#E8EEF7]/60">通知はありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentItems.map((notification, index) => (
              <div
                key={notification.notificationId}
                onClick={() => handleNotificationClick(notification)}
                className={`glass-dark rounded-2xl shadow-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-2xl card-hover animate-slide-up ${
                  notification.isRead
                    ? 'border border-[#00E5FF]/20 opacity-70'
                    : 'border-l-4 border-l-[#FF6B35] border border-[#00E5FF]/20 ring-2 ring-[#FF6B35]/30'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-[#0A1628]/30 border border-[#00E5FF]/20 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className={`text-base font-semibold ${notification.isRead ? 'text-[#E8EEF7]/80' : 'text-white'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-sm text-[#E8EEF7]/50 whitespace-nowrap">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm ${notification.isRead ? 'text-[#E8EEF7]/60' : 'text-[#E8EEF7]/80'}`}>
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0 mt-2">
                      <div className="w-2 h-2 bg-[#FF6B35] rounded-full animate-pulse-glow"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {notifications.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}
      </div>
    </div>
  )
}

export default NotificationList
