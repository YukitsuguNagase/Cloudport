import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useState } from 'react'

function AdminHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const navLinks = [
    { path: '/admin/dashboard', label: 'ダッシュボード' },
    { path: '/admin/users', label: 'ユーザー管理' },
    { path: '/admin/jobs', label: '案件管理' },
    { path: '/admin/logs', label: 'システムログ' },
    { path: '/admin/settings', label: '設定' },
  ]

  return (
    <header className="bg-gradient-to-r from-[#0A1628] to-[#1A2942] sticky top-0 z-50 border-b border-[#EF4444]/20 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/admin/dashboard"
            className="text-2xl font-bold font-mono relative group flex items-center gap-3"
          >
            <div>
              <span className="gradient-text-cyan">Cloud</span>
              <span className="text-[#EF4444]">Port</span>
            </div>
            <span className="px-2 py-1 bg-[#EF4444]/20 text-[#EF4444] text-xs font-bold rounded border border-[#EF4444]/30">
              ADMIN
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#EF4444] to-[#00E5FF] group-hover:w-full transition-all duration-300"></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors duration-300 font-medium ${
                  isActive(link.path)
                    ? 'text-[#EF4444] font-bold'
                    : 'text-[#E8EEF7] hover:text-[#EF4444]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* User Info & Logout */}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-[#EF4444]/30">
              <div className="text-right">
                <div className="text-xs text-[#E8EEF7]/60">管理者</div>
                <div className="text-sm text-[#E8EEF7] font-medium">{user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-[#EF4444] text-white hover:bg-[#DC2626] transition-all duration-300 font-medium"
              >
                ログアウト
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#E8EEF7] hover:text-[#EF4444] transition-colors duration-300"
            aria-label="メニュー"
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full border-t border-[#EF4444]/20 bg-[#1A2942] shadow-xl animate-slide-down z-50">
            <nav className="py-4 space-y-2 px-4 pb-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                    isActive(link.path)
                      ? 'bg-[#EF4444]/20 text-[#EF4444] font-bold'
                      : 'text-white hover:bg-[#2C4875] hover:text-[#EF4444]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-[#EF4444]/20 mt-4 pt-4">
                <div className="px-4 py-2 text-sm">
                  <div className="text-[#E8EEF7]/60 mb-1">管理者</div>
                  <div className="text-[#E8EEF7] font-medium">{user?.email}</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full mt-2 px-4 py-3 bg-[#EF4444] text-white hover:bg-[#DC2626] rounded-lg transition-all duration-300 font-bold"
                >
                  ログアウト
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default AdminHeader
