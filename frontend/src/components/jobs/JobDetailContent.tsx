import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Job } from '../../types/job'
import { applyToJob } from '../../services/applications'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import { sanitizeInput, validateApplicationMessage } from '../../utils/validation'
import LoginRequestModal from '../../components/auth/LoginRequestModal'

interface JobDetailContentProps {
    job: Job
    isOwner: boolean
    hasApplied: boolean
    onApplySuccess: () => void
    isModal?: boolean
}

function JobDetailContent({
    job,
    isOwner,
    hasApplied,
    onApplySuccess,
    isModal = false,
    backLink
}: JobDetailContentProps & { backLink?: React.ReactNode }) {
    const { user } = useAuth()
    const { showSuccess, showError } = useToast()

    const [showApplicationModal, setShowApplicationModal] = useState(false)
    const [applicationMessage, setApplicationMessage] = useState('')
    const [applying, setApplying] = useState(false)
    const [applicationError, setApplicationError] = useState('')
    const [showLoginModal, setShowLoginModal] = useState(false)

    const handleApply = async () => {
        // Validate application message
        const validation = validateApplicationMessage(applicationMessage)
        if (!validation.isValid) {
            setApplicationError(validation.error!)
            showError(validation.error!)
            return
        }

        setApplying(true)
        setApplicationError('')

        try {
            await applyToJob(job.jobId, { message: sanitizeInput(applicationMessage) })
            setShowApplicationModal(false)
            setApplicationMessage('')
            showSuccess('応募が完了しました')
            onApplySuccess()
        } catch (err: any) {
            const errorMessage = err.message || '応募に失敗しました'
            setApplicationError(errorMessage)
            showError(errorMessage)
        } finally {
            setApplying(false)
        }
    }

    return (
        <div className={isModal ? "" : "container mx-auto px-4 py-8 max-w-4xl relative z-10 flex-1"}>
            {!isModal && backLink && (
                <div className="mb-6 animate-slide-down">
                    {backLink}
                </div>
            )}

            <div className={`glass-dark rounded-2xl border border-[#00E5FF]/20 shadow-2xl p-4 md:p-8 animate-slide-up ${isModal ? "border-0 shadow-none bg-transparent" : ""}`}>
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white mb-2 font-mono">{job.title}</h1>
                        {job.companyName && (
                            <p className="text-lg text-[#E8EEF7] mb-3">企業: {job.companyName}</p>
                        )}
                        <div className="flex gap-4 text-sm text-[#E8EEF7]/60">
                            <span>掲載日: {new Date(job.createdAt).toLocaleDateString()}</span>
                            <span>応募数: {job.applicationCount}件</span>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'open'
                                    ? 'badge-success'
                                    : job.status === 'filled'
                                        ? 'bg-[#E8EEF7]/20 text-[#E8EEF7]/60 border border-[#E8EEF7]/30'
                                        : 'badge-danger'
                                    }`}
                            >
                                {job.status === 'open' ? '募集中' : job.status === 'filled' ? '募集終了' : 'クローズ'}
                            </span>
                        </div>
                    </div>
                    {isOwner && (
                        <div className="flex gap-2 flex-wrap">
                            <Link
                                to={`/jobs/${job.jobId}/edit`}
                                className="bg-[#E8EEF7]/10 border border-[#E8EEF7]/30 text-[#E8EEF7] px-4 py-2 rounded-lg hover:bg-[#E8EEF7]/20 transition-all duration-300 font-semibold"
                            >
                                編集
                            </Link>
                            <Link
                                to={`/jobs/${job.jobId}/applicants`}
                                className="bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all duration-300 font-semibold"
                            >
                                応募者一覧
                            </Link>
                        </div>
                    )}
                    {user?.userType === 'engineer' && job.status === 'open' && hasApplied ? (
                        <button
                            disabled
                            className="bg-[#E8EEF7]/10 border border-[#E8EEF7]/30 text-[#E8EEF7]/60 px-6 py-2 rounded-lg cursor-not-allowed"
                        >
                            応募済み
                        </button>
                    ) : (!user || (user.userType === 'engineer' && job.status === 'open')) && (
                        <button
                            onClick={() => {
                                if (!user) {
                                    setShowLoginModal(true)
                                } else {
                                    setShowApplicationModal(true)
                                }
                            }}
                            className="bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all duration-300 font-semibold"
                        >
                            応募する
                        </button>
                    )}
                </div>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-3">案件概要</h2>
                        <p className="text-[#E8EEF7] whitespace-pre-wrap leading-relaxed">{job.description}</p>
                    </div>

                    {job.location && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3">勤務地</h2>
                            <p className="text-[#E8EEF7]">{job.location}</p>
                        </div>
                    )}

                    <div>
                        <h2 className="text-xl font-bold text-white mb-3">主要AWSサービス</h2>
                        <div className="flex flex-wrap gap-2">
                            {job.requirements.awsServices.map((service) => (
                                <span
                                    key={service}
                                    className="px-3 py-1 bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] rounded-full text-sm font-medium"
                                >
                                    {service}
                                </span>
                            ))}
                        </div>
                    </div>

                    {job.requirements.certifications && job.requirements.certifications.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3">必要なAWS資格</h2>
                            <div className="flex flex-wrap gap-2">
                                {job.requirements.certifications.map((cert, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-[#FF6B35]/20 border border-[#FF6B35]/40 text-[#FF6B35] rounded-full text-sm font-medium"
                                    >
                                        {cert}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {job.requirements.experience && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3">必要な経験</h2>
                            <p className="text-[#E8EEF7]">{job.requirements.experience}</p>
                        </div>
                    )}

                    {job.requirements.requiredSkills && job.requirements.requiredSkills.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3">必須スキル</h2>
                            <ul className="list-disc list-inside space-y-1 text-[#E8EEF7]">
                                {job.requirements.requiredSkills.map((skill, index) => (
                                    <li key={index}>{skill}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {job.requirements.preferredSkills && job.requirements.preferredSkills.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3">歓迎スキル</h2>
                            <ul className="list-disc list-inside space-y-1 text-[#E8EEF7]">
                                {job.requirements.preferredSkills.map((skill, index) => (
                                    <li key={index}>{skill}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <h2 className="text-xl font-bold text-white mb-3">期間</h2>
                        <p className="text-[#E8EEF7]">
                            {job.duration.type === 'spot' ? 'スポット' : job.duration.type === 'short' ? '短期' : '長期'}
                            {job.duration.type !== 'spot' && job.duration.months && ` (${job.duration.months}ヶ月)`}
                        </p>
                    </div>

                    {job.budget && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3">
                                {job.duration.type === 'spot' ? '予算' : '月額単価'}
                            </h2>
                            <p className="text-[#E8EEF7] text-lg font-semibold">
                                {job.budget.min?.toLocaleString()}円 〜 {job.budget.max?.toLocaleString()}円
                                {job.duration.type !== 'spot' && '/月'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Application Modal */}
            {showApplicationModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="glass-dark border border-[#00E5FF]/30 rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 animate-scale-in">
                        <h2 className="text-2xl font-bold text-white mb-4 font-mono">案件に応募する</h2>

                        {applicationError && (
                            <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-[#FF6B35] p-4 rounded-lg mb-4">
                                {applicationError}
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[#E8EEF7] mb-2">
                                応募メッセージ <span className="text-[#FF6B35]">*</span>
                            </label>
                            <textarea
                                value={applicationMessage}
                                onChange={(e) => setApplicationMessage(e.target.value)}
                                rows={8}
                                className="w-full px-4 py-3 bg-[#0A1628]/50 border border-[#00E5FF]/20 rounded-lg text-white placeholder-[#E8EEF7]/40 focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all duration-300"
                                placeholder="自己PRやこの案件に応募する理由を記載してください"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowApplicationModal(false)
                                    setApplicationMessage('')
                                    setApplicationError('')
                                }}
                                className="flex-1 bg-[#E8EEF7]/10 border border-[#E8EEF7]/30 text-[#E8EEF7] py-3 rounded-lg font-semibold hover:bg-[#E8EEF7]/20 transition-all duration-300"
                                disabled={applying}
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={applying}
                                className="flex-1 bg-gradient-to-r from-[#00E5FF] to-[#5B8DEF] text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all duration-300 disabled:opacity-50"
                            >
                                {applying ? '応募中...' : '応募する'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <LoginRequestModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                message="案件に応募するには、エンジニアとしてログインが必要です"
            />
        </div>
    )
}

export default JobDetailContent
