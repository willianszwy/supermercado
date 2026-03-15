import { describe, it, expect } from 'vitest'
import { formatPrice, formatPriceSimple, parsePrice, isValidPrice } from '../priceUtils'

describe('formatPrice', () => {
  it('formata um preço normal', () => {
    const result = formatPrice(12.5)
    expect(result).toContain('12')
    expect(result).toContain('50')
  })

  it('não trata zero como ausente (regressão)', () => {
    const result = formatPrice(0)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
    // Deve conter 0,00
    expect(result).toMatch(/0[,.]00/)
  })

  it('retorna fallback para null', () => {
    expect(formatPrice(null)).toBe('R$ 0,00')
  })

  it('retorna fallback para undefined', () => {
    expect(formatPrice(undefined)).toBe('R$ 0,00')
  })

  it('retorna fallback para NaN', () => {
    expect(formatPrice(NaN)).toBe('R$ 0,00')
  })
})

describe('formatPriceSimple', () => {
  it('formata zero corretamente', () => {
    const result = formatPriceSimple(0)
    expect(result).toMatch(/0[,.]00/)
  })

  it('formata 1.5 com duas casas decimais', () => {
    const result = formatPriceSimple(1.5)
    expect(result).toMatch(/1[,.]50/)
  })

  it('retorna fallback para null', () => {
    expect(formatPriceSimple(null)).toBe('0,00')
  })
})

describe('parsePrice', () => {
  it('parseia string numérica simples (pt-BR: ponto é separador de milhar)', () => {
    // parsePrice remove pontos como separadores de milhar (padrão pt-BR)
    // então '1.250' → 1250, e '12' → 12
    expect(parsePrice('12')).toBe(12)
    expect(parsePrice('1250')).toBe(1250)
  })

  it('parseia formato brasileiro com vírgula', () => {
    expect(parsePrice('12,50')).toBe(12.5)
  })

  it('parseia string com prefixo R$', () => {
    expect(parsePrice('R$ 12,50')).toBe(12.5)
  })

  it('retorna 0 para string vazia', () => {
    expect(parsePrice('')).toBe(0)
  })
})

describe('isValidPrice', () => {
  it('aceita zero como válido', () => {
    expect(isValidPrice(0)).toBe(true)
  })

  it('aceita preços positivos', () => {
    expect(isValidPrice(9.99)).toBe(true)
  })

  it('rejeita negativos', () => {
    expect(isValidPrice(-1)).toBe(false)
  })
})
