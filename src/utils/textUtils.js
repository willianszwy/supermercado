/**
 * Normaliza o texto do produto para ficar apresentável
 * @param {string} text - Texto a ser normalizado
 * @returns {string} - Texto normalizado
 */
export function normalizeProductText(text) {
  if (!text || typeof text !== 'string') return ''
  
  return text
    .trim() // Remove espaços extras no início e fim
    .toLowerCase() // Converte para minúsculo primeiro
    .split(' ') // Divide em palavras
    .map(word => {
      if (word.length === 0) return ''
      // Capitaliza primeira letra de cada palavra
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .filter(word => word.length > 0) // Remove palavras vazias
    .join(' ') // Junta as palavras com um espaço
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
}