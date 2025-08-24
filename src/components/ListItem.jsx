import { useState, useRef, useEffect, useCallback } from 'react'
import RemoveIcon from './RemoveIcon'
import CheckmarkIcon from './CheckmarkIcon'
import { formatPrice } from '../utils/priceUtils'


function ListItem({ item, onUpdateStatus, statusType }) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [dragDirection, setDragDirection] = useState(null) // 'left' | 'right' | null
  const [showPreview, setShowPreview] = useState(false)
  const startPosRef = useRef(0)
  const dragThreshold = 80 // Aumentado para melhor feedback

  const handleStart = (clientX) => {
    startPosRef.current = clientX
    setIsDragging(true)
  }

  // Pointer Events (mais moderno e confiável)
  const handlePointerDown = (e) => {
    if (item.status !== 'pending') return
    // Capturar o pointer para garantir que recebemos todos os eventos
    e.currentTarget.setPointerCapture?.(e.pointerId)
    handleStart(e.clientX)
  }

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return
    const offset = e.clientX - startPosRef.current
    setDragOffset(offset)
    
    // Atualizar direção e preview baseado no offset
    if (Math.abs(offset) > 20) {
      const direction = offset > 0 ? 'right' : 'left'
      setDragDirection(direction)
      setShowPreview(Math.abs(offset) > dragThreshold * 0.6)
    } else {
      setDragDirection(null)
      setShowPreview(false)
    }
  }, [isDragging, dragThreshold])

  const handlePointerUp = useCallback((e) => {
    if (!isDragging) return
    
    // Liberar a captura do pointer
    e.currentTarget?.releasePointerCapture?.(e.pointerId)
    
    if (Math.abs(dragOffset) > dragThreshold && item.status === 'pending') {
      if (dragOffset > 0) {
        onUpdateStatus(item.id, 'completed')
      } else {
        onUpdateStatus(item.id, 'missing')
      }
    }
    
    // Reset all states
    setIsDragging(false)
    setDragOffset(0)
    setDragDirection(null)
    setShowPreview(false)
  }, [isDragging, dragOffset, item.status, item.id, onUpdateStatus, dragThreshold])


  // Mouse events
  const handleMouseDown = (e) => {
    if (item.status !== 'pending') return
    handleStart(e.clientX)
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    const offset = e.clientX - startPosRef.current
    setDragOffset(offset)
    
    // Atualizar direção e preview baseado no offset
    if (Math.abs(offset) > 20) { // Threshold mínimo para mostrar direção
      const direction = offset > 0 ? 'right' : 'left'
      setDragDirection(direction)
      setShowPreview(Math.abs(offset) > dragThreshold * 0.6) // Preview a 60% do threshold
    } else {
      setDragDirection(null)
      setShowPreview(false)
    }
  }, [isDragging, dragThreshold])

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return
    
    if (Math.abs(dragOffset) > dragThreshold && item.status === 'pending') {
      if (dragOffset > 0) {
        onUpdateStatus(item.id, 'completed')
      } else {
        onUpdateStatus(item.id, 'missing')
      }
    }
    
    // Reset all states
    setIsDragging(false)
    setDragOffset(0)
    setDragDirection(null)
    setShowPreview(false)
  }, [isDragging, dragOffset, item.status, item.id, onUpdateStatus, dragThreshold])

  // Touch events
  const handleTouchStart = (e) => {
    if (item.status !== 'pending') return
    // Não usar preventDefault aqui - deixar o browser gerenciar
    handleStart(e.touches[0].clientX)
  }

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return
    // Tentar preventDefault apenas se possível
    if (e.cancelable) {
      e.preventDefault()
    }
    const offset = e.touches[0].clientX - startPosRef.current
    setDragOffset(offset)
    
    // Atualizar direção e preview baseado no offset
    if (Math.abs(offset) > 20) { // Threshold mínimo para mostrar direção
      const direction = offset > 0 ? 'right' : 'left'
      setDragDirection(direction)
      setShowPreview(Math.abs(offset) > dragThreshold * 0.6) // Preview a 60% do threshold
    } else {
      setDragDirection(null)
      setShowPreview(false)
    }
  }, [isDragging, dragThreshold])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return
    
    if (Math.abs(dragOffset) > dragThreshold && item.status === 'pending') {
      if (dragOffset > 0) {
        onUpdateStatus(item.id, 'completed')
      } else {
        onUpdateStatus(item.id, 'missing')
      }
    }
    
    // Reset all states
    setIsDragging(false)
    setDragOffset(0)
    setDragDirection(null)
    setShowPreview(false)
  }, [isDragging, dragOffset, item.status, item.id, onUpdateStatus, dragThreshold])

  // Cancelar gesto com Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && isDragging) {
      setIsDragging(false)
      setDragOffset(0)
      setDragDirection(null)
      setShowPreview(false)
    }
  }, [isDragging])

  // Add global event listeners when dragging starts
  useEffect(() => {
    if (isDragging) {
      // Mouse events (sempre funcionam)
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      // Keyboard events
      document.addEventListener('keydown', handleKeyDown)
      
      // Touch events com configuração específica
      const touchMoveOptions = {
        passive: false, // Tentar desabilitar passive
        capture: false
      }
      
      try {
        document.addEventListener('touchmove', handleTouchMove, touchMoveOptions)
        document.addEventListener('touchend', handleTouchEnd, { passive: true })
      } catch (error) {
        // Fallback se não conseguir registrar com passive: false
        document.addEventListener('touchmove', handleTouchMove)
        document.addEventListener('touchend', handleTouchEnd)
      }
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleKeyDown, handleTouchMove, handleTouchEnd])

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
    if (statusType === 'completed') return 'bg-green-50 border-primary-green'
    if (statusType === 'missing') return 'bg-primary-red-light border-primary-red'
    return 'bg-white border-gray-200'
  }

  return (
    <li
      className={`item-card ${getStatusClasses()} border-2 rounded-lg p-2.5 sm:p-3 mb-1.5 shadow-sm transition-all duration-300 select-none ${isDragging ? 'cursor-grabbing opacity-90 transform rotate-1 shadow-lg' : 'cursor-grab'} ${getDragClasses()} relative overflow-hidden`}
      style={{ 
        transform: isDragging ? `translateX(${dragOffset}px)` : undefined,
        touchAction: item.status === 'pending' ? 'pan-y' : 'auto' // Permite scroll vertical, bloqueia horizontal
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={isDragging ? handlePointerMove : undefined}
      onPointerUp={isDragging ? handlePointerUp : undefined}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
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

      <div className="flex justify-between items-center relative z-20">
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
            <div className="item-quantity text-white text-sm bg-slate-600 px-2.5 py-1.5 rounded-full font-bold text-center whitespace-nowrap">
              {item.quantity}
            </div>
          </div>
          
          {item.status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onUpdateStatus(item.id, 'delete')
              }}
              className="w-9 h-9 rounded-full bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 flex items-center justify-center transition-colors"
              title="Remover item"
            >
              <RemoveIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

export default ListItem