import { Link, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { getNotifications } from '../../services/notifications'

function Header() {
  const { user, logout, getIdToken } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const fetchNotifications = async () => {
    if (!user) return

    try {
      const idToken = await getIdToken()
      const data = await getNotifications(idToken)
      setUnreadCount(data.filter(n => !n.isRead).length)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [user])

  return (
    <header className="bg-gradient-to-r from-[#0A1628] to-[#1A2942] sticky top-0 z-50 border-b border-[#00E5FF]/20 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold font-mono relative group flex items-center gap-2"
          >
            <div>
              <span className="gradient-text-cyan">Cloud</span>
              <span className="text-[#FF6B35]">Port</span>
            </div>
            <span className="text-xs text-[#00E5FF] font-normal">(β版)</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00E5FF] to-[#FF6B35] group-hover:w-full transition-all duration-300"></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/jobs"
                  className="text-[#E8EEF7] hover:text-[#00E5FF] transition-colors duration-300 font-medium"
                >
                  案件一覧
                </Link>

                {user.userType === 'engineer' && (
                  <>
                    <Link
                      to="/applications"
                      className="text-[#E8EEF7] hover:text-[#00E5FF] transition-colors duration-300 font-medium"
                    >
                      応募履歴
                    </Link>
                  </>
                )}

                {user.userType === 'company' && (
                  <>
                    <Link
                      to="/jobs/new"
                      className="text-[#E8EEF7] hover:text-[#00E5FF] transition-colors duration-300 font-medium"
                    >
                      案件投稿
                    </Link>
                    <Link
                      to="/scouts/search"
                      className="text-[#E8EEF7] hover:text-[#00E5FF] transition-colors duration-300 font-medium"
                    >
                      エンジニア検索
                    </Link>
                  </>
                )}

                <Link
                  to="/messages"
                  className="text-[#E8EEF7] hover:text-[#00E5FF] transition-colors duration-300 font-medium"
                >
                  メッセージ
                </Link>

                <Link
                  to="/contracts"
                  className="text-[#E8EEF7] hover:text-[#00E5FF] transition-colors duration-300 font-medium"
                >
                  契約
                </Link>

                {user.userType === 'company' && (
                  <Link
                    to="/payments"
                    className="text-[#E8EEF7] hover:text-[#00E5FF] transition-colors duration-300 font-medium"
                  >
                    支払い
                  </Link>
                )}

                <Link
                  to="/notifications"
                  className="relative text-[#E8EEF7] hover:text-[#00E5FF] transition-colors duration-300"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FF6B35] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse-glow">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/profile"
                  className="text-[#E8EEF7] hover:text-[#00E5FF] transition-colors duration-300 font-medium"
                >
                  プロフィール
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-[#FF6B35] text-white hover:bg-[#FF9F66] hover:text-white transition-all duration-300 font-medium"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/jobs"
                  className="text-[#E8EEF7] hover:text-[#00E5FF] transition-colors duration-300 font-medium"
                >
                  案件一覧
                </Link>
                <Link
                  to="/login"
                  className="text-[#E8EEF7] hover:text-[#00E5FF] transition-colors duration-300 font-medium"
                >
                  ログイン
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary"
                >
                  無料登録
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#E8EEF7] hover:text-[#00E5FF] transition-colors duration-300 relative z-50"
            aria-label="メニュー"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay and Content */}
        {mobileMenuOpen && createPortal(
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden animate-fade-in"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div
              id="mobile-menu"
              className="md:hidden fixed top-0 right-0 w-3/4 max-w-sm h-full bg-[#1A2942] shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out animate-slide-left"
              role="dialog"
              aria-modal="true"
              aria-label="モバイルメニュー"
            >
              <div className="flex flex-col h-full overflow-y-auto pt-20 px-6 pb-6 border-l border-[#00E5FF]/20">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-6 right-6 text-[#E8EEF7] hover:text-[#00E5FF] transition-colors"
                  aria-label="閉じる"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <nav className="space-y-4">
                  {user ? (
                    <>
                      <Link
                        to="/jobs"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 text-white hover:bg-[#2C4875] hover:text-[#00E5FF] rounded-lg transition-all duration-300 font-medium border border-transparent hover:border-[#00E5FF]/30"
                      >
                        案件一覧
                      </Link>

                      {user.userType === 'engineer' && (
                        <Link
                          to="/applications"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-4 py-3 text-white hover:bg-[#2C4875] hover:text-[#00E5FF] rounded-lg transition-all duration-300 font-medium border border-transparent hover:border-[#00E5FF]/30"
                        >
                          応募履歴
                        </Link>
                      )}

                      {user.userType === 'company' && (
                        <>
                          <Link
                            to="/jobs/new"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-4 py-3 text-white hover:bg-[#2C4875] hover:text-[#00E5FF] rounded-lg transition-all duration-300 font-medium border border-transparent hover:border-[#00E5FF]/30"
                          >
                            案件投稿
                          </Link>
                          <Link
                            to="/scouts/search"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-4 py-3 text-white hover:bg-[#2C4875] hover:text-[#00E5FF] rounded-lg transition-all duration-300 font-medium border border-transparent hover:border-[#00E5FF]/30"
                          >
                            エンジニア検索
                          </Link>
                        </>
                      )}

                      <Link
                        to="/messages"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 text-white hover:bg-[#2C4875] hover:text-[#00E5FF] rounded-lg transition-all duration-300 font-medium border border-transparent hover:border-[#00E5FF]/30"
                      >
                        メッセージ
                      </Link>

                      <Link
                        to="/contracts"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 text-white hover:bg-[#2C4875] hover:text-[#00E5FF] rounded-lg transition-all duration-300 font-medium border border-transparent hover:border-[#00E5FF]/30"
                      >
                        契約
                      </Link>

                      {user.userType === 'company' && (
                        <Link
                          to="/payments"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-4 py-3 text-white hover:bg-[#2C4875] hover:text-[#00E5FF] rounded-lg transition-all duration-300 font-medium border border-transparent hover:border-[#00E5FF]/30"
                        >
                          支払い
                        </Link>
                      )}

                      <Link
                        to="/notifications"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 text-white hover:bg-[#2C4875] hover:text-[#00E5FF] rounded-lg transition-all duration-300 font-medium border border-transparent hover:border-[#00E5FF]/30"
                      >
                        <div className="flex items-center justify-between">
                          <span>通知</span>
                          {unreadCount > 0 && (
                            <span className="bg-[#FF6B35] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse-glow">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </div>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 text-white hover:bg-[#2C4875] hover:text-[#00E5FF] rounded-lg transition-all duration-300 font-medium border border-transparent hover:border-[#00E5FF]/30"
                      >
                        プロフィール
                      </Link>

                      <button
                        onClick={() => {
                          handleLogout()
                          setMobileMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-3 text-[#FF6B35] hover:bg-[#FF6B35]/10 rounded-lg transition-all duration-300 font-medium border border-transparent hover:border-[#FF6B35]/30"
                      >
                        ログアウト
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/jobs"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 text-white hover:bg-[#2C4875] hover:text-[#00E5FF] rounded-lg transition-all duration-300 font-medium border border-transparent hover:border-[#00E5FF]/30"
                      >
                        案件一覧
                      </Link>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 text-white hover:bg-[#2C4875] hover:text-[#00E5FF] rounded-lg transition-all duration-300 font-medium border border-transparent hover:border-[#00E5FF]/30"
                      >
                        ログイン
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF9F66] text-white hover:shadow-lg rounded-lg transition-all duration-300 text-center font-bold mt-4 shadow-md"
                      >
                        無料登録
                      </Link>
                    </>
                  )}
                </nav>
              </div>
            </div>
          </>,
          document.body
        )}
      </div>
    </header>
  )
}

export default Header
