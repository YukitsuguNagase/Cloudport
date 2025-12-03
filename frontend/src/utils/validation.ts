// Validation utility functions

export interface ValidationResult {
  isValid: boolean
  error?: string
}

// String length validation
export const validateStringLength = (
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): ValidationResult => {
  const trimmedValue = value.trim()

  if (trimmedValue.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName}は${minLength}文字以上で入力してください`
    }
  }

  if (trimmedValue.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName}は${maxLength}文字以内で入力してください`
    }
  }

  return { isValid: true }
}

// Number range validation
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult => {
  if (value < min) {
    return {
      isValid: false,
      error: `${fieldName}は${min}以上で入力してください`
    }
  }

  if (value > max) {
    return {
      isValid: false,
      error: `${fieldName}は${max}以下で入力してください`
    }
  }

  return { isValid: true }
}

// Budget range validation (min should not be greater than max)
export const validateBudgetRange = (
  minBudget: number | '',
  maxBudget: number | ''
): ValidationResult => {
  // Only validate that min is not greater than max
  if (minBudget !== '' && maxBudget !== '') {
    if (minBudget > maxBudget) {
      return {
        isValid: false,
        error: '予算の下限が上限を超えています'
      }
    }
  }

  // Validate that values are positive
  if (minBudget !== '' && minBudget < 0) {
    return {
      isValid: false,
      error: '予算下限は0以上で入力してください'
    }
  }

  if (maxBudget !== '' && maxBudget < 0) {
    return {
      isValid: false,
      error: '予算上限は0以上で入力してください'
    }
  }

  return { isValid: true }
}

// XSS sanitization - escape HTML special characters
export const sanitizeHtml = (input: string): string => {
  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

// Sanitize input
export const sanitizeInput = (input: string): string => {
  // Trim whitespace
  let sanitized = input.trim()

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  return sanitized
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: '有効なメールアドレスを入力してください'
    }
  }

  return { isValid: true }
}

// Required field validation
export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return {
      isValid: false,
      error: `${fieldName}は必須項目です`
    }
  }

  if (typeof value === 'string' && value.trim() === '') {
    return {
      isValid: false,
      error: `${fieldName}は必須項目です`
    }
  }

  return { isValid: true }
}

// Job form validation
export const validateJobForm = (data: {
  title: string
  description: string
  budgetMin?: number | ''
  budgetMax?: number | ''
}): ValidationResult => {
  // Title validation
  const titleValidation = validateStringLength(data.title, 1, 100, 'タイトル')
  if (!titleValidation.isValid) return titleValidation

  // Description validation
  const descriptionValidation = validateStringLength(data.description, 1, 5000, '案件詳細')
  if (!descriptionValidation.isValid) return descriptionValidation

  // Budget validation
  if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
    const budgetValidation = validateBudgetRange(data.budgetMin, data.budgetMax)
    if (!budgetValidation.isValid) return budgetValidation
  }

  return { isValid: true }
}

// Profile form validation
export const validateProfileForm = (data: {
  name: string
  bio?: string
  hourlyRate?: number
}): ValidationResult => {
  // Name validation
  const nameValidation = validateStringLength(data.name, 1, 100, '名前')
  if (!nameValidation.isValid) return nameValidation

  // Bio validation (optional)
  if (data.bio) {
    const bioValidation = validateStringLength(data.bio, 0, 2000, '自己紹介')
    if (!bioValidation.isValid) return bioValidation
  }

  // Hourly rate validation (optional)
  if (data.hourlyRate !== undefined) {
    const rateValidation = validateNumberRange(data.hourlyRate, 1000, 50000, '時給')
    if (!rateValidation.isValid) return rateValidation
  }

  return { isValid: true }
}

// Application message validation
export const validateApplicationMessage = (message: string): ValidationResult => {
  const validation = validateStringLength(message, 10, 2000, '応募メッセージ')
  if (!validation.isValid) return validation

  return { isValid: true }
}

// Chat message validation
export const validateChatMessage = (message: string): ValidationResult => {
  const validation = validateStringLength(message, 1, 1000, 'メッセージ')
  if (!validation.isValid) return validation

  return { isValid: true }
}
