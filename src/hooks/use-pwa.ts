'use client'

import { useState, useEffect } from 'react'

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)

  useEffect(() => {
    // Kurulum durumunu kontrol et
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true
      setIsInstalled(standalone)
    }

    // Online/Offline durumunu kontrol et
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    checkInstalled()
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Service Worker güncellemelerini kontrol et
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setIsUpdateAvailable(true)
              }
            })
          }
        })
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    isInstalled,
    isOnline,
    isUpdateAvailable,
  }
}
