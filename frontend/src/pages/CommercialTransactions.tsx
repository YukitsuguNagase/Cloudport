import React from 'react'
import { useNavigate } from 'react-router-dom'

const CommercialTransactions: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden">
      <div className="absolute inset-0 tech-grid opacity-20"></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-[#00D9FF] hover:text-[#00D9FF]/80 transition-colors mb-4 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              戻る
            </button>
            <h1 className="text-4xl font-bold text-white mb-2">特定商取引法に基づく表記</h1>
            <p className="text-gray-400">Commercial Transactions Act</p>
          </div>

          {/* Content */}
          <div className="glass-dark p-8 rounded-2xl border border-[#00D9FF]/20 shadow-2xl space-y-8">
            {/* 事業者情報 */}
            <section>
              <h2 className="text-2xl font-bold text-[#00D9FF] mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                事業者情報
              </h2>
              <div className="space-y-3 text-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <dt className="font-semibold text-white">事業者名</dt>
                  <dd className="md:col-span-2">.Q(ドットキュー)</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <dt className="font-semibold text-white">代表者名</dt>
                  <dd className="md:col-span-2">永瀬 侑世</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <dt className="font-semibold text-white">所在地</dt>
                  <dd className="md:col-span-2">〒211-0041 神奈川県川崎市中原区下小田中2-18-19-305</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <dt className="font-semibold text-white">メールアドレス</dt>
                  <dd className="md:col-span-2">
                    <a href="mailto:yukinag@dotqinc.com" className="text-[#00D9FF] hover:underline">
                      yukinag@dotqinc.com
                    </a>
                  </dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <dt className="font-semibold text-white">運営サイト</dt>
                  <dd className="md:col-span-2">CloudPort（クラウドポート）</dd>
                </div>
              </div>
            </section>

            <hr className="border-[#00D9FF]/20" />

            {/* 販売価格・手数料 */}
            <section>
              <h2 className="text-2xl font-bold text-[#00D9FF] mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                販売価格・手数料
              </h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">プラットフォーム利用料</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>企業様：契約成立時に契約金額の10%のプラットフォーム手数料</li>
                    <li>エンジニア様：基本利用料無料</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">手数料の詳細</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>手数料率：契約金額の10%（税込）</li>
                    <li>最低手数料：なし</li>
                    <li>手数料は契約金額に応じて自動計算されます</li>
                  </ul>
                </div>
                <div className="bg-[#0A1628]/50 p-4 rounded-lg border border-[#FF6B35]/20">
                  <p className="text-sm">
                    <span className="font-semibold text-[#FF6B35]">※ 重要：</span>
                    プラットフォーム手数料は、マッチング及びプラットフォーム利用に対する対価です。
                    エンジニアへの報酬は、企業様から直接お支払いいただきます。
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-[#00D9FF]/20" />

            {/* 支払方法・時期 */}
            <section>
              <h2 className="text-2xl font-bold text-[#00D9FF] mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                支払方法・時期
              </h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">支払方法</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>クレジットカード決済（Visa、Mastercard、JCB、American Express、Diners Club）</li>
                    <li>決済代行サービス：PAY.JP</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">支払時期</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>契約承認時：企業様がエンジニアからの契約提案を承認した時点で決済が実行されます</li>
                    <li>決済完了後、契約が正式に成立します</li>
                  </ul>
                </div>
              </div>
            </section>

            <hr className="border-[#00D9FF]/20" />

            {/* サービス提供時期 */}
            <section>
              <h2 className="text-2xl font-bold text-[#00D9FF] mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                サービス提供時期
              </h2>
              <div className="space-y-2 text-gray-300">
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>プラットフォームサービス：お申込み後、即時ご利用いただけます</li>
                  <li>マッチングサービス：契約成立後、即時提供開始</li>
                  <li>サポートサービス：ご利用期間中、継続的に提供</li>
                </ul>
              </div>
            </section>

            <hr className="border-[#00D9FF]/20" />

            {/* 返品・キャンセルポリシー */}
            <section>
              <h2 className="text-2xl font-bold text-[#00D9FF] mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                </svg>
                返品・キャンセルポリシー
              </h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">基本方針</h3>
                  <p className="mb-2">
                    本サービスはデジタルコンテンツ及びマッチングサービスのため、
                    原則として決済完了後の返金・キャンセルはできません。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">例外的に返金可能な場合</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>当社の責に帰すべき事由により、サービス提供ができない場合</li>
                    <li>システムの重大な不具合により、サービスが利用できない場合</li>
                    <li>その他、当社が特別に認めた場合</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">返金手続き</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>返金が認められた場合、原則として決済に使用したクレジットカードへ返金します</li>
                    <li>返金処理には、決済代行会社の処理期間を含め、最大60日程度かかる場合があります</li>
                    <li>返金額は、お支払いいただいた手数料の全額とします</li>
                  </ul>
                </div>
                <div className="bg-[#0A1628]/50 p-4 rounded-lg border border-[#FF6B35]/20">
                  <p className="text-sm">
                    <span className="font-semibold text-[#FF6B35]">※ 重要：</span>
                    契約成立後のエンジニアとのトラブルについては、当事者間で解決していただくことを原則とします。
                    ただし、明らかな規約違反がある場合は、運営チームまでご相談ください。
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-[#00D9FF]/20" />

            {/* 特記事項 */}
            <section>
              <h2 className="text-2xl font-bold text-[#00D9FF] mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                特記事項
              </h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">サービス利用について</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>本サービスのご利用には、利用規約への同意が必要です</li>
                    <li>登録情報に虚偽があった場合、サービスの利用を停止することがあります</li>
                    <li>サービス内容は予告なく変更される場合があります</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">個人情報の取り扱い</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>お客様の個人情報は、プライバシーポリシーに基づき適切に管理します</li>
                    <li>第三者への情報提供は、お客様の同意なく行いません（法令に基づく場合を除く）</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">免責事項</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>企業様とエンジニア様の間で締結された契約内容について、当社は責任を負いません</li>
                    <li>契約履行に関するトラブルは、原則として当事者間で解決していただきます</li>
                    <li>天災地変その他の不可抗力により、サービス提供が困難な場合、当社は責任を負いません</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">準拠法・管轄裁判所</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>本サービスに関する紛争については、日本法を準拠法とします</li>
                    <li>本サービスに関する訴訟については、東京地方裁判所を第一審の専属的合意管轄裁判所とします</li>
                  </ul>
                </div>
              </div>
            </section>

            <hr className="border-[#00D9FF]/20" />

            {/* お問い合わせ */}
            <section>
              <h2 className="text-2xl font-bold text-[#00D9FF] mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                お問い合わせ
              </h2>
              <div className="space-y-3 text-gray-300">
                <p>
                  本表記に関するご質問、サービスに関するお問い合わせは、
                  以下の方法でお気軽にご連絡ください。
                </p>
                <div className="bg-[#0A1628]/50 p-4 rounded-lg border border-[#00D9FF]/20">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#00D9FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:yukinag@dotqinc.com" className="text-[#00D9FF] hover:underline">
                      yukinag@dotqinc.com
                    </a>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  ※ お問い合わせへの回答は、原則として3営業日以内に行います。
                </p>
              </div>
            </section>

            {/* 最終更新日 */}
            <div className="text-center text-sm text-gray-400 pt-6 border-t border-[#00D9FF]/20">
              最終更新日：2025年12月11日
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommercialTransactions
