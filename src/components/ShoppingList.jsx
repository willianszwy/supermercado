import { useState } from 'react'
import ListSection from './ListSection'
import FloatingAddButton from './FloatingAddButton'
import ConfirmDialog from './ConfirmDialog'
import CategoryHeader from './CategoryHeader'
import TabNavigation from './TabNavigation'
import HistoryIcon from './HistoryIcon'
import CheckmarkIcon from './CheckmarkIcon'
import TrashIcon from './TrashIcon'
import HelpIcon from './HelpIcon'
import { getCategoryById, getCategoriesWithItems, getCategoryColor } from '../utils/categories'

function ShoppingList({ currentList, onAddProduct, onUpdateStatus, onNewList, onClearList, onShowTour, onFinishCart, onShowHistory }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState(new Set())
  const [activeTab, setActiveTab] = useState('pending')
  
  const pendingItems = currentList.filter(item => item.status === 'pending')
  const completedItems = currentList.filter(item => item.status === 'completed')
  const missingItems = currentList.filter(item => item.status === 'missing')

  // Usar a nova função que já ordena por rota de compras
  const categoriesWithPendingItems = getCategoriesWithItems(pendingItems)

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
      <header className="py-3 flex justify-between items-center border-b-2 border-primary-blue mb-3">
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

      {/* Navegação por abas */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingItems.length}
        completedCount={completedItems.length}
        missingCount={missingItems.length}
      />

      <main className="px-3">
        {/* Conteúdo baseado na aba ativa */}
        {activeTab === 'pending' && (
          <div className="tab-content">
            {/* Header de rota sugerida */}
            {pendingItems.length > 0 && (
              <div className="route-suggestion mb-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-blue-900">Sua rota de compras</h2>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm sm:text-base text-blue-700">
                  <span className="flex-shrink-0">Sugerimos começar pelo:</span>
                  <div className="flex flex-wrap gap-1">
                    {categoriesWithPendingItems.slice(0, 3).map((categoryWithItems, index) => (
                      <span key={categoryWithItems.id} className="font-semibold">
                        {categoryWithItems.name}
                        {index < Math.min(categoriesWithPendingItems.length - 1, 2) && ' → '}
                      </span>
                    ))}
                    {categoriesWithPendingItems.length > 3 && <span className="text-blue-600">...</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Pendentes por Categoria */}
            {pendingItems.length > 0 ? (
              <div className="space-y-2" data-tour="pending-section">
                {categoriesWithPendingItems.map((categoryWithItems) => {
                  const isCollapsed = collapsedCategories.has(categoryWithItems.id)
                  const completedInCategory = currentList.filter(item => 
                    (item.category || 'geral') === categoryWithItems.id && item.status === 'completed'
                  ).length
                  
                  return (
                    <div key={categoryWithItems.id} className="category-card bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
                      <CategoryHeader 
                        category={categoryWithItems}
                        itemCount={categoryWithItems.items.length}
                        completedCount={completedInCategory}
                        isCollapsed={isCollapsed}
                        onToggle={() => toggleCategoryCollapse(categoryWithItems.id)}
                      />
                      
                      {!isCollapsed && (
                        <div className="px-4 pb-4">
                          <ListSection
                            items={categoryWithItems.items}
                            onUpdateStatus={onUpdateStatus}
                            hideTitle={true}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500" data-tour="pending-section">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-2">Sua lista está vazia</p>
                <p className="text-sm text-gray-500">Clique no botão + para adicionar produtos e começar suas compras</p>
              </div>
            )}
          </div>
        )}

        {/* Aba Comprados */}
        {activeTab === 'completed' && (
          <div className="tab-content py-4">
            <ListSection
              title="Itens Comprados"
              items={completedItems}
              onUpdateStatus={onUpdateStatus}
              statusType="completed"
              dataTour="completed-section"
              hideTitle={false}
            />
          </div>
        )}

        {/* Aba Em Falta */}
        {activeTab === 'missing' && (
          <div className="tab-content py-4">
            <ListSection
              title="Itens em Falta"
              items={missingItems}
              onUpdateStatus={onUpdateStatus}
              statusType="missing"
              dataTour="missing-section"
              hideTitle={false}
            />
          </div>
        )}

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