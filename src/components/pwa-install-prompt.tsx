'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // iOS kontrolü
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Standalone mode kontrolü
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    // Daha önce kapatıldı mı kontrol et
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedTime = dismissed ? parseInt(dismissed) : 0
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)

    // Eğer standalone modda değilse ve 7 günden fazla geçmişse göster
    if (!standalone && daysSinceDismissed > 7) {
      // Android için beforeinstallprompt event'ini dinle
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setShowPrompt(true)
      }

      window.addEventListener('beforeinstallprompt', handler)

      // iOS için direkt göster
      if (iOS && !standalone) {
        setTimeout(() => setShowPrompt(true), 3000) // 3 saniye sonra göster
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handler)
      }
    }
  }, [mounted])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA kurulumu kabul edildi')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Kurulum hatası:', error)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    setShowPrompt(false)
  }

  if (!mounted || isStandalone || !showPrompt) return null

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] rounded-2xl shadow-2xl">
            <div className="bg-background rounded-2xl p-4 relative">
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-accent transition-colors"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-bold text-lg mb-1">
                    Uygulamayı Yükle
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isIOS 
                      ? 'Safari\'de paylaş butonuna basıp "Ana Ekrana Ekle" seçeneğini kullanın'
                      : 'Learn Game\'i cihazınıza yükleyin ve çevrimdışı kullanın'
                    }
                  </p>
                </div>
              </div>

              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  Şimdi Yükle
                </button>
              )}

              {isIOS && (
                <div className="mt-3 p-3 bg-accent rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-2xl">⬆️</span>
                    <span className="text-muted-foreground">
                      Safari'de paylaş butonuna basın
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-2">
                    <span className="text-2xl">➕</span>
                    <span className="text-muted-foreground">
                      "Ana Ekrana Ekle" seçeneğini seçin
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
