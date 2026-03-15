import { useState } from 'react'

export function useLocalStorage(key, initialValue) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        return JSON.parse(item)
      }
      return initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      let valueToStore
      if (value instanceof Function) {
        // Re-read from localStorage to avoid stale closure on rapid sequential calls
        let currentValue = storedValue
        try {
          const persisted = window.localStorage.getItem(key)
          if (persisted !== null) {
            currentValue = JSON.parse(persisted)
          }
        } catch {
          // fall back to storedValue from closure
        }
        valueToStore = value(currentValue)
      } else {
        valueToStore = value
      }

      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
      if (key === 'shoppingList' || key === 'allProducts' || key === 'cartHistory') {
        console.warn('Failed to save important data. Consider exporting your lists.')
      }
    }
  }

  return [storedValue, setValue]
}