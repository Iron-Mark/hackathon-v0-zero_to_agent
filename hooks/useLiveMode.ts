import { useState, useEffect } from 'react'

const STORAGE_KEY = 'hireproof_live_mode'

export function useLiveMode(defaultState = false) {
  const [isLiveMode, setIsLiveMode] = useState(defaultState)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        setIsLiveMode(stored === 'true')
      }
    } catch (e) {
      console.error('Failed to load live mode state:', e)
    }
    setIsLoaded(true)
  }, [])

  const toggleLiveMode = () => {
    try {
      const newState = !isLiveMode
      setIsLiveMode(newState)
      localStorage.setItem(STORAGE_KEY, String(newState))
    } catch (e) {
      console.error('Failed to save live mode state:', e)
    }
  }

  const setLiveMode = (state: boolean) => {
    try {
      setIsLiveMode(state)
      localStorage.setItem(STORAGE_KEY, String(state))
    } catch (e) {
      console.error('Failed to save live mode state:', e)
    }
  }

  return {
    isLiveMode,
    isLoaded,
    toggleLiveMode,
    setLiveMode,
  }
}
