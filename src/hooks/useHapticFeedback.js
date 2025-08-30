import { useCallback } from 'react'
import { triggerHaptic, triggerGestureHaptic, HapticType } from '../utils/hapticUtils'

/**
 * Hook for adding haptic feedback to UI interactions
 * @returns {object} Object with haptic feedback functions
 */
export function useHapticFeedback() {
  // Basic haptic feedback for buttons
  const onButtonPress = useCallback((type = HapticType.SELECTION) => {
    triggerHaptic(type)
  }, [])

  // Success feedback for form submissions, completions
  const onSuccess = useCallback(() => {
    triggerHaptic(HapticType.NOTIFICATION_SUCCESS)
  }, [])

  // Error feedback for validation errors, failures
  const onError = useCallback(() => {
    triggerHaptic(HapticType.NOTIFICATION_ERROR)
  }, [])

  // Warning feedback for important notifications
  const onWarning = useCallback(() => {
    triggerHaptic(HapticType.NOTIFICATION_WARNING)
  }, [])

  // Light tap for selections, toggles
  const onSelection = useCallback(() => {
    triggerHaptic(HapticType.SELECTION)
  }, [])

  // Impact feedback for immediate actions
  const onImpact = useCallback((intensity = 'medium') => {
    switch (intensity) {
      case 'light':
        triggerHaptic(HapticType.IMPACT_LIGHT)
        break
      case 'heavy':
        triggerHaptic(HapticType.IMPACT_HEAVY)
        break
      default:
        triggerHaptic(HapticType.IMPACT_MEDIUM)
    }
  }, [])

  // Specific feedback for different UI actions
  const onToggle = useCallback(() => {
    triggerHaptic(HapticType.SELECTION)
  }, [])

  const onDelete = useCallback(() => {
    triggerHaptic(HapticType.NOTIFICATION_ERROR)
  }, [])

  const onAdd = useCallback(() => {
    triggerHaptic(HapticType.NOTIFICATION_SUCCESS)
  }, [])

  const onEdit = useCallback(() => {
    triggerHaptic(HapticType.SELECTION)
  }, [])

  const onCancel = useCallback(() => {
    triggerHaptic(HapticType.IMPACT_LIGHT)
  }, [])

  const onSubmit = useCallback(() => {
    triggerHaptic(HapticType.IMPACT_MEDIUM)
  }, [])

  // Higher-order function to wrap any onClick handler with haptic feedback
  const withHaptic = useCallback((onClick, hapticType = HapticType.SELECTION) => {
    return (event) => {
      triggerHaptic(hapticType)
      if (onClick) onClick(event)
    }
  }, [])

  // Higher-order function to wrap gesture-based handlers
  const withGestureHaptic = useCallback((onClick, gestureType, direction = null, action = null) => {
    return (event) => {
      triggerGestureHaptic(gestureType, direction, action)
      if (onClick) onClick(event)
    }
  }, [])

  return {
    // Basic feedback
    onButtonPress,
    onSuccess,
    onError,
    onWarning,
    onSelection,
    onImpact,
    
    // Specific actions
    onToggle,
    onDelete,
    onAdd,
    onEdit,
    onCancel,
    onSubmit,
    
    // Higher-order functions
    withHaptic,
    withGestureHaptic,
    
    // Direct access to trigger functions
    triggerHaptic,
    triggerGestureHaptic
  }
}