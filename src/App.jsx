import { useState, useEffect } from 'react'
import ShoppingList from './components/ShoppingList'
import NewListView from './components/NewListView'
import HistoryView from './components/HistoryView'
import Tour from './components/Tour'
import { useLocalStorage } from './hooks/useLocalStorage'
import { normalizeProductText } from './utils/textUtils'

function App() {
  const [currentView, setCurrentView] = useState('main')
  const [currentList, setCurrentList] = useLocalStorage('shoppingList', [])
  const [allProducts, setAllProducts] = useLocalStorage('allProducts', [])
  const [cartHistory, setCartHistory] = useLocalStorage('cartHistory', [])
  const [showTour, setShowTour] = useState(false)
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('hasSeenTour', false)
  const [gestureInteractionCount, setGestureInteractionCount] = useLocalStorage('gestureInteractionCount', 0)

  // Criar lista de exemplo na primeira instalação
  useEffect(() => {
    if (!hasSeenTour && currentView === 'main' && currentList.length === 0) {
      const exampleList = [
        { id: Date.now() + 1, name: 'Banana', quantity: 6, category: 'hortifruti', status: 'pending', addedAt: new Date().toISOString() },
        { id: Date.now() + 2, name: 'Leite', quantity: 2, category: 'laticinios', status: 'pending', addedAt: new Date().toISOString() },
        { id: Date.now() + 3, name: 'Pão de Forma', quantity: 1, category: 'padaria', status: 'pending', addedAt: new Date().toISOString() },
        { id: Date.now() + 4, name: 'Frango', quantity: 1, category: 'acougue', status: 'pending', addedAt: new Date().toISOString() },
        { id: Date.now() + 5, name: 'Arroz', quantity: 1, category: 'mercearia', status: 'pending', addedAt: new Date().toISOString() },
        { id: Date.now() + 6, name: 'Detergente', quantity: 1, category: 'limpeza', status: 'completed', addedAt: new Date().toISOString() },
        { id: Date.now() + 7, name: 'Shampoo', quantity: 1, category: 'higiene', status: 'missing', addedAt: new Date().toISOString() }
      ]
      
      setCurrentList(exampleList)
      
      // Adicionar produtos ao histórico para futura reutilização  
      const exampleProducts = exampleList.map(item => ({
        name: item.name,
        category: item.category,
        lastQuantity: item.quantity,
        lastUsed: new Date().toISOString()
      }))
      setAllProducts(exampleProducts)
    }
  }, [hasSeenTour, currentView, currentList.length, setCurrentList, setAllProducts])

  // Mostrar tour automaticamente na primeira visita
  useEffect(() => {
    if (!hasSeenTour && currentView === 'main') {
      const timer = setTimeout(() => {
        setShowTour(true)
      }, 1500) // Delay maior para carregar a lista de exemplo
      return () => clearTimeout(timer)
    }
  }, [hasSeenTour, currentView])

  const addProduct = (name, quantity, category = 'geral') => {
    const normalizedName = normalizeProductText(name)
    
    if (!normalizedName) return // Não adiciona se o nome estiver vazio após normalização
    
    const product = {
      id: Date.now() + Math.random(),
      name: normalizedName,
      quantity,
      category,
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
          category,
          lastQuantity: quantity,
          lastUsed: new Date().toISOString()
        }]
      } else {
        return prev.map(p => 
          p.name.toLowerCase() === normalizedName.toLowerCase()
            ? { ...p, category, lastQuantity: quantity, lastUsed: new Date().toISOString() }
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
      
      // Incrementar contador de interações com gestos
      if (status === 'completed' || status === 'missing') {
        setGestureInteractionCount(prev => {
          const newCount = prev + 1
          // Esconder hints após 5 interações bem-sucedidas
          if (newCount >= 5) {
            setShowGestureHints(false)
          }
          return newCount
        })
      }
    }
  }

  const createNewList = (selectedProducts) => {
    const newList = selectedProducts.map(({ name, quantity, category }) => ({
      id: Date.now() + Math.random(),
      name,
      quantity,
      category: category || 'geral',
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

  const handleShowTour = () => {
    setShowTour(true)
  }

  const handleCloseTour = () => {
    setShowTour(false)
    setHasSeenTour(true)
  }

  const finishCart = () => {
    if (currentList.length === 0) return

    const finishedCart = {
      id: Date.now() + Math.random(),
      items: [...currentList],
      finishedAt: new Date().toISOString(),
      totalItems: currentList.length,
      completedItems: currentList.filter(item => item.status === 'completed').length,
      missingItems: currentList.filter(item => item.status === 'missing').length
    }

    setCartHistory(prev => [finishedCart, ...prev])
    setCurrentList([])
  }

  const restoreCart = (cart) => {
    // Restaura o carrinho como uma nova lista
    const restoredItems = cart.items.map(item => ({
      ...item,
      id: Date.now() + Math.random(), // Novo ID
      status: 'pending', // Reset status
      addedAt: new Date().toISOString()
    }))
    
    setCurrentList(restoredItems)
    setCurrentView('main')
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
            onShowTour={handleShowTour}
            onFinishCart={finishCart}
            onShowHistory={() => setCurrentView('history')}
          />
        ) : currentView === 'newList' ? (
          <NewListView
            allProducts={allProducts}
            onCreateList={createNewList}
            onBack={() => setCurrentView('main')}
            onRemoveProduct={removeProduct}
          />
        ) : currentView === 'history' ? (
          <HistoryView
            cartHistory={cartHistory}
            onBack={() => setCurrentView('main')}
            onRestoreCart={restoreCart}
          />
        ) : null}
        
        {/* Tour Guide */}
        <Tour 
          isOpen={showTour} 
          onClose={handleCloseTour} 
        />
      </div>
    </div>
  )
}

export default App