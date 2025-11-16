function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">CloudPortについて</h3>
            <p className="text-gray-400 text-sm">
              AWS技術者と企業をつなぐマッチングプラットフォーム
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">リンク</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  利用規約
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  お問い合わせ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">お問い合わせ</h3>
            <p className="text-gray-400 text-sm">
              support@cloudport.example.com
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2024 CloudPort. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
