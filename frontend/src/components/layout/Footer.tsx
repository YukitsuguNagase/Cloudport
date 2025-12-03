import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#1A2942] to-[#0A1628] text-white py-12 mt-auto border-t border-[#00E5FF]/10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-mono font-bold text-lg mb-4 gradient-text-cyan">CloudPort</h3>
            <p className="text-[#E8EEF7]/60 text-sm leading-relaxed">
              AWS技術者と企業をつなぐ<br />次世代マッチングプラットフォーム
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">リンク</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-[#E8EEF7]/60 hover:text-[#00E5FF] transition-colors duration-300">
                  利用規約
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-[#E8EEF7]/60 hover:text-[#00E5FF] transition-colors duration-300">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#E8EEF7]/60 hover:text-[#00E5FF] transition-colors duration-300">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">お問い合わせ</h3>
            <p className="text-[#E8EEF7]/60 text-sm">
              <a href="mailto:yukinag@dotqinc.com" className="hover:text-[#00E5FF] transition-colors duration-300">
                yukinag@dotqinc.com
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-[#00E5FF]/10 pt-8 text-center text-[#E8EEF7]/40 text-sm font-mono">
          <p>&copy; 2025 CloudPort. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
