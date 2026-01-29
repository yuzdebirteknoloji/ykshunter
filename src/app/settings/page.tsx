'use client'

import { useState, useEffect } from 'react'
import { Download, Smartphone, Wifi, WifiOff, RefreshCw, Trash2, HardDrive, Monitor, Apple } from 'lucide-react'
import { usePWA } from '@/hooks/use-pwa'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function SettingsPage() {
  const { isInstalled, isOnline, isUpdateAvailable } = usePWA()
  const [cacheSize, setCacheSize] = useState<number | null>(null)
  const [storageUsage, setStorageUsage] = useState<{ used: number; quota: number } | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [showManualGuide, setShowManualGuide] = useState(false)

  useEffect(() => {
    // iOS kontrolü
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Globaldeki prompt'u kontrol et
    const globalPrompt = (window as any).deferredPrompt;
    if (globalPrompt) {
      setDeferredPrompt(globalPrompt);
      setCanInstall(true);
    }

    // Globaldeki veya custom event'teki prompt'u yakala
    const syncPrompt = (e?: any) => {
      const p = e?.detail || (window as any).deferredPrompt;
      if (p) {
        setDeferredPrompt(p);
        setCanInstall(true);
      }
    };

    window.addEventListener('pwa-prompt-ready', syncPrompt);
    syncPrompt(); // Sayfa açıldığında mevcut mu bak

    // Install prompt'u direkt dinle (yedek)
    const handler = (e: any) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Uygulama yüklendiğinde durumu güncelle
    const installedHandler = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
      toast.success('Uygulama başarıyla kuruldu!');
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('pwa-prompt-ready', syncPrompt);
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
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
      toast.success('Önbellek başarıyla temizlendi!')
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  const handleUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      await registration.update()
      toast.success('Güncelleme kontrol ediliyor...')
    }
  }

  const handleInstall = async () => {
    if (isInstalled) {
      toast.success('Uygulama zaten yüklü!')
      return
    }

    setIsDownloading(true)
    setDownloadProgress(20)

    try {
      // YENİ WEB INSTALL API (2025-2026) - Chrome/Edge flag ile çalışır
      if ('install' in navigator) {
        setDownloadProgress(60)
        await (navigator as any).install()
        setDownloadProgress(100)
        toast.success('✅ Uygulama yükleniyor!')
        setIsDownloading(false)
        return
      }

      // ESKI beforeinstallprompt API (fallback)
      const finalPrompt = deferredPrompt || (window as any).deferredPrompt

      if (finalPrompt) {
        setDownloadProgress(60)
        await finalPrompt.prompt()
        setDownloadProgress(100)
        
        const { outcome } = await finalPrompt.userChoice
        
        if (outcome === 'accepted') {
          setCanInstall(false)
          setDeferredPrompt(null)
          ;(window as any).deferredPrompt = null
          toast.success('✅ Uygulama yükleniyor!')
        } else {
          toast.info('Kurulum iptal edildi')
        }
        
        setIsDownloading(false)
        return
      }

      // iOS için özel işlem
      if (isIOS) {
        setDownloadProgress(100)
        await new Promise(r => setTimeout(r, 300))
        setIsDownloading(false)
        
        // iOS Safari paylaş menüsü talimatı
        const confirmed = confirm(
          '📱 iPhone/iPad KURULUM:\n\n' +
          '1. Aşağıdaki "Paylaş" ⬆️ butonuna dokun\n' +
          '2. "Ana Ekrana Ekle" seçeneğini bul\n' +
          '3. "Ekle" butonuna bas\n\n' +
          '✅ Uygulama ana ekranına eklenecek!\n\n' +
          'Devam etmek için OK\'e bas.'
        )
        
        if (confirmed) {
          toast.info('Safari paylaş menüsünü kullan ⬆️', { duration: 5000 })
        }
        return
      }

      // Tarayıcı algılama ve platform bazlı talimat
      setDownloadProgress(100)
      await new Promise(r => setTimeout(r, 300))
      setIsDownloading(false)

      const isAndroid = /Android/.test(navigator.userAgent)
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
      const isEdge = /Edg/.test(navigator.userAgent)

      if (isAndroid) {
        const confirmed = confirm(
          '📱 ANDROID KURULUM:\n\n' +
          '1. Sağ üstteki 3 nokta (⋮) menüsünü aç\n' +
          '2. "Uygulamayı yükle" seçeneğine dokun\n' +
          '3. "Yükle" butonuna bas\n\n' +
          '✅ Uygulama ana ekranına eklenecek!\n\n' +
          'Devam etmek için OK\'e bas.'
        )
        
        if (confirmed) {
          toast.info('Tarayıcı menüsünü kullan ⋮', { duration: 5000 })
        }
      } else if (isChrome || isEdge) {
        const confirmed = confirm(
          '💻 WINDOWS KURULUM:\n\n' +
          '1. Adres çubuğunun SAĞ tarafındaki 💻 simgesine tıkla\n' +
          '   (veya ⊕ simgesine)\n' +
          '2. "Yükle" butonuna bas\n\n' +
          '✅ Uygulama masaüstüne eklenecek!\n\n' +
          'Simgeyi görmüyorsan:\n' +
          '• Sağ üstteki ⋮ menüsünden\n' +
          '• "Uygulamayı yükle" seçeneğini ara\n\n' +
          'Devam etmek için OK\'e bas.'
        )
        
        if (confirmed) {
          toast.info('Adres çubuğunun sağındaki simgeyi kullan 💻', { duration: 5000 })
        }
      } else {
        const confirmed = confirm(
          '🌐 KURULUM:\n\n' +
          'Tarayıcı menüsünden (⋮ veya ≡)\n' +
          '"Uygulamayı yükle" veya "Ana ekrana ekle"\n' +
          'seçeneğini ara.\n\n' +
          '✅ Uygulama cihazına eklenecek!\n\n' +
          'Devam etmek için OK\'e bas.'
        )
        
        if (confirmed) {
          toast.info('Tarayıcı menüsünü kontrol et', { duration: 5000 })
        }
      }

    } catch (error) {
      console.error('Install error:', error)
      setIsDownloading(false)
      toast.error('Kurulum başlatılamadı', {
        description: 'Tarayıcı menüsünden manuel kurulum yapabilirsin.',
        duration: 5000
      })
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
                      🚀 Uygulamayı Cihazına İndir
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Tek tıkla cihazına yükle, internet olmadan kullan
                    </p>
                    <div className="relative mt-4">
                      <button
                        onClick={handleInstall}
                        disabled={isDownloading}
                        className={`w-full px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-95 group overflow-hidden relative ${isDownloading ? 'cursor-wait opacity-90' : ''}`}
                      >
                        {isDownloading ? (
                          <>
                            <RefreshCw className="w-6 h-6 animate-spin" />
                            Hazırlanıyor... %{Math.round(downloadProgress)}
                          </>
                        ) : (
                          <>
                            <Download className="w-6 h-6 group-hover:animate-bounce" />
                            {isInstalled ? 'Uygulama Yüklü ✓' : 'Uygulamayı İndir'}
                          </>
                        )}
                        
                        {isDownloading && (
                          <motion.div 
                            className="absolute bottom-0 left-0 h-1 bg-white/30"
                            initial={{ width: 0 }}
                            animate={{ width: `${downloadProgress}%` }}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
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

        </div>
      </div>
    </div>
  )
}
