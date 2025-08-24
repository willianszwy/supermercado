// Utilitários para formatação e parsing de valores monetários

/**
 * Formatar número para exibição como moeda brasileira
 * @param {number} value - Valor numérico
 * @returns {string} - Valor formatado (ex: "R$ 12,50")
 */
export const formatPrice = (value) => {
  if (!value || isNaN(value)) return 'R$ 0,00'
  
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

/**
 * Formatar número para exibição simples sem símbolo
 * @param {number} value - Valor numérico
 * @returns {string} - Valor formatado (ex: "12,50")
 */
export const formatPriceSimple = (value) => {
  if (!value || isNaN(value)) return '0,00'
  
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Converter string formatada para número
 * @param {string} formattedValue - Valor formatado (ex: "12,50" ou "R$ 12,50")
 * @returns {number} - Valor numérico
 */
export const parsePrice = (formattedValue) => {
  if (!formattedValue || typeof formattedValue !== 'string') return 0
  
  // Remove símbolos de moeda, espaços e caracteres não numéricos, exceto vírgula e ponto
  const cleanValue = formattedValue
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '') // Remove pontos de milhares
    .replace(',', '.') // Substitui vírgula decimal por ponto
  
  const numericValue = parseFloat(cleanValue)
  return isNaN(numericValue) ? 0 : numericValue
}

/**
 * Aplicar máscara de valor monetário em campo de input
 * @param {string} value - Valor atual do input
 * @returns {string} - Valor com máscara aplicada
 */
export const applyPriceMask = (value) => {
  if (!value) return ''
  
  // Remove tudo que não é dígito
  const numericValue = value.replace(/\D/g, '')
  
  if (!numericValue) return ''
  
  // Converte para número considerando os últimos dois dígitos como centavos
  const number = parseFloat(numericValue) / 100
  
  if (isNaN(number)) return ''
  
  return formatPriceSimple(number)
}

/**
 * Converter valor com máscara para número
 * @param {string} maskedValue - Valor com máscara (ex: "12,50")
 * @returns {number} - Valor numérico
 */
export const parseMaskedPrice = (maskedValue) => {
  return parsePrice(maskedValue)
}

/**
 * Verificar se um valor é um preço válido
 * @param {any} value - Valor a ser verificado
 * @returns {boolean} - True se é um preço válido
 */
export const isValidPrice = (value) => {
  const numericValue = typeof value === 'string' ? parsePrice(value) : value
  return !isNaN(numericValue) && numericValue >= 0
}