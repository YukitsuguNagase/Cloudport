import { useEffect } from 'react'
import { Job } from '../../types/job'
import JobDetailContent from './JobDetailContent'

interface JobDetailModalProps {
    isOpen: boolean
    onClose: () => void
    job: Job | null
    isOwner: boolean
    hasApplied: boolean
    onApplySuccess: () => void
    loading?: boolean
}

function JobDetailModal({
    isOpen,
    onClose,
    job,
    isOwner,
    hasApplied,
    onApplySuccess,
    loading = false
}: JobDetailModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4"
            onClick={onClose}
        >
            <div
                className="glass-dark border border-[#00E5FF]/30 rounded-2xl shadow-2xl w-full max-w-4xl animate-scale-in relative flex flex-col max-h-[90vh] min-h-[50vh]"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#E8EEF7]/60 hover:text-white transition-colors z-20"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00E5FF]"></div>
                    </div>
                ) : job ? (
                    <div className="overflow-y-auto custom-scrollbar p-1 rounded-2xl">
                        <JobDetailContent
                            job={job}
                            isOwner={isOwner}
                            hasApplied={hasApplied}
                            onApplySuccess={onApplySuccess}
                            isModal={true}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-[#E8EEF7]/60">
                        案件が見つかりません
                    </div>
                )}
            </div>
        </div>
    )
}

export default JobDetailModal
