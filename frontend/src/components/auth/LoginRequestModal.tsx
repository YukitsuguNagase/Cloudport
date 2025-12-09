import { Link } from 'react-router-dom'

interface LoginRequestModalProps {
    isOpen: boolean
    onClose: () => void
    message?: string
}

function LoginRequestModal({ isOpen, onClose, message = 'この機能を利用するにはログインが必要です' }: LoginRequestModalProps) {
    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4"
            onClick={onClose}
        >
            <div
                className="glass-dark border border-[#00E5FF]/30 rounded-2xl shadow-2xl w-full max-w-md p-8 animate-scale-in relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#E8EEF7]/60 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00E5FF]/10 mb-6">
                        <svg className="w-8 h-8 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">ログインが必要です</h2>
                    <p className="text-[#E8EEF7]/80">{message}</p>
                </div>

                <div className="space-y-4">
                    <Link
                        to="/login"
                        className="block w-full btn-primary py-3 rounded-lg font-semibold text-center"
                    >
                        ログインする
                    </Link>
                    <Link
                        to="/signup"
                        className="block w-full bg-[#E8EEF7]/10 border border-[#E8EEF7]/30 text-[#E8EEF7] py-3 rounded-lg font-semibold hover:bg-[#E8EEF7]/20 transition-all duration-300 text-center"
                    >
                        アカウントを作成する
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default LoginRequestModal
