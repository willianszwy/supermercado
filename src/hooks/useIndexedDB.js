import { useState, useEffect, useRef } from 'react'
import { sanitizeStorageData } from '../utils/validationUtils'

const DB_NAME = 'SwipeCartDB'
const DB_VERSION = 1
const STORES = {
  shoppingList: 'shoppingList',
  allProducts: 'allProducts', 
  cartHistory: 'cartHistory',
  settings: 'settings'
}

class IndexedDBManager {
  constructor() {
    this.db = null
    this.dbPromise = this.initDB()
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // Create object stores if they don't exist
        Object.values(STORES).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'key' })
          }
        })
      }
    })
  }

  async ensureDB() {
    if (!this.db) {
      await this.dbPromise
    }
    return this.db
  }

  async get(storeName, key) {
    try {
      const db = await this.ensureDB()
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result
          resolve(result ? result.value : null)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error(`Error getting key "${key}" from store "${storeName}":`, error)
      return null
    }
  }

  async set(storeName, key, value) {
    try {
      const db = await this.ensureDB()
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      
      // Sanitize data before storing (except for settings)
      const sanitizedValue = storeName === 'settings' 
        ? value 
        : sanitizeStorageData(value)
      
      const request = store.put({ key, value: sanitizedValue })
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(sanitizedValue)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error(`Error setting key "${key}" in store "${storeName}":`, error)
      throw error
    }
  }

  async clear(storeName) {
    try {
      const db = await this.ensureDB()
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error(`Error clearing store "${storeName}":`, error)
      throw error
    }
  }
}

// Singleton instance
const dbManager = new IndexedDBManager()

export function useIndexedDB(key, initialValue, storeName = 'settings') {
  const [storedValue, setStoredValue] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(true)
  const isMounted = useRef(true)

  // Load initial value from IndexedDB
  useEffect(() => {
    async function loadValue() {
      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('IndexedDB timeout')), 5000)
        })
        
        const valuePromise = dbManager.get(storeName, key)
        const value = await Promise.race([valuePromise, timeoutPromise])
        
        if (isMounted.current) {
          setStoredValue(value !== null ? value : initialValue)
          setIsLoading(false)
        }
      } catch (error) {
        console.error(`Error loading value for key "${key}":`, error)
        if (isMounted.current) {
          setStoredValue(initialValue)
          setIsLoading(false)
        }
      }
    }

    loadValue()

    return () => {
      isMounted.current = false
    }
  }, [key, initialValue, storeName])

  const setValue = async (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Update state immediately for better UX
      setStoredValue(valueToStore)
      
      // Persist to IndexedDB
      await dbManager.set(storeName, key, valueToStore)
    } catch (error) {
      console.error(`Error setting value for key "${key}":`, error)
      // Revert state on error
      setStoredValue(storedValue)
      
      // Provide user feedback for critical storage failures
      if (['shoppingList', 'allProducts', 'cartHistory'].includes(storeName)) {
        console.warn('Failed to save important data. Storage may be full.')
      }
      
      throw error
    }
  }

  return [storedValue, setValue, isLoading]
}

// Helper function to migrate data from localStorage to IndexedDB
export async function migrateFromLocalStorage() {
  const keysToMigrate = [
    { key: 'shoppingList', store: 'shoppingList' },
    { key: 'allProducts', store: 'allProducts' },
    { key: 'cartHistory', store: 'cartHistory' },
    { key: 'hasSeenTour', store: 'settings' },
    { key: 'gestureInteractionCount', store: 'settings' },
    { key: 'hasSeenNewListTour', store: 'settings' }
  ]

  const results = []

  for (const { key, store } of keysToMigrate) {
    try {
      const localData = localStorage.getItem(key)
      if (localData) {
        const parsedData = JSON.parse(localData)
        await dbManager.set(store, key, parsedData)
        results.push({ key, status: 'migrated' })
        
        // Remove from localStorage after successful migration
        localStorage.removeItem(key)
      } else {
        results.push({ key, status: 'no_data' })
      }
    } catch (error) {
      console.error(`Error migrating key "${key}":`, error)
      results.push({ key, status: 'error', error })
    }
  }

  // Mark migration as complete
  localStorage.setItem('indexedDBMigrated', 'true')
  
  return results
}

// Check if migration is needed
export function needsMigration() {
  return !localStorage.getItem('indexedDBMigrated')
}