// XSS and input validation utilities

export function sanitizeInput(input) {
  if (typeof input !== 'string') return ''
  
  return input
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove HTML tags (basic protection)
    .replace(/<[^>]*>/g, '')
    .trim()
}

export function validateProductName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Nome do produto é obrigatório' }
  }

  const sanitized = sanitizeInput(name)
  
  if (!sanitized) {
    return { valid: false, error: 'Nome do produto inválido' }
  }

  if (sanitized.length < 1) {
    return { valid: false, error: 'Nome do produto deve ter pelo menos 1 caractere' }
  }

  if (sanitized.length > 100) {
    return { valid: false, error: 'Nome do produto deve ter no máximo 100 caracteres' }
  }

  // Check for suspicious patterns
  if (/<script|javascript:|on\w+=/i.test(name)) {
    return { valid: false, error: 'Nome contém caracteres não permitidos' }
  }

  return { valid: true, value: sanitized }
}

export function validateQuantity(quantity) {
  if (quantity === undefined || quantity === null || quantity === '') {
    return { valid: false, error: 'Quantidade é obrigatória' }
  }

  const num = Number(quantity)
  
  if (isNaN(num)) {
    return { valid: false, error: 'Quantidade deve ser um número' }
  }

  if (num < 1) {
    return { valid: false, error: 'Quantidade deve ser pelo menos 1' }
  }

  if (num > 999) {
    return { valid: false, error: 'Quantidade deve ser no máximo 999' }
  }

  if (!Number.isInteger(num)) {
    return { valid: false, error: 'Quantidade deve ser um número inteiro' }
  }

  return { valid: true, value: num }
}

export function validatePrice(price) {
  // Price is optional
  if (price === undefined || price === null || price === '') {
    return { valid: true, value: 0 }
  }

  const num = Number(price)
  
  if (isNaN(num)) {
    return { valid: false, error: 'Preço deve ser um número' }
  }

  if (num < 0) {
    return { valid: false, error: 'Preço não pode ser negativo' }
  }

  if (num > 9999.99) {
    return { valid: false, error: 'Preço deve ser no máximo R$ 9.999,99' }
  }

  // Round to 2 decimal places
  const rounded = Math.round(num * 100) / 100

  return { valid: true, value: rounded }
}

export function validateCategory(category) {
  // Valid categories from the app
  const validCategories = [
    'geral', 'açougue', 'padaria', 'hortifruti', 'laticínios', 
    'bebidas', 'limpeza', 'higiene', 'mercearia', 'congelados', 'bomboneria'
  ]

  if (!category || typeof category !== 'string') {
    return { valid: false, error: 'Categoria é obrigatória' }
  }

  const normalizedCategory = category.toLowerCase().trim()

  if (!validCategories.includes(normalizedCategory)) {
    return { valid: false, error: 'Categoria inválida' }
  }

  return { valid: true, value: normalizedCategory }
}

export function validateProductInput({ name, quantity, price, category }) {
  const errors = {}
  let hasErrors = false

  // Validate name
  const nameValidation = validateProductName(name)
  if (!nameValidation.valid) {
    errors.name = nameValidation.error
    hasErrors = true
  }

  // Validate quantity
  const quantityValidation = validateQuantity(quantity)
  if (!quantityValidation.valid) {
    errors.quantity = quantityValidation.error
    hasErrors = true
  }

  // Validate price (optional)
  const priceValidation = validatePrice(price)
  if (!priceValidation.valid) {
    errors.price = priceValidation.error
    hasErrors = true
  }

  // Validate category
  const categoryValidation = validateCategory(category)
  if (!categoryValidation.valid) {
    errors.category = categoryValidation.error
    hasErrors = true
  }

  if (hasErrors) {
    return { 
      valid: false, 
      errors,
      error: Object.values(errors)[0] // Return first error for simple display
    }
  }

  return {
    valid: true,
    value: {
      name: nameValidation.value,
      quantity: quantityValidation.value,
      price: priceValidation.value,
      category: categoryValidation.value
    }
  }
}

// Additional security check for localStorage data
export function sanitizeStorageData(data) {
  if (!data || typeof data !== 'object') return data

  if (Array.isArray(data)) {
    return data.map(item => sanitizeStorageData(item))
  }

  const sanitized = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeStorageData(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}