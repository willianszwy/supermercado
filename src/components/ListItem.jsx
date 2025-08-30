import React from 'react'
import RemoveIcon from './RemoveIcon'
import CheckmarkIcon from './CheckmarkIcon'
import { formatPrice } from '../utils/priceUtils'
import { useGestureHandler } from '../hooks/useGestureHandler'

function ListItem({ item, onUpdateStatus, statusType, onEdit }) {
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
    handleEditAction,
    handleDeleteAction,
    dragThreshold,
  } = useGestureHandler({ item, onUpdateStatus, onEdit })

  const getDragClasses = () => {
    if (!isDragging) return ''
    
    // Classes progressivas baseadas no offset
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
    if (statusType === 'completed') return 'bg-green-50'
    if (statusType === 'missing') return 'bg-primary-red-light'
    return 'bg-white'
  }

  return (
    <li
      className={`item-card ${getStatusClasses()} border-b border-gray-100 p-2.5 sm:p-3 transition-all duration-300 select-none min-h-[60px] ${isDragging ? 'cursor-grabbing opacity-90 transform rotate-1 shadow-lg z-50' : 'cursor-grab'} ${getDragClasses()} relative overflow-hidden last:border-b-0 last:rounded-b-xl`}
      style={{ 
        transform: isDragging ? `translateX(${dragOffset}px)` : undefined,
        touchAction: item.status === 'pending' ? 'pan-y' : 'auto', // Permite scroll vertical, bloqueia horizontal
        pointerEvents: showActionMenu && menuStage === 'revealed' ? 'none' : 'auto'
      }}
      onPointerDown={showActionMenu && menuStage === 'revealed' ? undefined : handlePointerDown}
      onPointerMove={isDragging ? handlePointerMove : undefined}
      onPointerUp={isDragging ? handlePointerUp : undefined}
      onMouseDown={showActionMenu && menuStage === 'revealed' ? undefined : handleMouseDown}
      onTouchStart={showActionMenu && menuStage === 'revealed' ? undefined : handleTouchStart}
      role="listitem"
      aria-label={`${item.name}, quantidade: ${item.quantity}${item.price > 0 ? `, preço: ${formatPrice(item.price)}` : ''}, status: ${statusType === 'pending' ? 'pendente' : statusType === 'completed' ? 'comprado' : 'em falta'}`}
      tabIndex={item.status === 'pending' ? 0 : -1}
      onKeyDown={(e) => {
        if (item.status === 'pending') {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onUpdateStatus(item.id, 'completed')
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault()
            onUpdateStatus(item.id, 'delete')
          } else if (e.key === 'm' || e.key === 'M') {
            e.preventDefault()
            onUpdateStatus(item.id, 'missing')
          } else if (e.key === 'e' || e.key === 'E') {
            e.preventDefault()
            if (onEdit) onEdit(item)
          }
        }
      }}
    >
      {/* Action Menu - botões deslizantes fixos no lado direito */}
      {showActionMenu && menuStage === 'revealed' && (
        <div className="absolute inset-y-0 right-0 flex items-center z-20 pointer-events-auto">
          <button
            onClick={handleEditAction}
            onPointerDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
            }}
            className="w-20 h-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
            title="Editar"
            aria-label={`Editar produto ${item.name}`}
          >
            <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDeleteAction}
            onPointerDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
            }}
            className="w-20 h-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
            title="Excluir"
            aria-label={`Excluir produto ${item.name}`}
          >
            <RemoveIcon className="w-5 h-5 pointer-events-none" />
          </button>
        </div>
      )}

      {/* Preview Overlay - mostrar ícones durante drag */}
      {isDragging && showPreview && (
        <div className={`absolute inset-0 flex items-center ${dragDirection === 'right' ? 'justify-end pr-6' : 'justify-start pl-6'} pointer-events-none z-10`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            dragDirection === 'right' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {dragDirection === 'right' ? (
              <CheckmarkIcon className="w-5 h-5" />
            ) : (
              <span className="text-lg font-bold">✕</span>
            )}
          </div>
        </div>
      )}
      
      {/* Background Gradient durante drag */}
      {isDragging && dragDirection && (
        <div className={`absolute inset-0 opacity-20 ${
          dragDirection === 'right' 
            ? 'bg-gradient-to-r from-transparent to-green-300' 
            : 'bg-gradient-to-l from-transparent to-red-300'
        }`} />
      )}

      <div className="flex justify-between items-center relative z-20" style={{ pointerEvents: showActionMenu && menuStage === 'revealed' ? 'none' : 'auto' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="item-name font-semibold text-base text-gray-900 truncate">
                {item.name}
              </div>
              {item.price > 0 && (
                <div className="text-xs text-gray-600">
                  {formatPrice(item.price)}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          <div className="flex flex-col items-end min-w-0">
            <div 
              className={`item-quantity text-white text-sm bg-slate-600 px-2.5 py-1.5 rounded-full font-bold text-center whitespace-nowrap transition-opacity duration-200 ${
                showActionMenu && menuStage === 'revealed' ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {item.quantity}
            </div>
          </div>
          
        </div>
      </div>
    </li>
  )
}

export default React.memo(ListItem)