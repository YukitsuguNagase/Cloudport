import { Link } from 'react-router-dom'

function Legal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] text-white">
      {/* Header */}
      <header className="glass-dark sticky top-0 z-50 border-b border-[#00E5FF]/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center h-20">
            <Link to="/" className="text-2xl sm:text-3xl font-bold font-mono">
              <span className="gradient-text-cyan">Cloud</span>
              <span className="text-[#FF6B35]">Port</span>
            </Link>
            <Link
              to="/"
              className="text-sm sm:text-base text-[#E8EEF7] hover:text-[#00E5FF] transition-colors duration-300"
            >
              ホームに戻る
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-4xl">
        <div className="glass-dark p-8 sm:p-12 rounded-2xl border border-[#00E5FF]/20">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 gradient-text">特定商取引法に基づく表記</h1>

          <div className="space-y-6 text-[#E8EEF7]/80 leading-relaxed">
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">事業者名</h2>
              <p>CloudPort運営事務局</p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">運営責任者</h2>
              <p>永瀬 友貴</p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">所在地</h2>
              <p>東京都渋谷区:</p>
              <p className="text-sm mt-2 text-[#E8EEF7]/60">※請求があったときは、遅滞なく開示いたします。お問い合わせフォームよりご連絡ください。</p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">お問い合わせ</h2>
              <p>メールアドレス：<a href="mailto:yukinag@dotqinc.com" className="text-[#00E5FF] hover:underline">yukinag@dotqinc.com</a></p>
              <p className="text-sm mt-2 text-[#E8EEF7]/60">※お問い合わせは、できる限り早急に対応させていただきますが、営業時間外のご連絡につきましては翌営業日以降の対応となります。</p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">販売価格</h2>
              <p>AWSクラウドエンジニアのマッチングプラットフォームであり、CloudPortを通じて行われる取引に関して：</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>クラウドエンジニア案件の掲載料：無料</li>
                <li>エンジニアへの応募機能：無料</li>
                <li>契約成立時の手数料：無料</li>
                <li>決済手数料：無料</li>
                <li>契約金額の決済時にシステム利用料として決済金額の10%を手数料として頂戴いたします</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">料金</h2>
              <div className="space-y-3">
                <p><strong>基本サービス：</strong>無料</p>
                <p><strong>決済システム利用料：</strong>決済・送金時に発生</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>決済金額の10%を手数料としてお支払いいただきます</li>
                </ul>
                <p className="text-sm mt-2 text-[#E8EEF7]/60">※価格は変更される場合があります。変更の際は本ページにて告知いたします。</p>
                <p className="text-sm text-[#E8EEF7]/60">※クラウドエンジニアへの決済金額は、応募した案件の金額基準により決定されます。</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">支払方法</h2>
              <p>当サービスでは決済代行サービス（PAY.JP）を利用しています：</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>VISA</li>
                <li>Mastercard</li>
                <li>American Express</li>
                <li>JCB</li>
                <li>Diners Club</li>
                <li>Discover</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">支払時期</h2>
              <p>決済完了後、即時に当サービスの決済システム利用料の支払いが完了します。</p>
              <p className="mt-2">支払情報は、決済完了後に発行されます。</p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">サービス提供時期</h2>
              <p>ご登録後、直ちにサービスをご利用いただけます。</p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">返品・キャンセル</h2>
              <div className="space-y-3">
                <p><strong>返品について：</strong></p>
                <p>決済システム利用料は、支払後の返金は原則として承っておりません。ただし、以下の場合には返金対応をいたします：</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>システム障害により決済処理が正常に完了しなかった場合</li>
                  <li>ご本人の意思によらない不正な決済が行われた場合</li>
                  <li>その他、ご本人により返金が必要と判断される場合</li>
                </ul>
                <p className="mt-3"><strong>キャンセルについて：</strong></p>
                <p>支払前であればいつでもキャンセル可能です。支払後のキャンセルについては、上記の返金対応をご確認ください。</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">動作環境</h2>
              <p>本サービスは以下の環境での利用を推奨しています：</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Google Chrome（最新版）</li>
                <li>Safari（最新版）</li>
                <li>Microsoft Edge（最新版）</li>
                <li>Firefox（最新版）</li>
              </ul>
              <p className="text-sm mt-2 text-[#E8EEF7]/60">※古いバージョンのブラウザをご利用の場合、一部機能が正常に動作しない可能性があります。</p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">その他の注意事項</h2>
              <p>本サービスの利用は、<Link to="/terms" className="text-[#00E5FF] hover:underline">利用規約</Link>および<Link to="/privacy" className="text-[#00E5FF] hover:underline">プライバシーポリシー</Link>への同意が必要です。</p>
            </section>

            <div className="mt-12 pt-8 border-t border-[#00E5FF]/20 text-sm text-[#E8EEF7]/60">
              <p>制定日: 2024年12月4日</p>
              <p className="mt-2">CloudPort運営事務局</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Legal
