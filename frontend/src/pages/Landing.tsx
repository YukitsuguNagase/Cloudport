import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'

function Landing() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Create floating cloud elements
    const hero = heroRef.current
    if (!hero) return

    const clouds: HTMLDivElement[] = []
    for (let i = 0; i < 5; i++) {
      const cloud = document.createElement('div')
      cloud.className = 'absolute rounded-full bg-gradient-to-br from-[#00E5FF]/10 to-[#5B8DEF]/10 blur-3xl animate-cloud-float'
      cloud.style.width = `${Math.random() * 300 + 200}px`
      cloud.style.height = `${Math.random() * 300 + 200}px`
      cloud.style.left = `${Math.random() * 100}%`
      cloud.style.top = `${Math.random() * 100}%`
      cloud.style.animationDelay = `${i * 1.2}s`
      cloud.style.animationDuration = `${Math.random() * 4 + 6}s`
      hero.appendChild(cloud)
      clouds.push(cloud)
    }

    return () => {
      clouds.forEach(cloud => cloud.remove())
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] text-white overflow-hidden">
      {/* Header */}
      <header className="glass-dark sticky top-0 z-50 border-b border-[#00E5FF]/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center h-20 animate-slide-down">
            <Link
              to="/"
              className="text-2xl sm:text-3xl font-bold font-mono relative group"
            >
              <span className="gradient-text-cyan">Cloud</span>
              <span className="text-[#FF6B35]">Port</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00E5FF] to-[#FF6B35] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/login"
                className="text-sm sm:text-base text-[#E8EEF7] hover:text-[#00E5FF] transition-colors duration-300 font-medium"
              >
                ログイン
              </Link>
              <Link
                to="/signup"
                className="btn-primary text-sm sm:text-base"
              >
                無料登録
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        {/* Tech Grid Background */}
        <div className="absolute inset-0 tech-grid opacity-30"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="mb-6 sm:mb-8 animate-slide-up">
            <span className="inline-block px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/5 text-[#00E5FF] text-xs sm:text-sm font-mono font-semibold tracking-wider animate-pulse-glow">
              // AWS TALENT MATCHING PLATFORM
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight animate-slide-up delay-100">
            <span className="block mb-2 sm:mb-4">AWS技術者と企業を</span>
            <span className="block gradient-text">シームレスに接続</span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-[#E8EEF7]/80 mb-10 sm:mb-14 max-w-3xl mx-auto leading-relaxed animate-slide-up delay-200">
            認定資格保持者が、長期・短期のプロジェクト案件を見つけられる
            <br className="hidden sm:block" />
            次世代マッチングプラットフォーム
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 animate-slide-up delay-300">
            <Link
              to="/signup?type=engineer"
              className="group relative px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-base sm:text-lg font-bold bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-[#0A1628] hover:shadow-[0_0_40px_rgba(0,229,255,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                技術者として登録
              </span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Link>

            <Link
              to="/signup?type=company"
              className="group relative px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-base sm:text-lg font-bold border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white hover:shadow-[0_0_40px_rgba(255,107,53,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                企業として登録
              </span>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 sm:mt-24 grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto animate-slide-up delay-400">
            <div className="text-center">
              <div className="text-3xl sm:text-5xl font-bold font-mono gradient-text-cyan mb-2">500+</div>
              <div className="text-xs sm:text-sm text-[#E8EEF7]/60 font-medium">登録技術者</div>
            </div>
            <div className="text-center border-x border-[#00E5FF]/20">
              <div className="text-3xl sm:text-5xl font-bold font-mono gradient-text mb-2">200+</div>
              <div className="text-xs sm:text-sm text-[#E8EEF7]/60 font-medium">掲載案件</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-5xl font-bold font-mono gradient-text-cyan mb-2">98%</div>
              <div className="text-xs sm:text-sm text-[#E8EEF7]/60 font-medium">マッチング成功率</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-transparent to-[#0A1628]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-xs sm:text-sm font-mono text-[#00E5FF] mb-3 sm:mb-4 tracking-widest">// FEATURES</h2>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="gradient-text">プラットフォームの特徴</span>
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: (
                  <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: '高度な案件検索',
                description: 'AWS資格・スキルレベル・希望単価で精密にフィルタリング',
                delay: 'delay-100'
              },
              {
                icon: (
                  <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                title: 'リアルタイムメッセージング',
                description: 'プラットフォーム内で企業と即座にコミュニケーション',
                delay: 'delay-200'
              },
              {
                icon: (
                  <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: '安全な契約管理',
                description: '契約成立から支払いまでを一元管理で安心',
                delay: 'delay-300'
              },
              {
                icon: (
                  <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'スカウト機能',
                description: '企業から直接オファーが届く独自システム',
                delay: 'delay-400'
              },
              {
                icon: (
                  <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: '評価システム',
                description: '実績とレビューで信頼性を可視化',
                delay: 'delay-500'
              },
              {
                icon: (
                  <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: '透明な料金体系',
                description: '成功報酬型で初期費用なし',
                delay: 'delay-600'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group relative glass-dark p-6 sm:p-8 rounded-2xl border border-[#00E5FF]/10 hover:border-[#00E5FF]/40 transition-all duration-500 card-hover animate-scale-in ${feature.delay}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00E5FF]/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative">
                  <div className="text-[#00E5FF] mb-4 sm:mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-[#00E5FF] transition-colors duration-300">
                    {feature.title}
                  </h4>
                  <p className="text-sm sm:text-base text-[#E8EEF7]/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative glass-dark p-8 sm:p-12 lg:p-16 rounded-3xl border border-[#FF6B35]/30 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/10 via-[#00E5FF]/10 to-[#FF6B35]/10 animate-shimmer"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B35]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00E5FF]/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                <span className="gradient-text">今すぐ始めよう</span>
              </h3>
              <p className="text-base sm:text-lg lg:text-xl text-[#E8EEF7]/80 mb-8 sm:mb-10">
                無料登録で、あなたに最適な案件やエンジニアを見つけましょう
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-[#FF6B35] to-[#FF9F66] text-white text-base sm:text-lg font-bold rounded-xl hover:shadow-[0_0_40px_rgba(255,107,53,0.6)] transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span>無料で登録する</span>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-[#00E5FF]/10 bg-gradient-to-b from-transparent to-[#0A1628]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 sm:mb-12">
            <div>
              <h5 className="font-mono font-bold text-lg mb-4 gradient-text-cyan">CloudPort</h5>
              <p className="text-sm text-[#E8EEF7]/60">
                AWS技術者と企業をつなぐ<br />次世代マッチングプラットフォーム
              </p>
            </div>
            <div>
              <h6 className="font-semibold mb-4 text-white">サービス</h6>
              <ul className="space-y-2 text-sm">
                <li><Link to="/jobs" className="text-[#E8EEF7]/60 hover:text-[#00E5FF] transition-colors">案件一覧</Link></li>
                <li><Link to="/signup" className="text-[#E8EEF7]/60 hover:text-[#00E5FF] transition-colors">登録</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4 text-white">企業情報</h6>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms" className="text-[#E8EEF7]/60 hover:text-[#00E5FF] transition-colors">利用規約</Link></li>
                <li><Link to="/privacy" className="text-[#E8EEF7]/60 hover:text-[#00E5FF] transition-colors">プライバシーポリシー</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4 text-white">お問い合わせ</h6>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contact" className="text-[#E8EEF7]/60 hover:text-[#00E5FF] transition-colors">お問い合わせフォーム</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#00E5FF]/10 pt-6 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm text-[#E8EEF7]/40 font-mono">
              &copy; 2025 CloudPort. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
