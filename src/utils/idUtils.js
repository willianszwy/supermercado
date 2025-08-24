/**
 * Gera um ID único e seguro para produtos e carrinho
 * @returns {string} ID único no formato timestamp-random
 */
export const generateUniqueId = () => {
  // Usar crypto.randomUUID() se disponível (browsers modernos)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback para browsers mais antigos
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const moreRandom = Math.random().toString(36).substring(2, 15)
  
  return `${timestamp}-${random}${moreRandom}`
}

/**
 * Verifica se um ID é válido
 * @param {string} id - ID para verificar
 * @returns {boolean} True se o ID é válido
 */
export const isValidId = (id) => {
  if (!id || typeof id !== 'string') return false
  
  // UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(id)) return true
  
  // Timestamp-random format
  const timestampRandomRegex = /^\d{13}-[a-z0-9]{20,}$/
  return timestampRandomRegex.test(id)
}