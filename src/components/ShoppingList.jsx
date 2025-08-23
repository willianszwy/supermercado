import { useState } from 'react'
import ListSection from './ListSection'
import FloatingAddButton from './FloatingAddButton'

function ShoppingList({ currentList, onAddProduct, onUpdateStatus, onNewList }) {
  const pendingItems = currentList.filter(item => item.status === 'pending')
  const completedItems = currentList.filter(item => item.status === 'completed')
  const missingItems = currentList.filter(item => item.status === 'missing')

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
      </main>

      <FloatingAddButton onAddProduct={onAddProduct} />
    </>
  )
}

export default ShoppingList