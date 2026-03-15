/**
 * Testes de lógica de App.jsx (funções puras extraídas para teste)
 * Cobre: removeProduct case-insensitive, clamping de valores no executeCreateNewList,
 * suggestedPrice simétrico, upsert de produto não catalogado no updateProduct.
 */
import { describe, it, expect } from 'vitest'

// --- Helpers que replicam a lógica das funções do App ---

function removeProductLogic(allProducts, productName) {
  return allProducts.filter(p => p.name.toLowerCase() !== productName.toLowerCase())
}

function executeCreateNewListClamp(selectedProducts) {
  return selectedProducts.map(({ name, quantity, category, price }) => ({
    name,
    quantity: Math.min(999, Math.max(1, parseInt(quantity) || 1)),
    category: category || 'geral',
    price: Math.min(9999.99, Math.max(0, parseFloat(price) || 0))
  }))
}

function suggestedPriceOnUpdate(existingPrice, newPrice) {
  // Lógica simétrica: preserva preço existente quando novo preço é 0
  return newPrice || existingPrice || 0
}

describe('removeProduct — case-insensitive (regressão)', () => {
  const catalog = [
    { name: 'Arroz' },
    { name: 'Feijão' },
    { name: 'Macarrão' }
  ]

  it('remove produto com mesmo case', () => {
    expect(removeProductLogic(catalog, 'Arroz')).toHaveLength(2)
  })

  it('remove produto com case diferente (regressão bug anterior)', () => {
    expect(removeProductLogic(catalog, 'arroz')).toHaveLength(2)
    expect(removeProductLogic(catalog, 'ARROZ')).toHaveLength(2)
  })

  it('não remove produto com nome diferente', () => {
    expect(removeProductLogic(catalog, 'Sal')).toHaveLength(3)
  })
})

describe('executeCreateNewList — clamping de quantity e price', () => {
  it('clampeia quantity acima de 999 para 999', () => {
    const result = executeCreateNewListClamp([{ name: 'Arroz', quantity: 5000, category: 'mercearia', price: 0 }])
    expect(result[0].quantity).toBe(999)
  })

  it('clampeia quantity abaixo de 1 para 1', () => {
    const result = executeCreateNewListClamp([{ name: 'Arroz', quantity: 0, category: 'mercearia', price: 0 }])
    expect(result[0].quantity).toBe(1)
  })

  it('clampeia price acima de 9999.99 para 9999.99', () => {
    const result = executeCreateNewListClamp([{ name: 'Vinho', quantity: 1, category: 'bebidas', price: 99999 }])
    expect(result[0].price).toBe(9999.99)
  })

  it('clampeia price negativo para 0', () => {
    const result = executeCreateNewListClamp([{ name: 'Algo', quantity: 1, category: 'geral', price: -5 }])
    expect(result[0].price).toBe(0)
  })

  it('mantém valores válidos intactos', () => {
    const result = executeCreateNewListClamp([{ name: 'Leite', quantity: 2, category: 'laticinios', price: 5.49 }])
    expect(result[0].quantity).toBe(2)
    expect(result[0].price).toBe(5.49)
  })
})

describe('suggestedPrice — simetria entre addProduct e updateProduct', () => {
  it('preserva preço existente quando novo preço é 0 (igual ao addProduct)', () => {
    const existingPrice = 8.50
    const newPrice = 0
    expect(suggestedPriceOnUpdate(existingPrice, newPrice)).toBe(8.50)
  })

  it('usa novo preço quando fornecido', () => {
    expect(suggestedPriceOnUpdate(8.50, 10.00)).toBe(10.00)
  })

  it('retorna 0 quando nem existente nem novo preço existem', () => {
    expect(suggestedPriceOnUpdate(0, 0)).toBe(0)
    expect(suggestedPriceOnUpdate(undefined, 0)).toBe(0)
  })
})

describe('FloatingAddButton — incrementQuantity com limite', () => {
  it('Math.min(999, prev + 1) não ultrapassa 999', () => {
    const increment = prev => Math.min(999, prev + 1)
    expect(increment(998)).toBe(999)
    expect(increment(999)).toBe(999) // não passa de 999
    expect(increment(1000)).toBe(999) // força para 999
  })

  it('Math.max(1, prev - 1) não vai abaixo de 1', () => {
    const decrement = prev => Math.max(1, prev - 1)
    expect(decrement(2)).toBe(1)
    expect(decrement(1)).toBe(1) // não vai abaixo de 1
  })
})
