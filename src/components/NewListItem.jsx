import PlusIcon from './PlusIcon'
import TrashIcon from './TrashIcon'
import CheckmarkIcon from './CheckmarkIcon'
import { formatPrice } from '../utils/priceUtils'
import { useNewListGestureHandler } from '../hooks/useNewListGestureHandler'

function NewListItem({ product, isSelected, onAddProduct, onRemoveProduct, selectedQuantity, onUpdateQuantity }) {
  const {
    isDragging,
    dragOffset,
    dragDirection,
    showPreview,
    showActionMenu,
    menuStage,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleMouseDown,
    handleTouchStart,
    handleAddAction,
    // handleDeleteAction, // Available if needed later
    dragThreshold,
  } = useNewListGestureHandler({ 
    product, 
    onAddProduct, 
    onRemoveProduct
  })

  const getDragClasses = () => {
    if (!isDragging) return ''
    
    const absOffset = Math.abs(dragOffset)
    let classes = ''
    
    if (absOffset > 20) {
      if (dragOffset > 0) {
        classes += absOffset > dragThreshold ? 'drag-right-complete' : 'drag-right-preview'
      } else {
        classes += absOffset > dragThreshold ? 'drag-left-complete' : 'drag-left-preview'
      }
    }
    
    return classes
  }

  const getStatusClasses = () => {
    if (isSelected) return 'border-primary-green bg-green-50'
    return 'border-gray-200 hover:border-primary-blue'
  }

  const handleClick = () => {
    if (!isDragging && !isSelected) {
      onAddProduct(product.name, product.lastQuantity, product.category, product.suggestedPrice)
    }
  }

  const handleQuantityUpdate = (e) => {
    e.stopPropagation()
    const newQuantity = parseInt(e.target.value) || 1
    onUpdateQuantity(product.name, newQuantity)
  }

  const handleRemoveFromSelection = (e) => {
    e.stopPropagation()
    onRemoveProduct(product.name, true) // true indica remoção da seleção, não permanente
  }

  return (
    <div
      className={`bg-white border-2 rounded-lg p-3 cursor-pointer transition-all duration-300 relative overflow-hidden ${
        getStatusClasses()
      } ${getDragClasses()}`}
      style={{
        transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0px)',
        zIndex: isDragging ? 10 : 1,
      }}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Hidden Left Menu */}
      {showActionMenu && menuStage === 'revealed' && (
        <div className="absolute left-0 top-0 h-full flex items-center justify-center bg-primary-blue text-white px-4 rounded-l-lg">
          <button
            onClick={handleAddAction}
            className="flex items-center gap-2 text-sm font-medium"
            title="Adicionar à lista"
          >
            <PlusIcon className="w-4 h-4" />
            Adicionar
          </button>
        </div>
      )}

      {/* Hidden Right Action Preview */}
      {showPreview && dragDirection === 'right' && (
        <div className="absolute right-0 top-0 h-full flex items-center justify-center bg-primary-green text-white px-4 rounded-r-lg">
          <CheckmarkIcon className="w-5 h-5" />
        </div>
      )}

      {/* Hidden Left Delete Preview */}
      {showPreview && dragDirection === 'left' && menuStage === 'action' && (
        <div className="absolute left-0 top-0 h-full flex items-center justify-center bg-primary-red text-white px-4 rounded-l-lg">
          <TrashIcon className="w-5 h-5" />
        </div>
      )}

      {/* Product Content */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="font-semibold">{product.name}</div>
            {product.suggestedPrice > 0 && (
              <div className="text-xs text-gray-600">{formatPrice(product.suggestedPrice)}</div>
            )}
          </div>
          <div className="text-white text-sm bg-slate-500 px-2 py-1 rounded-full font-semibold min-w-6 text-center shadow-sm">
            {product.lastQuantity}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isSelected ? (
            <>
              <input
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={handleQuantityUpdate}
                onClick={(e) => e.stopPropagation()}
                className="w-16 px-2 py-1 border border-gray-300 rounded bg-white text-black text-center text-sm"
              />
              <button
                onClick={handleRemoveFromSelection}
                className="w-6 h-6 rounded bg-primary-red text-white text-sm font-bold hover:bg-primary-red-dark flex items-center justify-center"
                title="Remover da seleção"
              >
                ×
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* Swipe hint for first time users */}
              {!isDragging && (
                <div className="text-xs text-gray-400 hidden sm:block">
                  ← Excluir • Adicionar →
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveProduct(product.name, false) // false indica remoção permanente
                }}
                className="w-6 h-6 rounded-full bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 flex items-center justify-center text-sm transition-colors"
                title="Remover produto permanentemente"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Menu Backdrop */}
      {showActionMenu && (
        <div 
          className="absolute inset-0 bg-gray-900 bg-opacity-10 pointer-events-none rounded-lg"
        />
      )}
    </div>
  )
}

export default NewListItem