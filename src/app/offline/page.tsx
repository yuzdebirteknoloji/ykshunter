'use client'

import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 p-6 text-center bg-background">
      <WifiOff className="w-14 h-14 text-muted-foreground" />
      <h1 className="text-2xl font-bold text-foreground">İnternet bağlantısı yok</h1>
      <p className="text-muted-foreground max-w-sm">
        Daha önce açtığın sayfalar çevrimdışı da açılabilir. Bağlantı gelince tekrar dene.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium"
      >
        Tekrar dene
      </button>
    </div>
  )
}
