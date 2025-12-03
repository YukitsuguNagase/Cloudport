interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  fullScreen?: boolean
}

function LoadingSpinner({ size = 'medium', fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-4',
    large: 'w-16 h-16 border-4',
  }

  const spinner = (
    <div className={`${sizeClasses[size]} border-primary-600 border-t-transparent rounded-full animate-spin`}></div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return <div className="flex justify-center items-center py-8">{spinner}</div>
}

export default LoadingSpinner
