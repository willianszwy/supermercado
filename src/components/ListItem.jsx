import { useState, useRef, useEffect, useCallback } from 'react'

function ListItem({ item, onUpdateStatus, statusType }) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startPosRef = useRef(0)
  const dragThreshold = 50

  const handleStart = (clientX) => {
    startPosRef.current = clientX
    setIsDragging(true)
  }


  // Mouse events
  const handleMouseDown = (e) => {
    if (item.status !== 'pending') return
    handleStart(e.clientX)
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    const offset = e.clientX - startPosRef.current
    setDragOffset(offset)
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return
    
    if (Math.abs(dragOffset) > dragThreshold && item.status === 'pending') {
      if (dragOffset > 0) {
        onUpdateStatus(item.id, 'completed')
      } else {
        onUpdateStatus(item.id, 'missing')
      }
    }
    
    setIsDragging(false)
    setDragOffset(0)
  }, [isDragging, dragOffset, item.status, item.id, onUpdateStatus, dragThreshold])

  // Touch events
  const handleTouchStart = (e) => {
    if (item.status !== 'pending') return
    e.preventDefault()
    handleStart(e.touches[0].clientX)
  }

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return
    e.preventDefault()
    const offset = e.touches[0].clientX - startPosRef.current
    setDragOffset(offset)
  }, [isDragging])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return
    
    if (Math.abs(dragOffset) > dragThreshold && item.status === 'pending') {
      if (dragOffset > 0) {
        onUpdateStatus(item.id, 'completed')
      } else {
        onUpdateStatus(item.id, 'missing')
      }
    }
    
    setIsDragging(false)
    setDragOffset(0)
  }, [isDragging, dragOffset, item.status, item.id, onUpdateStatus, dragThreshold])

  // Add global event listeners when dragging starts
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  const getDragClasses = () => {
    if (!isDragging || Math.abs(dragOffset) < dragThreshold) return ''
    return dragOffset > 0 ? 'drag-right' : 'drag-left'
  }

  const getStatusClasses = () => {
    if (statusType === 'completed') return 'bg-green-50 border-primary-green'
    if (statusType === 'missing') return 'bg-primary-red-light border-primary-red'
    return 'bg-white border-gray-200'
  }

  return (
    <li
      className={`${getStatusClasses()} border-2 rounded-lg p-3 mb-2 shadow-sm transition-all duration-300 select-none cursor-grab ${getDragClasses()} ${isDragging ? 'opacity-50 transform rotate-1' : ''}`}
      style={{ transform: isDragging ? `translateX(${dragOffset}px)` : undefined }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="flex justify-between items-center">
        <div className="item-name font-semibold text-base">{item.name}</div>
        <div className="item-quantity text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">
          Qtd: {item.quantity}
        </div>
      </div>
    </li>
  )
}

export default ListItem