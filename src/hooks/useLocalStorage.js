import { useState } from 'react'
import { sanitizeStorageData } from '../utils/validationUtils'

export function useLocalStorage(key, initialValue) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        const parsedData = JSON.parse(item)
        // Sanitize data when reading from storage
        return sanitizeStorageData(parsedData)
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
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Sanitize data before storing (except for non-user-data like settings)
      const sanitizedValue = key.includes('settings') || key.includes('tour') || key === 'gestureInteractionCount' 
        ? valueToStore 
        : sanitizeStorageData(valueToStore)
      
      setStoredValue(sanitizedValue)
      window.localStorage.setItem(key, JSON.stringify(sanitizedValue))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
      // Provide user feedback for critical storage failures
      if (key === 'shoppingList' || key === 'allProducts' || key === 'cartHistory') {
        // You may want to show a toast notification here
        console.warn('Failed to save important data. Consider exporting your lists.')
      }
    }
  }

  return [storedValue, setValue]
}