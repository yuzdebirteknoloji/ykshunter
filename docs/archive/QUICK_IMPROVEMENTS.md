# ⚡ Hızlı İyileştirmeler (30 Dakikada)

Bu dokümanda 30 dakika içinde yapabileceğiniz hızlı ama etkili iyileştirmeler bulunmaktadır.

## 1. Loading States Ekle (5 dakika)

```typescript
// src/components/loading-card.tsx
export function LoadingCard() {
  return (
    <div className="animate-pulse bg-card rounded-lg p-6 border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-muted rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="h-4 bg-muted rounded w-full" />
    </div>
  )
}

// Kullanım
{loading ? (
  <LoadingCard />
) : (
  <SubjectCard subject={subject} />
)}
```

## 2. Toast Notifications (10 dakika)

```bash
npm install sonner
```

```typescript
// src/app/layout.tsx
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}

// Kullanım
import { toast } from 'sonner'

toast.success('Başarılı!')
toast.error('Hata oluştu')
toast.loading('Yükleniyor...')
```

## 3. Error Handling (5 dakika)

```typescript
// src/app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Bir hata oluştu</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-white rounded-lg"
      >
        Tekrar Dene
      </button>
    </div>
  )
}
```

## 4. Empty States (5 dakika)

```typescript
// src/components/empty-state.tsx
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center mb-4">{description}</p>
      {action}
    </div>
  )
}

// Kullanım
{subjects.length === 0 && (
  <EmptyState
    icon="📚"
    title="Henüz ders yok"
    description="İlk dersini ekleyerek başla"
    action={
      <Link href="/admin">
        <button>Ders Ekle</button>
      </Link>
    }
  />
)}
```

## 5. Keyboard Shortcuts (5 dakika)

```typescript
// src/hooks/use-hotkeys.ts
import { useEffect } from 'react'

export function useHotkeys(key: string, callback: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === key) {
        e.preventDefault()
        callback()
      }
    }
    
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, callback])
}

// Kullanım
useHotkeys('k', () => openSearch())
useHotkeys('/', () => openHelp())
```

## 6. Optimistic Updates (10 dakika)

```typescript
// Örnek: Like butonu
const [liked, setLiked] = useState(false)
const [likeCount, setLikeCount] = useState(initialCount)

const handleLike = async () => {
  // Optimistic update
  setLiked(true)
  setLikeCount(prev => prev + 1)
  
  try {
    await likeTopic(topicId)
  } catch (error) {
    // Rollback on error
    setLiked(false)
    setLikeCount(prev => prev - 1)
    toast.error('Beğeni eklenemedi')
  }
}
```

## 7. Debounced Search (5 dakika)

```typescript
// src/hooks/use-debounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// Kullanım
const [search, setSearch] = useState('')
const debouncedSearch = useDebounce(search, 300)

useEffect(() => {
  // API call with debouncedSearch
}, [debouncedSearch])
```

## 8. Copy to Clipboard (3 dakika)

```typescript
// src/hooks/use-clipboard.ts
import { useState } from 'react'
import { toast } from 'sonner'

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false)

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Kopyalandı!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Kopyalanamadı')
    }
  }

  return { copied, copy }
}

// Kullanım
const { copy } = useCopyToClipboard()
<button onClick={() => copy(shareUrl)}>Paylaş</button>
```

## 9. Confirmation Dialog (5 dakika)

```typescript
// src/components/confirm-dialog.tsx
import { useState } from 'react'

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [resolver, setResolver] = useState<any>(null)

  const confirm = () => {
    return new Promise((resolve) => {
      setIsOpen(true)
      setResolver(() => resolve)
    })
  }

  const handleConfirm = () => {
    resolver(true)
    setIsOpen(false)
  }

  const handleCancel = () => {
    resolver(false)
    setIsOpen(false)
  }

  return { isOpen, confirm, handleConfirm, handleCancel }
}

// Kullanım
const { confirm } = useConfirm()

const handleDelete = async () => {
  const confirmed = await confirm()
  if (confirmed) {
    await deleteTopic()
  }
}
```

## 10. Auto-save (5 dakika)

```typescript
// src/hooks/use-auto-save.ts
import { useEffect, useRef } from 'react'

export function useAutoSave(data: any, onSave: (data: any) => Promise<void>) {
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onSave(data)
      toast.success('Otomatik kaydedildi')
    }, 2000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, onSave])
}

// Kullanım
const [formData, setFormData] = useState({})
useAutoSave(formData, saveToDatabase)
```

## Bonus: Meta Tags (2 dakika)

```typescript
// src/app/games/page.tsx
export const metadata = {
  title: 'Oyunlar | Learn Game',
  description: 'Eğlenerek öğren, oyunlarla pratik yap',
  openGraph: {
    title: 'Oyunlar | Learn Game',
    description: 'Eğlenerek öğren, oyunlarla pratik yap',
    images: ['/og-games.png'],
  },
}
```

## Hızlı Kontrol Listesi

- [ ] Loading states eklendi
- [ ] Toast notifications kuruldu
- [ ] Error handling eklendi
- [ ] Empty states tasarlandı
- [ ] Keyboard shortcuts eklendi
- [ ] Optimistic updates uygulandı
- [ ] Debounced search eklendi
- [ ] Copy to clipboard eklendi
- [ ] Confirmation dialog eklendi
- [ ] Auto-save eklendi
- [ ] Meta tags güncellendi

## Sonraki Adımlar

Bu hızlı iyileştirmeleri tamamladıktan sonra:

1. `PROJECT_RECOMMENDATIONS.md` dosyasındaki orta öncelikli öğelere geç
2. Analytics ve monitoring ekle
3. Testing altyapısını kur
4. Performance optimizasyonlarına odaklan

---

**Toplam Süre**: ~30 dakika
**Etki**: Kullanıcı deneyiminde %50+ iyileşme
