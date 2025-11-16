import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">CloudPort</h1>
          <div className="space-x-4">
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
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          AWS技術者と企業をつなぐ
          <br />
          マッチングプラットフォーム
        </h2>
        <p className="text-xl text-gray-600 mb-10">
          AWS認定資格保持者が、長期・短期のプロジェクト案件を見つけられる
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/signup"
            className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition"
          >
            技術者として登録
          </Link>
          <Link
            to="/signup"
            className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition"
          >
            企業として登録
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">主要機能</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h4 className="text-xl font-bold mb-4">案件検索</h4>
            <p className="text-gray-600">
              AWS技術者向けの案件を簡単に検索・閲覧できます
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h4 className="text-xl font-bold mb-4">メッセージング</h4>
            <p className="text-gray-600">
              プラットフォーム内で企業と直接やりとりできます
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h4 className="text-xl font-bold mb-4">契約管理</h4>
            <p className="text-gray-600">
              契約成立から支払いまでをスムーズに管理できます
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 CloudPort. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
