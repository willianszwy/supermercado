import { useState } from 'react'
import ListSection from './ListSection'
import FloatingAddButton from './FloatingAddButton'
import ConfirmDialog from './ConfirmDialog'
import HistoryIcon from './HistoryIcon'
import CheckmarkIcon from './CheckmarkIcon'
import TrashIcon from './TrashIcon'
import HelpIcon from './HelpIcon'

function ShoppingList({ currentList, onAddProduct, onUpdateStatus, onNewList, onClearList, onShowTour, onFinishCart, onShowHistory }) {
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
          <ListSection
            title="Pendentes"
            items={pendingItems}
            onUpdateStatus={onUpdateStatus}
            isEmpty={currentList.length === 0}
            dataTour="pending-section"
          />

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