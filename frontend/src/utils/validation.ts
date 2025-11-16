export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): {
  valid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('パスワードは8文字以上にしてください')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('大文字を1文字以上含めてください')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('小文字を1文字以上含めてください')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('数字を1文字以上含めてください')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0
}

export const validateNumber = (value: string): boolean => {
  return !isNaN(Number(value)) && value.trim() !== ''
}

export const validatePositiveNumber = (value: string): boolean => {
  return validateNumber(value) && Number(value) > 0
}
