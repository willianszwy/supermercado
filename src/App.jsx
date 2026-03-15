import { useState, useEffect } from 'react'
import ShoppingList from './components/ShoppingList'
import NewListView from './components/NewListView'
import HistoryView from './components/HistoryView'
import SmartListView from './components/SmartListView'
import Tour from './components/Tour'
import ConfirmDialog from './components/ConfirmDialog'
import ErrorBoundary from './components/ErrorBoundary'
import MigrationHandler from './components/MigrationHandler'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useIndexedDB } from './hooks/useIndexedDB'
import { normalizeProductText } from './utils/textUtils'
import { generateUniqueId } from './utils/idUtils'
import { validateProductInput } from './utils/validationUtils'
import { initializeHaptics } from './utils/hapticUtils'

function App() {
  const [currentView, setCurrentView] = useState('main')

  // Temporarily use localStorage while we fix IndexedDB issues
  const [currentList, setCurrentList] = useLocalStorage('shoppingList', [])
  const [allProducts, setAllProducts] = useLocalStorage('allProducts', [])
  const [cartHistory, setCartHistory] = useLocalStorage('cartHistory', [])
  const [showTour, setShowTour] = useState(false)
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('hasSeenTour', false)
  const [, setGestureInteractionCount] = useLocalStorage('gestureInteractionCount', 0)
  const [pendingOverwrite, setPendingOverwrite] = useState(null) // { type: 'restore'|'newList', payload }

  // No loading state needed for localStorage
  const isLoading = false

  // Criar lista de exemplo na primeira instalação
  useEffect(() => {
    if (!isLoading && !hasSeenTour && currentView === 'main' && currentList.length === 0) {
      const exampleList = [
        { id: generateUniqueId(), name: 'Banana', quantity: 6, category: 'hortifruti', status: 'pending', addedAt: new Date().toISOString(), price: 3.99 },
        { id: generateUniqueId(), name: 'Leite Integral', quantity: 2, category: 'laticinios', status: 'pending', addedAt: new Date().toISOString(), price: 5.49 },
        { id: generateUniqueId(), name: 'Pão de Forma', quantity: 1, category: 'padaria', status: 'pending', addedAt: new Date().toISOString(), price: 4.89 },
        { id: generateUniqueId(), name: 'Peito de Frango', quantity: 1, category: 'acougue', status: 'pending', addedAt: new Date().toISOString(), price: 14.90 },
        { id: generateUniqueId(), name: 'Arroz', quantity: 1, category: 'mercearia', status: 'pending', addedAt: new Date().toISOString(), price: 7.25 },
        { id: generateUniqueId(), name: 'Detergente', quantity: 1, category: 'limpeza', status: 'completed', addedAt: new Date().toISOString(), price: 2.99 },
        { id: generateUniqueId(), name: 'Shampoo', quantity: 1, category: 'higiene', status: 'missing', addedAt: new Date().toISOString(), price: 12.50 }
      ]

      setCurrentList(exampleList)

      // Adicionar produtos ao histórico para futura reutilização
      const exampleProducts = exampleList.map(item => ({
        name: item.name,
        category: item.category,
        lastQuantity: item.quantity,
        lastUsed: new Date().toISOString(),
        suggestedPrice: item.price
      }))
      setAllProducts(exampleProducts)
    }
  }, [isLoading, hasSeenTour, currentView, currentList.length, setCurrentList, setAllProducts])

  // Initialize haptic feedback system
  useEffect(() => {
    const initHaptics = async () => {
      try {
        await initializeHaptics()
      } catch (error) {
        console.debug('Haptic initialization failed:', error)
      }
    }

    // Initialize haptics after a short delay to ensure user has interacted
    const timer = setTimeout(initHaptics, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Mostrar tour automaticamente na primeira visita
  useEffect(() => {
    if (!isLoading && !hasSeenTour && currentView === 'main') {
      const timer = setTimeout(() => {
        setShowTour(true)
      }, 1500) // Delay maior para carregar a lista de exemplo
      return () => clearTimeout(timer)
    }
  }, [isLoading, hasSeenTour, currentView])

  const addProduct = (name, quantity, category = 'geral', price = 0) => {
    // Validate input before processing
    const validation = validateProductInput({ name, quantity, price, category })

    if (!validation.valid) {
      console.error('Product validation failed:', validation.error)
      return { success: false, error: validation.error }
    }

    const validatedData = validation.value
    const normalizedName = normalizeProductText(validatedData.name)

    if (!normalizedName) {
      return { success: false, error: 'Nome do produto inválido após normalização' }
    }

    const product = {
      id: generateUniqueId(),
      name: normalizedName,
      quantity: validatedData.quantity,
      category: validatedData.category,
      status: 'pending',
      addedAt: new Date().toISOString(),
      price: validatedData.price
    }

    setCurrentList(prev => [...prev, product])

    // Add to all products if not exists
    setAllProducts(prev => {
      const existing = prev.find(p => p.name.toLowerCase() === normalizedName.toLowerCase())
      if (!existing) {
        return [...prev, {
          name: normalizedName,
          category: validatedData.category,
          lastQuantity: validatedData.quantity,
          lastUsed: new Date().toISOString(),
          suggestedPrice: validatedData.price
        }]
      } else {
        return prev.map(p =>
          p.name.toLowerCase() === normalizedName.toLowerCase()
            ? { ...p, category: validatedData.category, lastQuantity: validatedData.quantity, lastUsed: new Date().toISOString(), suggestedPrice: validatedData.price || p.suggestedPrice || 0 }
            : p
        )
      }
    })

    return { success: true }
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
        setGestureInteractionCount(prev => prev + 1)
      }
    }
  }

  const updateProduct = (id, newData) => {
    const validation = validateProductInput({
      name: newData.name,
      quantity: String(newData.quantity),
      price: newData.price,
      category: newData.category
    })

    if (!validation.valid) {
      console.error('updateProduct validation failed:', validation.error)
      return { success: false, error: validation.error }
    }

    const { name: validatedName, quantity, category, price } = validation.value
    const normalizedName = normalizeProductText(validatedName)

    if (!normalizedName) return { success: false, error: 'Nome inválido' }

    // Capture the OLD name before updating (needed to find catalog entry on rename)
    const oldItem = currentList.find(p => p.id === id)
    const oldName = oldItem ? oldItem.name : null

    setCurrentList(prev =>
      prev.map(product =>
        product.id === id
          ? { ...product, name: normalizedName, quantity, category, price }
          : product
      )
    )

    setAllProducts(prev => {
      const byOldName = oldName
        ? prev.findIndex(p => p.name.toLowerCase() === oldName.toLowerCase())
        : -1
      const byNewName = prev.findIndex(p => p.name.toLowerCase() === normalizedName.toLowerCase())

      const baseEntry = {
        name: normalizedName,
        category,
        lastQuantity: quantity,
        lastUsed: new Date().toISOString(),
      }

      if (byOldName >= 0) {
        // Preserve existing suggestedPrice when new price is 0 (same contract as addProduct)
        return prev.map((p, i) => i === byOldName
          ? { ...p, ...baseEntry, suggestedPrice: price || p.suggestedPrice || 0 }
          : p)
      } else if (byNewName >= 0) {
        return prev.map((p, i) => i === byNewName
          ? { ...p, ...baseEntry, suggestedPrice: price || p.suggestedPrice || 0 }
          : p)
      }
      // Product not in catalog (e.g., came from a restored cart) — add it now
      return [...prev, { ...baseEntry, suggestedPrice: price || 0 }]
    })

    return { success: true }
  }

  const executeCreateNewList = (selectedProducts) => {
    const newList = selectedProducts.map(({ name, quantity, category, price }) => ({
      id: generateUniqueId(),
      name,
      quantity: Math.min(999, Math.max(1, parseInt(quantity) || 1)),
      category: category || 'geral',
      status: 'pending',
      addedAt: new Date().toISOString(),
      price: Math.min(9999.99, Math.max(0, parseFloat(price) || 0))
    }))

    setCurrentList(newList)

    // Upsert all selected products into the catalog (including new ones)
    setAllProducts(prev => {
      let updated = [...prev]
      selectedProducts.forEach(({ name, quantity, category, price }) => {
        const normalizedName = normalizeProductText(name)
        if (!normalizedName) return
        const existingIdx = updated.findIndex(
          p => p.name.toLowerCase() === normalizedName.toLowerCase()
        )
        const entry = {
          name: normalizedName,
          category: category || 'geral',
          lastQuantity: Math.min(999, Math.max(1, parseInt(quantity) || 1)),
          lastUsed: new Date().toISOString(),
          suggestedPrice: Math.min(9999.99, Math.max(0, parseFloat(price) || 0))
        }
        if (existingIdx >= 0) {
          updated[existingIdx] = { ...updated[existingIdx], ...entry }
        } else {
          updated.push(entry)
        }
      })
      return updated
    })

    setCurrentView('main')
  }

  const createNewList = (selectedProducts) => {
    if (currentList.length > 0) {
      setPendingOverwrite({ type: 'newList', payload: selectedProducts })
      return
    }
    executeCreateNewList(selectedProducts)
  }

  const removeProduct = (productName) => {
    setAllProducts(prev => prev.filter(product => product.name.toLowerCase() !== productName.toLowerCase()))
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
      id: generateUniqueId(),
      items: [...currentList],
      finishedAt: new Date().toISOString()
    }

    setCartHistory(prev => [finishedCart, ...prev])
    setCurrentList([])
  }

  const executeRestoreCart = (cart) => {
    const restoredItems = cart.items.map(item => ({
      ...item,
      id: generateUniqueId(),
      status: 'pending',
      addedAt: new Date().toISOString()
    }))
    setCurrentList(restoredItems)
    setCurrentView('main')
  }

  const restoreCart = (cart) => {
    if (currentList.length > 0) {
      setPendingOverwrite({ type: 'restore', payload: cart })
      return
    }
    executeRestoreCart(cart)
  }

  const handleOverwriteConfirm = () => {
    if (!pendingOverwrite) return
    const { type, payload } = pendingOverwrite
    setPendingOverwrite(null)
    if (type === 'restore') {
      executeRestoreCart(payload)
    } else if (type === 'newList') {
      executeCreateNewList(payload)
    }
  }

  const handleOverwriteCancel = () => {
    setPendingOverwrite(null)
  }

  // Show loading screen while data is being loaded
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-5">
          {currentView === 'main' ? (
            <ErrorBoundary>
              <ShoppingList
                currentList={currentList}
                onAddProduct={addProduct}
                onUpdateStatus={updateProductStatus}
                onUpdateProduct={updateProduct}
                onNewList={() => setCurrentView('newList')}
                onSmartList={() => setCurrentView('smartList')}
                onClearList={clearList}
                onShowTour={handleShowTour}
                onFinishCart={finishCart}
                onShowHistory={() => setCurrentView('history')}
                hasHistory={cartHistory.length > 0}
              />
            </ErrorBoundary>
          ) : currentView === 'newList' ? (
            <ErrorBoundary>
              <NewListView
                allProducts={allProducts}
                onCreateList={createNewList}
                onBack={() => setCurrentView('main')}
                onRemoveProduct={removeProduct}
              />
            </ErrorBoundary>
          ) : currentView === 'history' ? (
            <ErrorBoundary>
              <HistoryView
                cartHistory={cartHistory}
                onBack={() => setCurrentView('main')}
                onRestoreCart={restoreCart}
              />
            </ErrorBoundary>
          ) : currentView === 'smartList' ? (
            <ErrorBoundary>
              <SmartListView
                cartHistory={cartHistory}
                onCreateList={createNewList}
                onBack={() => setCurrentView('main')}
              />
            </ErrorBoundary>
          ) : null}

          {/* Tour Guide */}
          <ErrorBoundary>
            <Tour
              isOpen={showTour}
              onClose={handleCloseTour}
            />
          </ErrorBoundary>

          {/* Overwrite confirmation */}
          <ConfirmDialog
            isOpen={!!pendingOverwrite}
            title="Substituir Lista Atual"
            message="Você tem uma lista ativa com itens. Deseja substituí-la? Os itens atuais serão perdidos."
            onConfirm={handleOverwriteConfirm}
            onCancel={handleOverwriteCancel}
            confirmText="Sim, Substituir"
            cancelText="Cancelar"
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App
