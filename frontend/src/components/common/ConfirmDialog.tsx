interface ConfirmDialogProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmButtonClass?: string
  onConfirm: () => void
  onCancel: () => void
  isOpen: boolean
}

function ConfirmDialog({
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  confirmButtonClass = 'bg-primary-600 hover:bg-primary-700',
  onConfirm,
  onCancel,
  isOpen,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-scale-in">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-700 whitespace-pre-wrap mb-6">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-white py-3 rounded-lg font-semibold transition ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
