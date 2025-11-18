import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Contact() {
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
          <h1 className="text-3xl font-bold mb-6">お問い合わせ</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <p className="mb-4">
                CloudPortに関するお問い合わせは、以下のメールアドレスまでご連絡ください。
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-600 mb-2">お問い合わせ先メールアドレス</h2>
                    <a
                      href="mailto:yukinag@dotqinc.com"
                      className="text-xl font-bold text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      yukinag@dotqinc.com
                    </a>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">お問い合わせの際は以下をご記載ください</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
                      <li>お名前</li>
                      <li>ご登録のメールアドレス（該当する場合）</li>
                      <li>お問い合わせ内容</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-3 text-blue-900">よくあるお問い合わせ</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Q. アカウント登録ができません</h3>
                  <p className="text-sm text-blue-800">
                    A. メールアドレスの確認が必要です。登録時に送信される確認メールのリンクをクリックしてください。
                    メールが届かない場合は、迷惑メールフォルダをご確認ください。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Q. パスワードを忘れてしまいました</h3>
                  <p className="text-sm text-blue-800">
                    A. ログイン画面の「パスワードをお忘れの方」リンクから、パスワードの再設定が可能です。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Q. 契約後のキャンセルは可能ですか</h3>
                  <p className="text-sm text-blue-800">
                    A. 契約条件によって異なります。詳細は利用規約をご確認いただくか、お問い合わせください。
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Q. 手数料について教えてください</h3>
                  <p className="text-sm text-blue-800">
                    A. 契約成立時に契約金額に対して所定の手数料が発生します。詳細な料金体系についてはお問い合わせください。
                  </p>
                </div>
              </div>
            </section>

            <section className="text-sm text-gray-600">
              <p>
                お問い合わせへの返信には、通常2〜3営業日程度お時間をいただいております。
                お急ぎの場合は、その旨をメール本文にご記載ください。
              </p>
              <p className="mt-2">
                なお、土日祝日および年末年始はお休みをいただいており、翌営業日以降の対応となります。
                予めご了承ください。
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
