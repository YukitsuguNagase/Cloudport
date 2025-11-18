import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Terms() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link to={user ? "/jobs" : "/"} className="text-primary-600 hover:underline">
            ← {user ? "案件一覧に戻る" : "トップページに戻る"}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">利用規約</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-bold mb-3">第1条（適用）</h2>
              <p>
                本規約は、CloudPort（以下「当サービス」といいます）の利用に関する条件を定めるものです。
                ユーザーの皆様には、本規約に従って当サービスをご利用いただきます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">第2条（利用登録）</h2>
              <p>
                当サービスの利用を希望する方は、本規約に同意の上、所定の方法により利用登録を申請し、
                当社がこれを承認することで利用登録が完了するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">第3条（ユーザーIDおよびパスワードの管理）</h2>
              <p>
                ユーザーは、自己の責任において、当サービスのユーザーIDおよびパスワードを適切に管理するものとします。
                ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、
                もしくは第三者と共用することはできません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">第4条（禁止事項）</h2>
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
              <h2 className="text-xl font-bold mb-3">第5条（当サービスの提供の停止等）</h2>
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
              <h2 className="text-xl font-bold mb-3">第6条（利用制限および登録抹消）</h2>
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
              <h2 className="text-xl font-bold mb-3">第7条（免責事項）</h2>
              <p>
                当社は、当サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、
                特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）
                がないことを明示的にも黙示的にも保証しておりません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">第8条（サービス内容の変更等）</h2>
              <p>
                当社は、ユーザーへの事前の告知をもって、当サービスの内容を変更、追加または廃止することがあり、
                ユーザーはこれを承諾するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">第9条（利用規約の変更）</h2>
              <p>
                当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
                変更後の本規約は、当サービス上に表示した時点より効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">第10条（準拠法・裁判管轄）</h2>
              <p>
                本規約の解釈にあたっては、日本法を準拠法とします。
                当サービスに関して紛争が生じた場合には、東京地方裁判所を専属的合意管轄とします。
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200 text-right text-gray-500">
              <p>制定日：2025年1月1日</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Terms
