'use client'

import { useState, useEffect } from 'react'
import { Download, Smartphone, Wifi, WifiOff, RefreshCw, Trash2, HardDrive, Monitor, Apple } from 'lucide-react'
import { usePWA } from '@/hooks/use-pwa'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { ProfileSection } from '@/components/profile-section'
import { LocalDataSection } from '@/components/local-data-section'
import { IS_LOCAL } from '@/lib/app-mode'

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
      setTimeout(() => (IS_LOCAL ? window.location.replace('/') : window.location.reload()), 1000)
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
    <div className="min-h-full bg-background p-4 md:p-8">
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
          <ProfileSection />
          {IS_LOCAL && <LocalDataSection />}

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
