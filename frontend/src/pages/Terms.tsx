import { Link } from 'react-router-dom'

function Terms() {
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 gradient-text">利用規約</h1>

          <div className="space-y-8 text-[#E8EEF7]/80 leading-relaxed">
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第1条（適用）</h2>
              <p>
                本規約は、CloudPort（以下「当サービス」といいます）の利用に関する条件を定めるものです。
                ユーザーの皆様には、本規約に従って当サービスをご利用いただきます。
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第2条（利用登録）</h2>
              <p>
                当サービスの利用を希望する方は、本規約に同意の上、所定の方法により利用登録を申請し、
                当社がこれを承認することで利用登録が完了するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第3条（ユーザーIDおよびパスワードの管理）</h2>
              <p>
                ユーザーは、自己の責任において、当サービスのユーザーIDおよびパスワードを適切に管理するものとします。
                ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、
                もしくは第三者と共用することはできません。
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第4条（料金および支払い）</h2>
              <div className="space-y-2">
                <p>1. 当サービスは、以下の料金体系を採用します：</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>技術者：無料</li>
                  <li>企業：契約成立時にプラットフォーム手数料（契約金額の10%）をお支払いいただきます</li>
                </ul>
                <p className="mt-3">
                  2. 企業ユーザーは、当サービスを通じて技術者との契約が双方承認により成立した場合、
                  所定のプラットフォーム手数料を当社に支払うものとします。
                </p>
                <p className="mt-2">
                  3. 技術者への契約金額の支払いは、企業と技術者の間で直接行うものとし、
                  当社はこれに関与しません。当社への支払い義務は、プラットフォーム手数料のみとなります。
                </p>
                <p className="mt-2">
                  4. プラットフォーム手数料の支払い方法は、当社が指定する方法によるものとします。
                </p>
                <p className="mt-2">
                  5. 一度お支払いいただいた料金は、理由の如何を問わず返金いたしません。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第5条（契約成立の報告義務）</h2>
              <div className="space-y-2">
                <p>
                  1. 技術者および企業は、当サービスを通じて知り合った相手と業務委託契約等を締結した場合、
                  速やかに当社に対してその旨を報告するものとします。
                </p>
                <p className="mt-2">
                  2. 前項の報告を怠った場合、または虚偽の報告を行った場合、
                  当社は当該ユーザーのアカウントを停止し、
                  または損害賠償を請求することができるものとします。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第6条（禁止事項）</h2>
              <p className="mb-2">ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>当社、当サービスの他のユーザー、または第三者の知的財産権を侵害する行為</li>
                <li>当サービスのネットワークまたはシステム等に過度な負荷をかける行為</li>
                <li>当サービスの運営を妨害するおそれのある行為</li>
                <li>不正アクセスをし、またはこれを試みる行為</li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                <li>不正な目的を持って当サービスを利用する行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第7条（当サービスの提供の停止等）</h2>
              <p>
                当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく
                当サービスの全部または一部の提供を停止または中断することができるものとします。
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>当サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により、当サービスの提供が困難となった場合</li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、当社が当サービスの提供が困難と判断した場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第8条（利用制限および登録抹消）</h2>
              <p>
                当社は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、
                ユーザーに対して、当サービスの全部もしくは一部の利用を制限し、
                またはユーザーとしての登録を抹消することができるものとします。
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録事項に虚偽の事実があることが判明した場合</li>
                <li>その他、当社が当サービスの利用を適当でないと判断した場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第9条（免責事項）</h2>
              <p>
                当社は、当サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、
                特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）
                がないことを明示的にも黙示的にも保証しておりません。
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第10条（サービス内容の変更等）</h2>
              <p>
                当社は、ユーザーへの事前の告知をもって、当サービスの内容を変更、追加または廃止することがあり、
                ユーザーはこれを承諾するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第11条（利用規約の変更）</h2>
              <p>
                当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
                変更後の本規約は、当サービス上に表示した時点より効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">第12条（準拠法・裁判管轄）</h2>
              <p>
                本規約の解釈にあたっては、日本法を準拠法とします。
                当サービスに関して紛争が生じた場合には、東京地方裁判所を専属的合意管轄とします。
              </p>
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

export default Terms
