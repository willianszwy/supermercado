import { useState } from 'react'
import ListSection from './ListSection'
import FloatingAddButton from './FloatingAddButton'
import ConfirmDialog from './ConfirmDialog'

function ShoppingList({ currentList, onAddProduct, onUpdateStatus, onNewList, onClearList }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  
  const pendingItems = currentList.filter(item => item.status === 'pending')
  const completedItems = currentList.filter(item => item.status === 'completed')
  const missingItems = currentList.filter(item => item.status === 'missing')

  const handleClearList = () => {
    onClearList()
    setShowConfirmDialog(false)
  }

  return (
    <>
      <header className="py-5 flex justify-between items-center border-b-2 border-primary-blue mb-5">
        <h1 className="text-3xl font-bold text-primary-blue">
          SwipeCart
        </h1>
        <button onClick={onNewList} className="btn-primary">
          Nova Lista
        </button>
      </header>

      <main>
        <div className="flex flex-col gap-5">
          <ListSection
            title="Pendentes"
            items={pendingItems}
            onUpdateStatus={onUpdateStatus}
            isEmpty={currentList.length === 0}
          />

          <ListSection
            title="Comprados"
            items={completedItems}
            onUpdateStatus={onUpdateStatus}
            statusType="completed"
          />

          <ListSection
            title="Em Falta"
            items={missingItems}
            onUpdateStatus={onUpdateStatus}
            statusType="missing"
          />
        </div>

        {currentList.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="w-full py-3 px-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-100 hover:border-red-300 transition-colors flex items-center justify-center gap-2"
            >
              <span>🗑️</span>
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