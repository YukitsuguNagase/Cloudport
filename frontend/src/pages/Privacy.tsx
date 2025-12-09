import { Link } from 'react-router-dom'

function Privacy() {
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-4xl">
        <div className="glass-dark p-8 sm:p-12 rounded-2xl border border-[#00E5FF]/20">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 gradient-text">プライバシーポリシー</h1>

          <div className="space-y-8 text-[#E8EEF7]/80 leading-relaxed">
            <section>
              <p>
                CloudPort（以下「当サービス」といいます）は、ユーザーの個人情報について以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第1条（個人情報）</h2>
              <p>
                「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、
                生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、
                連絡先その他の記述等により特定の個人を識別できる情報を指します。
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第2条（個人情報の収集方法）</h2>
              <div className="space-y-2">
                <p>
                  当サービスは、ユーザーが利用登録をする際に以下の個人情報をお尋ねすることがあります：
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>メールアドレス</li>
                  <li>氏名または企業名</li>
                  <li>プロフィール情報（技術者：AWS資格、スキル、経験など / 企業：事業内容、連絡先など）</li>
                  <li>メッセージの内容</li>
                  <li>契約情報（金額、期間など）</li>
                  <li>決済情報</li>
                </ul>
                <p className="mt-3">
                  また、ユーザーと提携先などとの間でなされたユーザーの個人情報を含む取引記録や決済に関する情報を、
                  当サービスの提携先（決済サービス提供者などを含みます。以下「提携先」といいます）などから収集することがあります。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第3条（個人情報を収集・利用する目的）</h2>
              <p className="mb-2">当サービスが個人情報を収集・利用する目的は、以下のとおりです。</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>当サービスの提供・運営のため</li>
                <li>ユーザーからのお問い合わせに回答するため</li>
                <li>ユーザーが利用中のサービスの新機能、更新情報、キャンペーン等の案内のメールを送付するため</li>
                <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
                <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
                <li>ユーザーにご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため</li>
                <li>上記の利用目的に付随する目的</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第4条（利用目的の変更）</h2>
              <p>
                当サービスは、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、
                個人情報の利用目的を変更するものとします。
                利用目的の変更を行った場合には、変更後の目的について、所定の方法により、ユーザーに通知し、
                または本ウェブサイト上に公表するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第5条（個人情報の第三者提供）</h2>
              <p className="mb-2">
                当サービスは、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、
                第三者に個人情報を提供することはありません。
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第6条（個人情報の開示）</h2>
              <p>
                当サービスは、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。
                ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、
                開示しない決定をした場合には、その旨を遅滞なく通知します。
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</li>
                <li>当サービスの業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
                <li>その他法令に違反することとなる場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第7条（個人情報の訂正および削除）</h2>
              <p>
                ユーザーは、当サービスの保有する自己の個人情報が誤った情報である場合には、
                当サービスが定める手続きにより、当サービスに対して個人情報の訂正、追加または削除（以下「訂正等」といいます）を請求することができます。
                当サービスは、ユーザーから前項の請求を受けてその請求に応じる必要があると判断した場合には、
                遅滞なく、当該個人情報の訂正等を行うものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第8条（個人情報の利用停止等）</h2>
              <p>
                当サービスは、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、
                または不正の手段により取得されたものであるという理由により、その利用の停止または消去（以下「利用停止等」といいます）を求められた場合には、
                遅滞なく必要な調査を行います。
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第9条（プライバシーポリシーの変更）</h2>
              <p>
                本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、
                ユーザーに通知することなく、変更することができるものとします。
                当サービスが別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第10条（お問い合わせ窓口）</h2>
              <p>
                本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。
              </p>
              <div className="mt-3 p-4 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg">
                <p className="font-semibold text-white">お問い合わせ先</p>
                <p className="mt-2">
                  Eメールアドレス：<a href="mailto:yukinag@dotqinc.com" className="text-[#00E5FF] hover:underline">yukinag@dotqinc.com</a>
                </p>
              </div>
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

export default Privacy
