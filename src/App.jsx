import { useState, useEffect } from 'react'
import ShoppingList from './components/ShoppingList'
import NewListView from './components/NewListView'
import { useLocalStorage } from './hooks/useLocalStorage'
import { normalizeProductText } from './utils/textUtils'

function App() {
  const [currentView, setCurrentView] = useState('main')
  const [currentList, setCurrentList] = useLocalStorage('shoppingList', [])
  const [allProducts, setAllProducts] = useLocalStorage('allProducts', [])

  const addProduct = (name, quantity) => {
    const normalizedName = normalizeProductText(name)
    
    if (!normalizedName) return // Não adiciona se o nome estiver vazio após normalização
    
    const product = {
      id: Date.now() + Math.random(),
      name: normalizedName,
      quantity,
      status: 'pending',
      addedAt: new Date().toISOString()
    }

    setCurrentList(prev => [...prev, product])

    // Add to all products if not exists
    setAllProducts(prev => {
      const existing = prev.find(p => p.name.toLowerCase() === normalizedName.toLowerCase())
      if (!existing) {
        return [...prev, {
          name: normalizedName,
          lastQuantity: quantity,
          lastUsed: new Date().toISOString()
        }]
      } else {
        return prev.map(p => 
          p.name.toLowerCase() === normalizedName.toLowerCase()
            ? { ...p, lastQuantity: quantity, lastUsed: new Date().toISOString() }
            : p
        )
      }
    })
  }

  const updateProductStatus = (id, status) => {
    if (status === 'delete') {
      setCurrentList(prev => prev.filter(product => product.id !== id))
    } else {
      setCurrentList(prev => 
        prev.map(product => 
          product.id === id ? { ...product, status } : product
        )
      )
    }
  }

  const createNewList = (selectedProducts) => {
    const newList = selectedProducts.map(({ name, quantity }) => ({
      id: Date.now() + Math.random(),
      name,
      quantity,
      status: 'pending',
      addedAt: new Date().toISOString()
    }))

    setCurrentList(newList)

    // Update last used for selected products
    setAllProducts(prev => 
      prev.map(product => {
        const selected = selectedProducts.find(p => p.name === product.name)
        if (selected) {
          return {
            ...product,
            lastQuantity: selected.quantity,
            lastUsed: new Date().toISOString()
          }
        }
        return product
      })
    )

    setCurrentView('main')
  }

  const removeProduct = (productName) => {
    setAllProducts(prev => prev.filter(product => product.name !== productName))
  }

  const clearList = () => {
    setCurrentList([])
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-5">
        {currentView === 'main' ? (
          <ShoppingList
            currentList={currentList}
            onAddProduct={addProduct}
            onUpdateStatus={updateProductStatus}
            onNewList={() => setCurrentView('newList')}
            onClearList={clearList}
          />
        ) : (
          <NewListView
            allProducts={allProducts}
            onCreateList={createNewList}
            onBack={() => setCurrentView('main')}
            onRemoveProduct={removeProduct}
          />
        )}
      </div>
    </div>
  )
}

export default App