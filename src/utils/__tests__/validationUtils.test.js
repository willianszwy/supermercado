import { describe, it, expect } from 'vitest'
import { validateCategory, validateProductInput, validateQuantity, validatePrice } from '../validationUtils'
import { CATEGORIES } from '../categories'

describe('validateCategory', () => {
  it('aceita todos os IDs válidos de CATEGORIES', () => {
    Object.keys(CATEGORIES).forEach(id => {
      const result = validateCategory(id)
      expect(result.valid, `categoria '${id}' deveria ser válida`).toBe(true)
      expect(result.value).toBe(id)
    })
  })

  it('rejeita as variantes antigas com diacríticos/grafia errada', () => {
    expect(validateCategory('açougue').valid).toBe(false)
    expect(validateCategory('laticínios').valid).toBe(false)
    expect(validateCategory('bomboneria').valid).toBe(false)
  })

  it('rejeita null, undefined e string vazia', () => {
    expect(validateCategory(null).valid).toBe(false)
    expect(validateCategory(undefined).valid).toBe(false)
    expect(validateCategory('').valid).toBe(false)
  })

  it('normaliza maiúsculas', () => {
    expect(validateCategory('GERAL').valid).toBe(true)
    expect(validateCategory('Hortifruti').valid).toBe(true)
    expect(validateCategory('ACOUGUE').valid).toBe(true)
  })

  it('descarta espaços extras', () => {
    expect(validateCategory('  geral  ').valid).toBe(true)
  })

  it('rejeita categorias desconhecidas', () => {
    expect(validateCategory('frutas').valid).toBe(false)
    expect(validateCategory('unknown').valid).toBe(false)
    expect(validateCategory('xyz').valid).toBe(false)
  })
})

describe('validateProductInput — categorias anteriormente quebradas', () => {
  const base = { name: 'Frango', quantity: '2', price: 10 }

  it('aceita categoria acougue', () => {
    const r = validateProductInput({ ...base, category: 'acougue' })
    expect(r.valid).toBe(true)
    expect(r.value.category).toBe('acougue')
  })

  it('aceita categoria laticinios', () => {
    const r = validateProductInput({ ...base, category: 'laticinios' })
    expect(r.valid).toBe(true)
  })

  it('aceita categoria bombonieria', () => {
    const r = validateProductInput({ ...base, category: 'bombonieria' })
    expect(r.valid).toBe(true)
  })

  it('rejeita categoria com diacrítico incorreto', () => {
    const r = validateProductInput({ ...base, category: 'açougue' })
    expect(r.valid).toBe(false)
    expect(r.errors.category).toBeTruthy()
  })
})

describe('validateQuantity', () => {
  it('aceita valores entre 1 e 999', () => {
    expect(validateQuantity(1).valid).toBe(true)
    expect(validateQuantity('5').valid).toBe(true)
    expect(validateQuantity(999).valid).toBe(true)
  })

  it('rejeita zero', () => {
    expect(validateQuantity(0).valid).toBe(false)
    expect(validateQuantity('0').valid).toBe(false)
  })

  it('rejeita valores acima de 999', () => {
    expect(validateQuantity(1000).valid).toBe(false)
  })

  it('rejeita negativos', () => {
    expect(validateQuantity(-1).valid).toBe(false)
  })

  it('rejeita decimais', () => {
    expect(validateQuantity(1.5).valid).toBe(false)
  })
})

describe('validatePrice', () => {
  it('aceita zero', () => {
    const r = validatePrice(0)
    expect(r.valid).toBe(true)
    expect(r.value).toBe(0)
  })

  it('aceita preços válidos', () => {
    expect(validatePrice(9.99).valid).toBe(true)
    expect(validatePrice(9999.99).valid).toBe(true)
  })

  it('rejeita negativos', () => {
    expect(validatePrice(-1).valid).toBe(false)
  })

  it('rejeita acima de 9999.99', () => {
    expect(validatePrice(10000).valid).toBe(false)
  })

  it('preço ausente retorna 0', () => {
    expect(validatePrice(undefined).value).toBe(0)
    expect(validatePrice(null).value).toBe(0)
    expect(validatePrice('').value).toBe(0)
  })
})
