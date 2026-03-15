import { describe, it, expect } from 'vitest'
import { computeSmartList, getScoreReason } from '../smartListUtils'

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()

function makeCart(items, daysAgoN) {
  return {
    id: `cart-${daysAgoN}`,
    finishedAt: daysAgo(daysAgoN),
    items: items.map(item => ({ ...item, status: item.status || 'completed', addedAt: daysAgo(daysAgoN) }))
  }
}

describe('computeSmartList', () => {
  it('retorna [] para histórico vazio', () => {
    expect(computeSmartList([])).toEqual([])
    expect(computeSmartList(null)).toEqual([])
  })

  it('retorna produtos com score e confidence', () => {
    const history = [
      makeCart([{ id: '1', name: 'Arroz', quantity: 1, category: 'mercearia', price: 7 }], 8)
    ]
    const result = computeSmartList(history)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('score')
    expect(result[0]).toHaveProperty('confidence')
    expect(result[0].confidence).toBeGreaterThanOrEqual(0)
    expect(result[0].confidence).toBeLessThanOrEqual(100)
  })

  it('produto comprado em todos os carrinhos tem frequência máxima', () => {
    const history = [
      makeCart([{ id: '1', name: 'Arroz', quantity: 1, category: 'mercearia', price: 7 }], 8),
      makeCart([{ id: '2', name: 'Arroz', quantity: 1, category: 'mercearia', price: 7 }], 16),
      makeCart([{ id: '3', name: 'Arroz', quantity: 1, category: 'mercearia', price: 7 }], 24),
    ]
    const result = computeSmartList(history)
    const arroz = result.find(p => p.name === 'Arroz')
    expect(arroz).toBeDefined()
    expect(arroz.appearances).toBe(3)
    // frequência = 3/3 = 1.0
  })

  it('produto comprado recentemente tem urgência baixa', () => {
    const history = [
      makeCart([{ id: '1', name: 'Leite', quantity: 2, category: 'laticinios', price: 5 }], 1), // comprado ontem
    ]
    const result = computeSmartList(history)
    const leite = result.find(p => p.name === 'Leite')
    if (leite) {
      // urgência = 1 dia / 7 dias default ≈ 0.14 → score baixo
      expect(leite.score).toBeLessThan(0.5)
    }
  })

  it('produto atrasado (passou do intervalo médio) tem score maior', () => {
    // Comprado a cada 7 dias, mas a última foi há 14 dias
    const history = [
      makeCart([{ id: '1', name: 'Pão', quantity: 1, category: 'padaria', price: 5 }], 14),
      makeCart([{ id: '2', name: 'Pão', quantity: 1, category: 'padaria', price: 5 }], 21),
    ]
    const result = computeSmartList(history)
    const pao = result.find(p => p.name === 'Pão')
    expect(pao).toBeDefined()
    // Intervalo médio = 7 dias, última compra há 14 dias → urgência = 14/7 = 2.0 (máx)
    expect(pao.score).toBeGreaterThan(0.5)
  })

  it('produto marcado como missing tem boost de score', () => {
    const historyNormal = [
      makeCart([{ id: '1', name: 'Frango', quantity: 1, category: 'acougue', price: 15, status: 'completed' }], 8),
    ]
    const historyMissing = [
      makeCart([{ id: '1', name: 'Frango', quantity: 1, category: 'acougue', price: 15, status: 'missing' }], 8),
    ]
    const normalResult = computeSmartList(historyNormal)
    const missingResult = computeSmartList(historyMissing)

    const normal = normalResult.find(p => p.name === 'Frango')
    const missing = missingResult.find(p => p.name === 'Frango')

    expect(missing.score).toBeGreaterThan(normal.score)
  })

  it('resultado ordenado por score decrescente', () => {
    const history = [
      makeCart([
        { id: '1', name: 'Arroz', quantity: 1, category: 'mercearia', price: 7 },
        { id: '2', name: 'Feijão', quantity: 1, category: 'mercearia', price: 8 },
      ], 15),
      makeCart([
        { id: '3', name: 'Arroz', quantity: 1, category: 'mercearia', price: 7 },
      ], 30),
    ]
    const result = computeSmartList(history)
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score)
    }
  })

  it('produtos com score abaixo do mínimo são filtrados', () => {
    // Produto comprado há 1 dia com intervalo médio de 30 dias → urgência baixíssima
    const history = [
      makeCart([
        { id: '1', name: 'Recente', quantity: 1, category: 'geral', price: 0 },
        { id: '2', name: 'Recente', quantity: 1, category: 'geral', price: 0 },
      ], 0), // comprado hoje
    ]
    const result = computeSmartList(history)
    const recente = result.find(p => p.name === 'Recente')
    // Pode ser filtrado por score < 0.15
    if (recente) {
      expect(recente.score).toBeGreaterThanOrEqual(0.15)
    }
  })

  it('retorna quantidade e preço do produto mais recente', () => {
    const history = [
      makeCart([{ id: '1', name: 'Sal', quantity: 1, category: 'mercearia', price: 2 }], 20),
      makeCart([{ id: '2', name: 'Sal', quantity: 2, category: 'mercearia', price: 3 }], 10),
    ]
    const result = computeSmartList(history)
    const sal = result.find(p => p.name === 'Sal')
    expect(sal).toBeDefined()
    expect(sal.quantity).toBe(2) // dado mais recente
  })
})

describe('getScoreReason', () => {
  it('menciona "Faltou" quando missingCount é alto', () => {
    const product = { daysSinceLast: 7, avgDaysBetween: 7, missingCount: 2, appearances: 3, totalCarts: 3 }
    const reason = getScoreReason(product)
    expect(reason).toContain('Faltou')
  })

  it('menciona "Atrasado" quando passou do intervalo médio', () => {
    const product = { daysSinceLast: 20, avgDaysBetween: 7, missingCount: 0, appearances: 3, totalCarts: 3 }
    const reason = getScoreReason(product)
    expect(reason).toContain('Atrasado')
  })

  it('menciona "Na hora" quando está no intervalo ideal', () => {
    const product = { daysSinceLast: 7, avgDaysBetween: 7, missingCount: 0, appearances: 2, totalCarts: 3 }
    const reason = getScoreReason(product)
    expect(reason).toContain('Na hora')
  })
})
