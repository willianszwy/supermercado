// Utility functions for haptic feedback across different devices and browsers

/**
 * Haptic feedback intensity levels
 */
export const HapticIntensity = {
  LIGHT: 'light',
  MEDIUM: 'medium', 
  HEAVY: 'heavy'
}

/**
 * Haptic feedback types
 */
export const HapticType = {
  SUCCESS: 'success',
  WARNING: 'warning', 
  ERROR: 'error',
  SELECTION: 'selection',
  IMPACT_LIGHT: 'impactLight',
  IMPACT_MEDIUM: 'impactMedium',
  IMPACT_HEAVY: 'impactHeavy',
  NOTIFICATION_SUCCESS: 'notificationSuccess',
  NOTIFICATION_WARNING: 'notificationWarning',
  NOTIFICATION_ERROR: 'notificationError'
}

/**
 * Check if haptic feedback is supported
 * @returns {boolean}
 */
export const isHapticSupported = () => {
  // Check for Vibration API
  if ('vibrate' in navigator) return true
  
  // Check for iOS Haptic Feedback (webkit)
  if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
    return true
  }
  
  // Check for Web Vibration API
  return !!(navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate)
}

/**
 * Check if device is iOS
 * @returns {boolean}
 */
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

/**
 * Check if device is Android
 * @returns {boolean}
 */
const isAndroid = () => {
  return /Android/.test(navigator.userAgent)
}

/**
 * Vibrate function that works across different browsers
 * @param {number|Array<number>} pattern - Vibration pattern
 */
const vibrate = (pattern) => {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(pattern)
    } else if (navigator.webkitVibrate) {
      navigator.webkitVibrate(pattern)
    } else if (navigator.mozVibrate) {
      navigator.mozVibrate(pattern)
    } else if (navigator.msVibrate) {
      navigator.msVibrate(pattern)
    }
  } catch (error) {
    console.warn('Vibration not supported or failed:', error)
  }
}

/**
 * Get vibration pattern based on haptic type
 * @param {string} type - Haptic type
 * @returns {number|Array<number>}
 */
const getVibrationPattern = (type) => {
  switch (type) {
    case HapticType.SUCCESS:
      return [50, 30, 50] // Double tap pattern for success
    
    case HapticType.WARNING:
      return [100, 50, 100, 50, 100] // Triple pulse for warning
    
    case HapticType.ERROR:
      return [200, 100, 200] // Strong double for error
    
    case HapticType.SELECTION:
      return 25 // Quick tap for selection
    
    case HapticType.IMPACT_LIGHT:
      return 20 // Very light tap
    
    case HapticType.IMPACT_MEDIUM:
      return 50 // Medium tap
    
    case HapticType.IMPACT_HEAVY:
      return 100 // Strong tap
    
    case HapticType.NOTIFICATION_SUCCESS:
      return [30, 20, 30, 20, 60] // Ascending pattern
    
    case HapticType.NOTIFICATION_WARNING:
      return [60, 30, 60, 30, 60] // Consistent warning
    
    case HapticType.NOTIFICATION_ERROR:
      return [150, 50, 150, 50, 200] // Strong error pattern
    
    default:
      return 50 // Default medium tap
  }
}

/**
 * Trigger haptic feedback
 * @param {string} type - Type of haptic feedback (from HapticType)
 * @param {object} options - Additional options
 * @param {boolean} options.force - Force haptic even if user preferences might disable it
 * @param {number} options.delay - Delay before triggering (ms)
 */
export const triggerHaptic = (type = HapticType.IMPACT_LIGHT, options = {}) => {
  const { force = false, delay = 0 } = options

  // Check if haptic is supported
  if (!isHapticSupported()) {
    console.debug('Haptic feedback not supported on this device')
    return
  }

  // Check user preferences (respects system settings)
  if (!force && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.debug('Haptic feedback disabled due to user preferences')
    return
  }

  const executeHaptic = () => {
    try {
      // iOS-specific haptic feedback (if available)
      if (isIOS() && window.navigator && window.navigator.vibrate) {
        const pattern = getVibrationPattern(type)
        vibrate(pattern)
        return
      }

      // Android and general web vibration
      if (isAndroid() || navigator.vibrate) {
        const pattern = getVibrationPattern(type)
        vibrate(pattern)
        return
      }

      // Fallback for other devices
      const pattern = getVibrationPattern(type)
      vibrate(pattern)
      
    } catch (error) {
      console.warn('Failed to trigger haptic feedback:', error)
    }
  }

  // Execute immediately or with delay
  if (delay > 0) {
    setTimeout(executeHaptic, delay)
  } else {
    executeHaptic()
  }
}

/**
 * Trigger haptic feedback for gesture events
 * @param {string} gestureType - Type of gesture (drag_start, drag_threshold, drag_complete, etc.)
 * @param {string} direction - Direction of gesture (left, right)
 * @param {string} action - Action being performed (complete, missing, delete, add)
 */
export const triggerGestureHaptic = (gestureType, direction = null, action = null) => {
  switch (gestureType) {
    case 'drag_start':
      triggerHaptic(HapticType.IMPACT_LIGHT)
      break
      
    case 'drag_threshold':
      // Different feedback based on direction/action
      if (direction === 'right' && action === 'complete') {
        triggerHaptic(HapticType.SUCCESS)
      } else if (direction === 'right' && action === 'add') {
        triggerHaptic(HapticType.NOTIFICATION_SUCCESS)
      } else if (direction === 'left' && (action === 'missing' || action === 'delete')) {
        triggerHaptic(HapticType.WARNING)
      } else {
        triggerHaptic(HapticType.IMPACT_MEDIUM)
      }
      break
      
    case 'drag_complete':
      // Strong feedback for completed actions
      if (action === 'complete' || action === 'add') {
        triggerHaptic(HapticType.NOTIFICATION_SUCCESS)
      } else if (action === 'missing') {
        triggerHaptic(HapticType.NOTIFICATION_WARNING)
      } else if (action === 'delete') {
        triggerHaptic(HapticType.NOTIFICATION_ERROR)
      } else {
        triggerHaptic(HapticType.IMPACT_HEAVY)
      }
      break
      
    case 'menu_reveal':
      triggerHaptic(HapticType.IMPACT_LIGHT)
      break
      
    case 'button_tap':
      triggerHaptic(HapticType.SELECTION)
      break
      
    default:
      triggerHaptic(HapticType.IMPACT_LIGHT)
  }
}

/**
 * Request permission for haptic feedback (mainly for iOS)
 * @returns {Promise<boolean>}
 */
export const requestHapticPermission = async () => {
  try {
    // For iOS 13+ devices
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      const permission = await DeviceMotionEvent.requestPermission()
      return permission === 'granted'
    }
    
    // For other devices, assume permission is granted if haptic is supported
    return isHapticSupported()
  } catch (error) {
    console.warn('Failed to request haptic permission:', error)
    return false
  }
}

/**
 * Initialize haptic feedback system
 * Should be called once when the app starts, preferably after user interaction
 */
export const initializeHaptics = async () => {
  try {
    // Request permission if needed
    const hasPermission = await requestHapticPermission()
    
    if (hasPermission) {
      console.debug('Haptic feedback initialized successfully')
      
      // Test haptic to ensure it's working
      triggerHaptic(HapticType.IMPACT_LIGHT)
      
      return true
    } else {
      console.debug('Haptic feedback permission denied or not supported')
      return false
    }
  } catch (error) {
    console.warn('Failed to initialize haptic feedback:', error)
    return false
  }
}