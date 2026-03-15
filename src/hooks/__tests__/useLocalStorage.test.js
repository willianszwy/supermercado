import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../useLocalStorage'

beforeEach(() => {
  window.localStorage.clear()
})

describe('useLocalStorage', () => {
  it('retorna initialValue quando não há nada salvo', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', []))
    expect(result.current[0]).toEqual([])
  })

  it('persiste valor no localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', []))
    act(() => {
      result.current[1](['item1'])
    })
    expect(result.current[0]).toEqual(['item1'])
    expect(JSON.parse(window.localStorage.getItem('test-key'))).toEqual(['item1'])
  })

  it('suporta updater funcional', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', []))
    act(() => {
      result.current[1](['a'])
    })
    act(() => {
      result.current[1](prev => [...prev, 'b'])
    })
    expect(result.current[0]).toEqual(['a', 'b'])
  })

  it('não executa sanitizeStorageData (produto com < não é alterado)', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', []))
    const product = { name: 'Creme <Natural>', category: 'higiene' }
    act(() => {
      result.current[1]([product])
    })
    expect(result.current[0][0].name).toBe('Creme <Natural>')
  })

  it('lê do localStorage ao montar se já existir valor', () => {
    window.localStorage.setItem('test-key2', JSON.stringify(['saved']))
    const { result } = renderHook(() => useLocalStorage('test-key2', []))
    expect(result.current[0]).toEqual(['saved'])
  })
})
