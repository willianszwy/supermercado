import { useState, useRef, useEffect, useCallback } from 'react'
import RemoveIcon from './RemoveIcon'
import CheckmarkIcon from './CheckmarkIcon'
import { formatPrice } from '../utils/priceUtils'


function ListItem({ item, onUpdateStatus, statusType, onEdit }) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [dragDirection, setDragDirection] = useState(null) // 'left' | 'right' | null
  const [showPreview, setShowPreview] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [menuStage, setMenuStage] = useState('hidden') // 'hidden' | 'revealed' | 'action'
  const startPosRef = useRef(0)
  const dragThreshold = 80 // Aumentado para melhor feedback
  const menuRevealThreshold = 40 // Threshold para revelar menu
  const menuCompleteThreshold = 80 // Threshold para ação "em falta"


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
    
    
    // Atualizar direção baseado no offset
    if (Math.abs(offset) > 20) {
      const direction = offset > 0 ? 'right' : 'left'
      setDragDirection(direction)
      
      if (direction === 'right') {
        // Swipe direita: comportamento original (mostrar preview direto)
        setShowPreview(Math.abs(offset) > dragThreshold * 0.6)
        setShowActionMenu(false)
        setMenuStage('hidden')
      } else {
        // Swipe esquerda: novo sistema de menu
        const absOffset = Math.abs(offset)
        if (absOffset >= menuRevealThreshold && absOffset < menuCompleteThreshold) {
          // Etapa 1: Menu revelado (40-80px)
          setShowActionMenu(true)
          setMenuStage('revealed')
          setShowPreview(false)
        } else if (absOffset >= menuCompleteThreshold) {
          // Etapa 2: Ação "em falta" (80px+)
          setShowActionMenu(false)
          setMenuStage('action')
          setShowPreview(true)
        } else {
          // Menos de 40px: esconder menu
          setShowActionMenu(false)
          setMenuStage('hidden')
          setShowPreview(false)
        }
      }
    } else {
      setDragDirection(null)
      setShowPreview(false)
      setShowActionMenu(false)
      setMenuStage('hidden')
    }
  }, [isDragging, dragThreshold, menuRevealThreshold, menuCompleteThreshold])

  const handlePointerUp = useCallback((e) => {
    if (!isDragging) return
    
    
    // Liberar a captura do pointer
    e.currentTarget?.releasePointerCapture?.(e.pointerId)
    
    if (item.status === 'pending') {
      if (dragOffset > dragThreshold) {
        // Swipe direita: marcar como comprado
        onUpdateStatus(item.id, 'completed')
      } else if (dragOffset < -menuCompleteThreshold) {
        // Swipe esquerda além do threshold: marcar como em falta
        onUpdateStatus(item.id, 'missing')
      }
      // Se está no range do menu (40-80px), não fazer ação automática
      // O usuário pode clicar nos botões ou arrastar mais
    }
    
    // Reset dragging states
    setIsDragging(false)
    setDragOffset(0)
    setDragDirection(null)
    setShowPreview(false)
    
    // Manter menu visível se estava na zona de menu
    if (menuStage !== 'revealed') {
      setShowActionMenu(false)
      setMenuStage('hidden')
    }
  }, [isDragging, dragOffset, item.status, item.id, onUpdateStatus, dragThreshold, menuCompleteThreshold, menuStage])


  // Mouse events
  const handleMouseDown = (e) => {
    if (item.status !== 'pending') return
    handleStart(e.clientX)
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    const offset = e.clientX - startPosRef.current
    setDragOffset(offset)
    
    
    // Atualizar direção baseado no offset
    if (Math.abs(offset) > 20) {
      const direction = offset > 0 ? 'right' : 'left'
      setDragDirection(direction)
      
      if (direction === 'right') {
        // Swipe direita: comportamento original (mostrar preview direto)
        setShowPreview(Math.abs(offset) > dragThreshold * 0.6)
        setShowActionMenu(false)
        setMenuStage('hidden')
      } else {
        // Swipe esquerda: novo sistema de menu
        const absOffset = Math.abs(offset)
        if (absOffset >= menuRevealThreshold && absOffset < menuCompleteThreshold) {
          // Etapa 1: Menu revelado (40-80px)
          setShowActionMenu(true)
          setMenuStage('revealed')
          setShowPreview(false)
        } else if (absOffset >= menuCompleteThreshold) {
          // Etapa 2: Ação "em falta" (80px+)
          setShowActionMenu(false)
          setMenuStage('action')
          setShowPreview(true)
        } else {
          // Menos de 40px: esconder menu
          setShowActionMenu(false)
          setMenuStage('hidden')
          setShowPreview(false)
        }
      }
    } else {
      setDragDirection(null)
      setShowPreview(false)
      setShowActionMenu(false)
      setMenuStage('hidden')
    }
  }, [isDragging, dragThreshold, menuRevealThreshold, menuCompleteThreshold])

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return
    
    
    if (item.status === 'pending') {
      if (dragOffset > dragThreshold) {
        // Swipe direita: marcar como comprado
        onUpdateStatus(item.id, 'completed')
      } else if (dragOffset < -menuCompleteThreshold) {
        // Swipe esquerda além do threshold: marcar como em falta
        onUpdateStatus(item.id, 'missing')
      }
    }
    
    // Reset dragging states
    setIsDragging(false)
    setDragOffset(0)
    setDragDirection(null)
    setShowPreview(false)
    
    // Manter menu visível se estava na zona de menu
    if (menuStage !== 'revealed') {
      setShowActionMenu(false)
      setMenuStage('hidden')
    }
  }, [isDragging, dragOffset, item.status, item.id, onUpdateStatus, dragThreshold, menuCompleteThreshold, menuStage])

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
    
    
    // Atualizar direção baseado no offset
    if (Math.abs(offset) > 20) {
      const direction = offset > 0 ? 'right' : 'left'
      setDragDirection(direction)
      
      if (direction === 'right') {
        // Swipe direita: comportamento original (mostrar preview direto)
        setShowPreview(Math.abs(offset) > dragThreshold * 0.6)
        setShowActionMenu(false)
        setMenuStage('hidden')
      } else {
        // Swipe esquerda: novo sistema de menu
        const absOffset = Math.abs(offset)
        if (absOffset >= menuRevealThreshold && absOffset < menuCompleteThreshold) {
          // Etapa 1: Menu revelado (40-80px)
          setShowActionMenu(true)
          setMenuStage('revealed')
          setShowPreview(false)
        } else if (absOffset >= menuCompleteThreshold) {
          // Etapa 2: Ação "em falta" (80px+)
          setShowActionMenu(false)
          setMenuStage('action')
          setShowPreview(true)
        } else {
          // Menos de 40px: esconder menu
          setShowActionMenu(false)
          setMenuStage('hidden')
          setShowPreview(false)
        }
      }
    } else {
      setDragDirection(null)
      setShowPreview(false)
      setShowActionMenu(false)
      setMenuStage('hidden')
    }
  }, [isDragging, dragThreshold, menuRevealThreshold, menuCompleteThreshold])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return
    
    
    if (item.status === 'pending') {
      if (dragOffset > dragThreshold) {
        // Swipe direita: marcar como comprado
        onUpdateStatus(item.id, 'completed')
      } else if (dragOffset < -menuCompleteThreshold) {
        // Swipe esquerda além do threshold: marcar como em falta
        onUpdateStatus(item.id, 'missing')
      }
    }
    
    // Reset dragging states
    setIsDragging(false)
    setDragOffset(0)
    setDragDirection(null)
    setShowPreview(false)
    
    // Manter menu visível se estava na zona de menu
    if (menuStage !== 'revealed') {
      setShowActionMenu(false)
      setMenuStage('hidden')
    }
  }, [isDragging, dragOffset, item.status, item.id, onUpdateStatus, dragThreshold, menuCompleteThreshold, menuStage])

  // Cancelar gesto com Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && (isDragging || showActionMenu)) {
      setIsDragging(false)
      setDragOffset(0)
      setDragDirection(null)
      setShowPreview(false)
      setShowActionMenu(false)
      setMenuStage('hidden')
    }
  }, [isDragging, showActionMenu])

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      if (showActionMenu && !isDragging) {
        setShowActionMenu(false)
        setMenuStage('hidden')
      }
    }

    if (showActionMenu && !isDragging) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
        document.removeEventListener('touchstart', handleClickOutside)
      }
    }
  }, [showActionMenu, isDragging])


  // Add global event listeners when dragging starts
  useEffect(() => {
    if (!isDragging) return

    const cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    try {
      // Mouse events (sempre funcionam)
      document.addEventListener('mousemove', handleMouseMove, { passive: true })
      document.addEventListener('mouseup', handleMouseUp, { passive: true })
      
      // Keyboard events
      document.addEventListener('keydown', handleKeyDown, { passive: true })
      
      // Touch events com configuração específica
      const touchMoveOptions = {
        passive: false, // Tentar desabilitar passive
        capture: false
      }
      
      document.addEventListener('touchmove', handleTouchMove, touchMoveOptions)
      document.addEventListener('touchend', handleTouchEnd, { passive: true })
    } catch (error) {
      // Fallback se não conseguir registrar com passive: false
      console.warn('Failed to register touch events with passive: false', error)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleTouchEnd)
    }
    
    // Cleanup function
    return cleanup
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
      className={`item-card ${getStatusClasses()} border-2 rounded-lg p-2.5 sm:p-3 mb-1.5 shadow-sm transition-all duration-300 select-none min-h-[60px] ${isDragging ? 'cursor-grabbing opacity-90 transform rotate-1 shadow-lg' : 'cursor-grab'} ${getDragClasses()} relative overflow-hidden`}
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
      {/* Action Menu - botões deslizantes fixos no lado direito */}
      {showActionMenu && menuStage === 'revealed' && (
        <div className="absolute inset-y-0 right-0 flex items-center z-10">
          <button
            onClick={() => {
              onEdit && onEdit(item)
              setShowActionMenu(false)
              setMenuStage('hidden')
            }}
            className="w-20 h-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
            title="Editar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => {
              onUpdateStatus(item.id, 'delete')
              setShowActionMenu(false)
              setMenuStage('hidden')
            }}
            className="w-20 h-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
            title="Excluir"
          >
            <RemoveIcon className="w-5 h-5" />
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
          
        </div>
      </div>
    </li>
  )
}

export default ListItem