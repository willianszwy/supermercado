import { useState, useRef, useEffect, useCallback } from 'react'
import { triggerGestureHaptic } from '../utils/hapticUtils'

const DRAG_THRESHOLD = 120
const MENU_REVEAL_THRESHOLD = 60
const MENU_COMPLETE_THRESHOLD = 120
const SENSITIVITY_THRESHOLD = 30

export function useNewListGestureHandler({ product, onAddProduct, onRemoveProduct, isSelected }) {
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
    startPosRef.current = clientX
    setIsDragging(true)
    
    // Haptic feedback when drag starts
    triggerGestureHaptic('drag_start')
    
    return true
  }, [])

  const updateDragState = useCallback((offset) => {
    setDragOffset(offset)
    
    if (Math.abs(offset) > SENSITIVITY_THRESHOLD) {
      const direction = offset > 0 ? 'right' : 'left'
      setDragDirection(direction)
      
      if (direction === 'right') {
        // Right swipe: show add to list preview
        const isPreview = Math.abs(offset) > DRAG_THRESHOLD * 0.6
        const wasPreview = showPreview
        
        setShowPreview(isPreview)
        setShowActionMenu(false)
        setMenuStage('hidden')
        
        // Haptic feedback when reaching threshold for add
        if (isPreview && !wasPreview) {
          triggerGestureHaptic('drag_threshold', 'right', 'add')
        }
      } else {
        // Left swipe: progressive menu system
        const absOffset = Math.abs(offset)
        const prevMenuStage = menuStage
        
        if (absOffset >= MENU_REVEAL_THRESHOLD && absOffset < MENU_COMPLETE_THRESHOLD) {
          // Stage 1: Menu revealed (60-120px)
          setShowActionMenu(true)
          setMenuStage('revealed')
          setShowPreview(false)
          
          // Haptic feedback when menu is first revealed
          if (prevMenuStage === 'hidden') {
            triggerGestureHaptic('menu_reveal')
          }
        } else if (absOffset >= MENU_COMPLETE_THRESHOLD) {
          // Stage 2: Delete action (120px+)
          setShowActionMenu(false)
          setMenuStage('action')
          setShowPreview(true)
          
          // Haptic feedback when reaching delete threshold
          if (prevMenuStage === 'revealed') {
            triggerGestureHaptic('drag_threshold', 'left', 'delete')
          }
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
    if (!isDragging) {
      resetDragState()
      return
    }
    
    // Execute actions based on drag distance
    if (dragOffset > DRAG_THRESHOLD) {
      // Right swipe: add to list
      triggerGestureHaptic('drag_complete', 'right', 'add')
      onAddProduct(product.name, product.lastQuantity, product.category, product.suggestedPrice)
    } else if (dragOffset < -MENU_COMPLETE_THRESHOLD) {
      // Left swipe beyond threshold: delete product permanently
      triggerGestureHaptic('drag_complete', 'left', 'delete')
      onRemoveProduct(product.name)
    }
    
    resetDragState()
    
    // Keep menu visible if in revealed state
    if (menuStage !== 'revealed') {
      resetMenuState()
    }
  }, [isDragging, dragOffset, product, onAddProduct, onRemoveProduct, menuStage, resetDragState, resetMenuState])

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
  const handleAddAction = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Haptic feedback for add button tap
    triggerGestureHaptic('button_tap')
    
    onAddProduct(product.name, product.lastQuantity, product.category, product.suggestedPrice)
    resetMenuState()
  }, [onAddProduct, product, resetMenuState])

  const handleDeleteAction = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Haptic feedback for delete action
    triggerGestureHaptic('drag_complete', 'left', 'delete')
    
    onRemoveProduct(product.name)
    resetMenuState()
  }, [onRemoveProduct, product.name, resetMenuState])

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
    handleAddAction,
    handleDeleteAction,
    
    // Utility functions
    cancelGesture,
    
    // Constants
    dragThreshold: DRAG_THRESHOLD,
    menuRevealThreshold: MENU_REVEAL_THRESHOLD,
    menuCompleteThreshold: MENU_COMPLETE_THRESHOLD
  }
}