import { useState, useRef, useEffect, useCallback } from 'react'

const DRAG_THRESHOLD = 120
const MENU_REVEAL_THRESHOLD = 60
const MENU_COMPLETE_THRESHOLD = 120
const SENSITIVITY_THRESHOLD = 30

export function useGestureHandler({ item, onUpdateStatus, onEdit }) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [dragDirection, setDragDirection] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [menuStage, setMenuStage] = useState('hidden')
  const startPosRef = useRef(0)

  const resetDragState = useCallback(() => {
    setIsDragging(false)
    setDragOffset(0)
    setDragDirection(null)
    setShowPreview(false)
  }, [])

  const resetMenuState = useCallback(() => {
    setShowActionMenu(false)
    setMenuStage('hidden')
  }, [])

  const handleStart = useCallback((clientX) => {
    if (item.status !== 'pending') return false
    startPosRef.current = clientX
    setIsDragging(true)
    return true
  }, [item.status])

  const updateDragState = useCallback((offset) => {
    setDragOffset(offset)
    
    if (Math.abs(offset) > SENSITIVITY_THRESHOLD) {
      const direction = offset > 0 ? 'right' : 'left'
      setDragDirection(direction)
      
      if (direction === 'right') {
        // Right swipe: show completion preview
        setShowPreview(Math.abs(offset) > DRAG_THRESHOLD * 0.6)
        setShowActionMenu(false)
        setMenuStage('hidden')
      } else {
        // Left swipe: progressive menu system
        const absOffset = Math.abs(offset)
        if (absOffset >= MENU_REVEAL_THRESHOLD && absOffset < MENU_COMPLETE_THRESHOLD) {
          // Stage 1: Menu revealed (60-120px)
          setShowActionMenu(true)
          setMenuStage('revealed')
          setShowPreview(false)
        } else if (absOffset >= MENU_COMPLETE_THRESHOLD) {
          // Stage 2: Missing action (120px+)
          setShowActionMenu(false)
          setMenuStage('action')
          setShowPreview(true)
        } else {
          // Less than 60px: hide menu
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
  }, [])

  const handleEnd = useCallback(() => {
    if (!isDragging || item.status !== 'pending') {
      resetDragState()
      return
    }
    
    // Execute actions based on drag distance
    if (dragOffset > DRAG_THRESHOLD) {
      // Right swipe: mark as completed
      onUpdateStatus(item.id, 'completed')
    } else if (dragOffset < -MENU_COMPLETE_THRESHOLD) {
      // Left swipe beyond threshold: mark as missing
      onUpdateStatus(item.id, 'missing')
    }
    
    resetDragState()
    
    // Keep menu visible if in revealed state
    if (menuStage !== 'revealed') {
      resetMenuState()
    }
  }, [isDragging, dragOffset, item.status, item.id, onUpdateStatus, menuStage, resetDragState, resetMenuState])

  const cancelGesture = useCallback(() => {
    resetDragState()
    resetMenuState()
  }, [resetDragState, resetMenuState])

  // Pointer Events
  const handlePointerDown = useCallback((e) => {
    if (handleStart(e.clientX)) {
      e.currentTarget.setPointerCapture?.(e.pointerId)
    }
  }, [handleStart])

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return
    const offset = e.clientX - startPosRef.current
    updateDragState(offset)
  }, [isDragging, updateDragState])

  const handlePointerUp = useCallback((e) => {
    if (!isDragging) return
    e.currentTarget?.releasePointerCapture?.(e.pointerId)
    handleEnd()
  }, [isDragging, handleEnd])

  // Mouse Events
  const handleMouseDown = useCallback((e) => {
    handleStart(e.clientX)
  }, [handleStart])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    const offset = e.clientX - startPosRef.current
    updateDragState(offset)
  }, [isDragging, updateDragState])

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return
    handleEnd()
  }, [isDragging, handleEnd])

  // Touch Events
  const handleTouchStart = useCallback((e) => {
    handleStart(e.touches[0].clientX)
  }, [handleStart])

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return
    // Only prevent default for drag operations, not button touches
    if (e.cancelable && Math.abs(e.touches[0].clientX - startPosRef.current) > 10) {
      e.preventDefault()
    }
    const offset = e.touches[0].clientX - startPosRef.current
    updateDragState(offset)
  }, [isDragging, updateDragState])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return
    handleEnd()
  }, [isDragging, handleEnd])

  // Keyboard Events
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && (isDragging || showActionMenu)) {
      cancelGesture()
    }
  }, [isDragging, showActionMenu, cancelGesture])

  // Menu Action Handlers
  const handleEditAction = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onEdit) onEdit(item)
    resetMenuState()
  }, [onEdit, item, resetMenuState])

  const handleDeleteAction = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    onUpdateStatus(item.id, 'delete')
    resetMenuState()
  }, [onUpdateStatus, item.id, resetMenuState])

  // Global event listeners for dragging
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
      // Mouse events
      document.addEventListener('mousemove', handleMouseMove, { passive: true })
      document.addEventListener('mouseup', handleMouseUp, { passive: true })
      
      // Keyboard events
      document.addEventListener('keydown', handleKeyDown, { passive: true })
      
      // Touch events with specific configuration
      const touchMoveOptions = {
        passive: false,
        capture: false
      }
      
      document.addEventListener('touchmove', handleTouchMove, touchMoveOptions)
      document.addEventListener('touchend', handleTouchEnd, { passive: true })
    } catch (error) {
      // Fallback if can't register with passive: false
      console.warn('Failed to register touch events with passive: false', error)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleTouchEnd)
    }
    
    return cleanup
  }, [isDragging, handleMouseMove, handleMouseUp, handleKeyDown, handleTouchMove, handleTouchEnd])

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = () => {
      if (showActionMenu && !isDragging) {
        resetMenuState()
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
  }, [showActionMenu, isDragging, resetMenuState])

  return {
    // State
    isDragging,
    dragOffset,
    dragDirection,
    showPreview,
    showActionMenu,
    menuStage,
    
    // Event handlers
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleMouseDown,
    handleTouchStart,
    
    // Action handlers
    handleEditAction,
    handleDeleteAction,
    
    // Utility functions
    cancelGesture,
    
    // Constants
    dragThreshold: DRAG_THRESHOLD,
    menuRevealThreshold: MENU_REVEAL_THRESHOLD,
    menuCompleteThreshold: MENU_COMPLETE_THRESHOLD
  }
}