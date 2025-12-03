import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { searchEngineers } from '../../services/scouts'
import { EngineerSearchFilters, EngineerSearchResult } from '../../types/scout'
import { AWS_CERTIFICATIONS } from '../../constants/awsCertifications'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/common/Pagination'
import ScoutModal from '../../components/scouts/ScoutModal'

interface SearchState {
  searchResults: EngineerSearchResult[]
  selectedCertifications: string[]
  preferredLocation: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' | ''
  minHourlyRate: number | ''
  maxHourlyRate: number | ''
  minMonthlyRate: number | ''
  maxMonthlyRate: number | ''
  hasSearched: boolean
  currentPage: number
}

function EngineerSearch() {
  const { user } = useAuth()
  const { showError } = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  // 状態を復元
  const savedState = location.state as SearchState | undefined

  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<EngineerSearchResult[]>(savedState?.searchResults || [])
  const [hasSearched, setHasSearched] = useState(savedState?.hasSearched || false)

  // Search filters
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>(savedState?.selectedCertifications || [])
  const [preferredLocation, setPreferredLocation] = useState(savedState?.preferredLocation || '')
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert' | ''>(savedState?.skillLevel || '')
  const [minHourlyRate, setMinHourlyRate] = useState<number | ''>(savedState?.minHourlyRate || '')
  const [maxHourlyRate, setMaxHourlyRate] = useState<number | ''>(savedState?.maxHourlyRate || '')
  const [minMonthlyRate, setMinMonthlyRate] = useState<number | ''>(savedState?.minMonthlyRate || '')
  const [maxMonthlyRate, setMaxMonthlyRate] = useState<number | ''>(savedState?.maxMonthlyRate || '')

  // Scout modal
  const [scoutModalOpen, setScoutModalOpen] = useState(false)
  const [selectedEngineer, setSelectedEngineer] = useState<EngineerSearchResult | null>(null)

  // Pagination
  const { currentPage, totalPages, currentItems, goToPage } = usePagination({
    items: searchResults,
    itemsPerPage: 20,
    initialPage: savedState?.currentPage
  })

  // 状態が変更されたときにlocation.stateを更新
  useEffect(() => {
    if (hasSearched) {
      const currentState: SearchState = {
        searchResults,
        selectedCertifications,
        preferredLocation,
        skillLevel,
        minHourlyRate,
        maxHourlyRate,
        minMonthlyRate,
        maxMonthlyRate,
        hasSearched,
        currentPage
      }
      // 状態をhistoryに保存（ブラウザバック時に復元されるように）
      navigate(location.pathname, { replace: true, state: currentState })
    }
  }, [searchResults, selectedCertifications, preferredLocation, skillLevel, minHourlyRate, maxHourlyRate, minMonthlyRate, maxMonthlyRate, currentPage])

  // 企業以外はアクセス不可
  if (user?.userType !== 'company') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-20"></div>
        <div className="glass-dark p-12 rounded-2xl border border-[#FF6B35]/30 text-center animate-scale-in relative z-10 max-w-md mx-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF6B35]/10 mb-4">
            <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#FF6B35] text-lg font-semibold mb-4">この機能は企業アカウント専用です</p>
          <Link to="/jobs" className="btn-primary px-6 py-2 rounded-lg inline-block">
            案件一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  const handleCertificationToggle = (certName: string) => {
    setSelectedCertifications(prev => {
      if (prev.includes(certName)) {
        return prev.filter(c => c !== certName)
      } else {
        return [...prev, certName]
      }
    })
  }

  const handleSearch = async () => {
    setLoading(true)
    setHasSearched(true)

    try {
      const filters: EngineerSearchFilters = {}

      if (selectedCertifications.length > 0) {
        filters.awsCertifications = selectedCertifications
      }
      if (preferredLocation) {
        filters.preferredLocation = preferredLocation
      }
      if (skillLevel) {
        filters.skillLevel = skillLevel
      }
      if (minHourlyRate !== '') {
        filters.minHourlyRate = Number(minHourlyRate)
      }
      if (maxHourlyRate !== '') {
        filters.maxHourlyRate = Number(maxHourlyRate)
      }
      if (minMonthlyRate !== '') {
        filters.minMonthlyRate = Number(minMonthlyRate)
      }
      if (maxMonthlyRate !== '') {
        filters.maxMonthlyRate = Number(maxMonthlyRate)
      }

      const results = await searchEngineers(filters)
      setSearchResults(results)
    } catch (err: any) {
      console.error('Failed to search engineers:', err)
      const errorMessage = err.response?.data?.message || err.message || 'エンジニアの検索に失敗しました'
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleScoutClick = (engineer: EngineerSearchResult) => {
    setSelectedEngineer(engineer)
    setScoutModalOpen(true)
  }

  const handleScoutSuccess = () => {
    setScoutModalOpen(false)
    setSelectedEngineer(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#1A2942] to-[#2C4875] relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 tech-grid opacity-20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF6B35]/10 rounded-full blur-3xl animate-cloud-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-3xl animate-cloud-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white font-mono mb-2">
            <span className="gradient-text-cyan">エンジニア</span>
            <span className="text-[#FF6B35]">検索</span>
          </h1>
          <p className="text-[#E8EEF7]/80">条件に合うエンジニアを検索してスカウトを送信できます</p>
        </div>

        {/* 検索フィルター */}
        <div className="glass-dark rounded-2xl shadow-2xl p-6 mb-6 border border-[#00E5FF]/20 animate-slide-down">
          <h2 className="text-xl font-bold text-white mb-4">検索条件</h2>

          <div className="space-y-6">
            {/* AWS資格 */}
            <div>
              <label className="block text-sm font-medium text-[#E8EEF7] mb-3">
                AWS資格
              </label>
              <div className="space-y-3 max-h-64 overflow-y-auto border border-[#00E5FF]/20 rounded-lg bg-[#0A1628]/30 p-4">
                {['Foundational', 'Associate', 'Professional', 'Specialty'].map(category => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-[#E8EEF7]/60 mb-2">{category}</h3>
                    <div className="space-y-1">
                      {AWS_CERTIFICATIONS.filter(c => c.category === category).map(cert => (
                        <label key={cert.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCertifications.includes(cert.name)}
                            onChange={() => handleCertificationToggle(cert.name)}
                            className="mr-2 h-4 w-4 text-[#00E5FF] bg-[#0A1628]/50 border-[#00E5FF]/30 rounded focus:ring-2 focus:ring-[#00E5FF]"
                          />
                          <span className="text-sm text-[#E8EEF7]">{cert.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 希望勤務地 */}
            <div>
              <label className="block text-sm font-medium text-[#E8EEF7] mb-2">
                希望勤務地
              </label>
              <input
                type="text"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                className="w-full px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="例: 東京、大阪、リモート"
              />
            </div>

            {/* スキルレベル */}
            <div>
              <label className="block text-sm font-medium text-[#E8EEF7] mb-2">
                スキルレベル
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value as any)}
                className="w-full px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">すべて</option>
                <option value="beginner">初級</option>
                <option value="intermediate">中級</option>
                <option value="advanced">上級</option>
                <option value="expert">エキスパート</option>
              </select>
            </div>

            {/* 希望時給 */}
            <div>
              <label className="block text-sm font-medium text-[#E8EEF7] mb-2">
                希望時給（円）
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="number"
                  value={minHourlyRate}
                  onChange={(e) => setMinHourlyRate(e.target.value ? parseInt(e.target.value) : '')}
                  className="flex-1 px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="下限"
                  min="0"
                />
                <span>〜</span>
                <input
                  type="number"
                  value={maxHourlyRate}
                  onChange={(e) => setMaxHourlyRate(e.target.value ? parseInt(e.target.value) : '')}
                  className="flex-1 px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="上限"
                  min="0"
                />
              </div>
            </div>

            {/* 希望月額単価 */}
            <div>
              <label className="block text-sm font-medium text-[#E8EEF7] mb-2">
                希望月額単価（円）
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="number"
                  value={minMonthlyRate}
                  onChange={(e) => setMinMonthlyRate(e.target.value ? parseInt(e.target.value) : '')}
                  className="flex-1 px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="下限"
                  min="0"
                />
                <span>〜</span>
                <input
                  type="number"
                  value={maxMonthlyRate}
                  onChange={(e) => setMaxMonthlyRate(e.target.value ? parseInt(e.target.value) : '')}
                  className="flex-1 px-4 py-2 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="上限"
                  min="0"
                />
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full btn-primary py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  検索中...
                </span>
              ) : '検索'}
            </button>
          </div>
        </div>

        {/* 検索結果 */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {!loading && hasSearched && (
          <>
            <div className="mb-4">
              <p className="text-[#00E5FF] font-mono">
                {searchResults.length}件のエンジニアが見つかりました
              </p>
            </div>

            {searchResults.length === 0 ? (
              <div className="glass-dark p-12 rounded-2xl border border-[#00E5FF]/20 text-center animate-slide-up">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF6B35]/10 mb-4">
                  <svg className="w-8 h-8 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-[#E8EEF7] text-lg">条件に合うエンジニアが見つかりませんでした</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 mb-6">
                  {currentItems.map((engineer) => (
                    <div
                      key={engineer.userId}
                      className="glass-dark rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border border-[#00E5FF]/20 card-hover animate-slide-up"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* アバター */}
                          <div className="w-16 h-16 bg-[#2C4875]/30 rounded-full flex items-center justify-center flex-shrink-0 border border-[#00E5FF]/20">
                            {engineer.avatar ? (
                              <img
                                src={engineer.avatar}
                                alt={engineer.displayName}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl text-[#00E5FF] font-bold">
                                {engineer.displayName.charAt(0)}
                              </span>
                            )}
                          </div>

                          {/* 基本情報 */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-white">{engineer.displayName}</h3>
                            </div>

                            {/* 勤務地 */}
                            {(engineer.location || engineer.preferredLocation) && (
                              <div className="mb-2 text-sm text-[#E8EEF7]/80">
                                <span className="inline-flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  {engineer.preferredLocation || engineer.location}
                                </span>
                              </div>
                            )}

                            {/* 保有資格 */}
                            {engineer.certifications && engineer.certifications.length > 0 && (
                              <div className="mb-3">
                                <h4 className="text-sm font-semibold text-[#E8EEF7] mb-2">保有資格</h4>
                                <div className="flex flex-wrap gap-2">
                                  {engineer.certifications.map((cert, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 badge-cyan rounded-full text-xs font-medium"
                                    >
                                      {cert.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 単価情報 */}
                            <div className="flex flex-wrap gap-4 text-sm text-[#E8EEF7]/80">
                              {engineer.hourlyRate && (engineer.hourlyRate.min || engineer.hourlyRate.max) && (
                                <div>
                                  <span className="font-semibold">希望時給: </span>
                                  {engineer.hourlyRate.min && `¥${engineer.hourlyRate.min.toLocaleString()}`}
                                  {engineer.hourlyRate.min && engineer.hourlyRate.max && ' 〜 '}
                                  {engineer.hourlyRate.max && `¥${engineer.hourlyRate.max.toLocaleString()}`}
                                </div>
                              )}
                              {engineer.desiredMonthlyRate && (engineer.desiredMonthlyRate.min || engineer.desiredMonthlyRate.max) && (
                                <div>
                                  <span className="font-semibold">希望月額: </span>
                                  {engineer.desiredMonthlyRate.min && `¥${engineer.desiredMonthlyRate.min.toLocaleString()}`}
                                  {engineer.desiredMonthlyRate.min && engineer.desiredMonthlyRate.max && ' 〜 '}
                                  {engineer.desiredMonthlyRate.max && `¥${engineer.desiredMonthlyRate.max.toLocaleString()}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* アクションボタン */}
                        <div className="flex gap-2 ml-4">
                          <Link
                            to={`/users/${engineer.userId}`}
                            state={{
                              from: '/scouts/search',
                              searchState: {
                                searchResults,
                                selectedCertifications,
                                preferredLocation,
                                skillLevel,
                                minHourlyRate,
                                maxHourlyRate,
                                minMonthlyRate,
                                maxMonthlyRate,
                                hasSearched,
                                currentPage
                              }
                            }}
                            className="px-4 py-2 bg-[#1A2942]/80 text-[#E8EEF7] border border-[#00E5FF]/20 rounded-lg hover:bg-[#2C4875] transition-all duration-300 font-semibold"
                          >
                            詳細
                          </Link>
                          <button
                            onClick={() => handleScoutClick(engineer)}
                            className="btn-primary px-4 py-2 rounded-lg font-semibold"
                          >
                            スカウト
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {searchResults.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* スカウトモーダル */}
      {selectedEngineer && (
        <ScoutModal
          isOpen={scoutModalOpen}
          onClose={() => {
            setScoutModalOpen(false)
            setSelectedEngineer(null)
          }}
          engineer={selectedEngineer}
          onSuccess={handleScoutSuccess}
        />
      )}
    </div>
  )
}

export default EngineerSearch
