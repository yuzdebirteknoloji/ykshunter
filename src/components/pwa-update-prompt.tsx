'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function PWAUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)

        // Yeni service worker bekliyor mu kontrol et
        if (reg.waiting) {
          setShowUpdate(true)
        }

        // Yeni service worker yüklendiğinde
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true)
              }
            })
          }
        })
      })

      // Controller değiştiğinde sayfayı yenile
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    }
  }, [mounted])

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  if (!mounted || !showUpdate) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
      >
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-[2px] rounded-xl shadow-2xl">
          <div className="bg-background rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">
                  Yeni Güncelleme Mevcut
                </h3>
                <p className="text-xs text-muted-foreground">
                  Yeni özellikleri kullanmak için güncelleyin
                </p>
              </div>
              <button
                onClick={handleUpdate}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm whitespace-nowrap"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
