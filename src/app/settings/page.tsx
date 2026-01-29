'use client'

import { useState, useEffect } from 'react'
import { Download, Smartphone, Wifi, WifiOff, RefreshCw, Trash2, HardDrive, Monitor, Apple } from 'lucide-react'
import { usePWA } from '@/hooks/use-pwa'
import { motion } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function SettingsPage() {
  const { isInstalled, isOnline, isUpdateAvailable } = usePWA()
  const [cacheSize, setCacheSize] = useState<number | null>(null)
  const [storageUsage, setStorageUsage] = useState<{ used: number; quota: number } | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    // iOS kontrolü
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Install prompt'u dinle
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  useEffect(() => {
    // Cache boyutunu hesapla
    if ('caches' in window) {
      caches.keys().then(async (names) => {
        let totalSize = 0
        for (const name of names) {
          const cache = await caches.open(name)
          const keys = await cache.keys()
          for (const request of keys) {
            const response = await cache.match(request)
            if (response) {
              const blob = await response.blob()
              totalSize += blob.size
            }
          }
        }
        setCacheSize(totalSize)
      })
    }

    // Storage kullanımını kontrol et
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then((estimate) => {
        setStorageUsage({
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
        })
      })
    }
  }, [])

  const handleClearCache = async () => {
    if ('caches' in window) {
      const names = await caches.keys()
      await Promise.all(names.map((name) => caches.delete(name)))
      setCacheSize(0)
      alert('Önbellek temizlendi!')
      window.location.reload()
    }
  }

  const handleUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      await registration.update()
      alert('Güncelleme kontrol ediliyor...')
    }
  }

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert('Kurulum şu anda mevcut değil. Lütfen tarayıcınızın adres çubuğundaki yükleme simgesini kontrol edin.')
      return
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA kurulumu kabul edildi')
        setCanInstall(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Kurulum hatası:', error)
      alert('Kurulum sırasında bir hata oluştu')
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Ayarlar</h1>
          <p className="text-muted-foreground">
            Uygulama ayarlarını ve önbellek yönetimini buradan yapabilirsiniz
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Kurulum Butonu */}
          {!isInstalled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] rounded-2xl"
            >
              <div className="bg-background rounded-2xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                      Uygulamayı Yükle
                    </h2>
                    <p className="text-muted-foreground">
                      Learn Game'i cihazınıza yükleyin ve uygulama gibi kullanın. 
                      Daha hızlı erişim, çevrimdışı kullanım ve daha iyi performans.
                    </p>
                  </div>
                </div>

                {/* Desktop Install */}
                {canInstall && !isIOS && (
                  <button
                    onClick={handleInstall}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl mb-4"
                  >
                    <Monitor className="w-6 h-6" />
                    Masaüstüne Yükle
                  </button>
                )}

                {/* iOS Instructions */}
                {isIOS && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Apple className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold text-blue-500">iOS Kurulum</h3>
                    </div>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-foreground">1.</span>
                        <span>Safari'de bu sayfayı açın</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-foreground">2.</span>
                        <span>Alttaki paylaş butonuna (⬆️) basın</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-foreground">3.</span>
                        <span>"Ana Ekrana Ekle" seçeneğini seçin</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-foreground">4.</span>
                        <span>"Ekle" butonuna basın</span>
                      </li>
                    </ol>
                  </div>
                )}

                {/* Manual Instructions */}
                {!canInstall && !isIOS && (
                  <div className="bg-accent rounded-xl p-4">
                    <h3 className="font-semibold mb-2">💡 Manuel Kurulum</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Tarayıcınızın adres çubuğunda bir yükleme simgesi görüyor musunuz?
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><strong className="text-foreground">Chrome/Edge:</strong> Adres çubuğunun sağındaki ⊕ veya 💻 simgesine tıklayın</p>
                      <p><strong className="text-foreground">Firefox:</strong> Adres çubuğunun sağındaki ⋮ menüsünden "Siteyi Yükle" seçin</p>
                      <p><strong className="text-foreground">Safari:</strong> Dosya → Ana Ekrana Ekle</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* PWA Durumu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Uygulama Durumu
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isInstalled ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <p className="font-medium">Kurulum Durumu</p>
                    <p className="text-sm text-muted-foreground">
                      {isInstalled ? 'Uygulama yüklü' : 'Tarayıcıda çalışıyor'}
                    </p>
                  </div>
                </div>
                {isInstalled ? (
                  <Download className="w-5 h-5 text-green-500" />
                ) : (
                  <Download className="w-5 h-5 text-gray-400" />
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-medium">Bağlantı Durumu</p>
                    <p className="text-sm text-muted-foreground">
                      {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                    </p>
                  </div>
                </div>
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
              </div>

              {isUpdateAvailable && (
                <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Güncelleme Mevcut</p>
                      <p className="text-sm text-muted-foreground">
                        Yeni bir sürüm kullanılabilir
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Güncelle
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Depolama Bilgisi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Depolama Yönetimi
            </h2>
            
            <div className="space-y-4">
              {cacheSize !== null && (
                <div className="p-4 bg-accent rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Önbellek Boyutu</p>
                    <p className="text-lg font-bold">{formatBytes(cacheSize)}</p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: storageUsage
                          ? `${(cacheSize / storageUsage.quota) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              )}

              {storageUsage && (
                <div className="p-4 bg-accent rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Toplam Kullanım</p>
                    <p className="text-lg font-bold">
                      {formatBytes(storageUsage.used)} / {formatBytes(storageUsage.quota)}
                    </p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(storageUsage.used / storageUsage.quota) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleClearCache}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Önbelleği Temizle
              </button>
            </div>
          </motion.div>

          {/* Bilgilendirme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6"
          >
            <h3 className="font-semibold mb-2 text-blue-500">💡 İpucu</h3>
            <p className="text-sm text-muted-foreground">
              Uygulamayı cihazınıza yükleyerek daha hızlı erişim sağlayabilir ve çevrimdışı 
              kullanabilirsiniz. Yükleme için tarayıcınızın adres çubuğundaki yükleme simgesine 
              tıklayın veya ayarlar menüsünden "Ana ekrana ekle" seçeneğini kullanın.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
