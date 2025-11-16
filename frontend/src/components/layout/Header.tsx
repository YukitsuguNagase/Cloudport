import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            CloudPort
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/jobs"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  案件一覧
                </Link>

                {user.userType === 'engineer' && (
                  <>
                    <Link
                      to="/applications"
                      className="text-gray-700 hover:text-primary-600 transition"
                    >
                      応募履歴
                    </Link>
                  </>
                )}

                {user.userType === 'company' && (
                  <>
                    <Link
                      to="/jobs/new"
                      className="text-gray-700 hover:text-primary-600 transition"
                    >
                      案件投稿
                    </Link>
                  </>
                )}

                <Link
                  to="/messages"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  メッセージ
                </Link>

                <Link
                  to="/contracts"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  契約
                </Link>

                {user.userType === 'company' && (
                  <Link
                    to="/payments"
                    className="text-gray-700 hover:text-primary-600 transition"
                  >
                    支払い
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  プロフィール
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/jobs"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  案件一覧
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  ログイン
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  無料登録
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
