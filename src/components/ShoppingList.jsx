import { useState } from 'react'
import ListSection from './ListSection'
import FloatingAddButton from './FloatingAddButton'
import ConfirmDialog from './ConfirmDialog'
import HistoryIcon from './HistoryIcon'
import CheckmarkIcon from './CheckmarkIcon'
import TrashIcon from './TrashIcon'
import HelpIcon from './HelpIcon'
import { getCategoryById, getCategoriesList, getCategoryColor } from '../utils/categories'

function ShoppingList({ currentList, onAddProduct, onUpdateStatus, onNewList, onClearList, onShowTour, onFinishCart, onShowHistory, showGestureHints }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState(new Set())
  
  const pendingItems = currentList.filter(item => item.status === 'pending')
  const completedItems = currentList.filter(item => item.status === 'completed')
  const missingItems = currentList.filter(item => item.status === 'missing')

  // Group pending items by category
  const groupItemsByCategory = (items) => {
    const grouped = items.reduce((acc, item) => {
      const category = item.category || 'geral'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    }, {})
    
    return grouped
  }

  const toggleCategoryCollapse = (categoryId) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleClearList = () => {
    onClearList()
    setShowConfirmDialog(false)
  }

  return (
    <>
      <header className="py-5 flex justify-between items-center border-b-2 border-primary-blue mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-primary-blue">
            SwipeCart
          </h1>
          <button
            onClick={onShowTour}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-sm transition-colors"
            title="Tutorial - Como usar"
          >
            <HelpIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onShowHistory}
            className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
            title="Ver histórico"
          >
            <HistoryIcon className="w-5 h-5" />
          </button>
          <button onClick={onNewList} className="btn-primary" data-tour="new-list">
            Nova Lista
          </button>
        </div>
      </header>

      <main>
        <div className="flex flex-col gap-5">
          {/* Pending Items by Category */}
          {pendingItems.length > 0 ? (
            <div className="space-y-4" data-tour="pending-section">
              {Object.entries(groupItemsByCategory(pendingItems)).map(([categoryId, items]) => {
                const category = getCategoryById(categoryId)
                const isCollapsed = collapsedCategories.has(categoryId)
                
                return (
                  <div key={categoryId} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <button
                      onClick={() => toggleCategoryCollapse(categoryId)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-t-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getCategoryColor(categoryId)}`}></div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {category.name}
                        </h3>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                          {items.length}
                        </span>
                      </div>
                      <span className="text-gray-400">
                        {isCollapsed ? '▼' : '▲'}
                      </span>
                    </button>
                    
                    {!isCollapsed && (
                      <div className="px-4 pb-4">
                        <ListSection
                          items={items}
                          onUpdateStatus={onUpdateStatus}
                          hideTitle={true}
                          showGestureHints={showGestureHints}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500" data-tour="pending-section">
              <p className="text-lg">Sua lista está vazia</p>
              <p className="text-sm mt-1">Clique no botão + para adicionar produtos</p>
            </div>
          )}

          <ListSection
            title="Comprados"
            items={completedItems}
            onUpdateStatus={onUpdateStatus}
            statusType="completed"
            dataTour="completed-section"
          />

          <ListSection
            title="Em Falta"
            items={missingItems}
            onUpdateStatus={onUpdateStatus}
            statusType="missing"
            dataTour="missing-section"
          />
        </div>

        {currentList.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
            <button
              onClick={onFinishCart}
              className="w-full py-3 px-4 bg-green-50 border-2 border-green-200 text-primary-green rounded-lg font-medium hover:bg-green-100 hover:border-green-300 transition-colors flex items-center justify-center gap-2"
            >
              <CheckmarkIcon className="w-5 h-5" />
              Finalizar Compras
            </button>
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="w-full py-3 px-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-100 hover:border-red-300 transition-colors flex items-center justify-center gap-2"
            >
              <TrashIcon className="w-5 h-5" />
              Limpar Lista
            </button>
          </div>
        )}
      </main>

      <FloatingAddButton onAddProduct={onAddProduct} />

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Limpar Lista"
        message="Tem certeza que deseja limpar toda a lista? Esta ação removerá todos os itens e não pode ser desfeita."
        onConfirm={handleClearList}
        onCancel={() => setShowConfirmDialog(false)}
        confirmText="Sim, Limpar"
        cancelText="Cancelar"
      />
    </>
  )
}

export default ShoppingList