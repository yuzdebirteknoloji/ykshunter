'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Crosshair } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  /** Alt sekme çubuğunda görünecek kısa ad */
  short?: string
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

/** Mobil üst çubuk: durum çubuğunun altında kalmaması için güvenli alan boşluğu bırakır. */
export function MobileTopBar({ onMenu, title }: { onMenu: () => void; title?: string }) {
  return (
    <header className="md:hidden sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border pt-safe">
      <div className="h-14 flex items-center gap-2 px-2">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Menüyü aç"
          className="h-11 w-11 flex items-center justify-center rounded-xl text-foreground active:bg-accent"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Crosshair className="h-4 w-4 text-white" />
          </span>
          <span className="font-semibold text-foreground truncate">{title || 'YKS Hunter'}</span>
        </Link>
      </div>
    </header>
  )
}

/** Soldan açılan menü. Arka plana dokununca veya bir bağlantıya basınca kapanır. */
export function MobileDrawer({
  open,
  onClose,
  items,
  header,
  footer,
}: {
  open: boolean
  onClose: () => void
  items: NavItem[]
  header?: React.ReactNode
  footer?: React.ReactNode
}) {
  const pathname = usePathname()

  // Açıkken arka sayfanın kaymasını engelle
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="md:hidden fixed inset-0 z-[100]">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.22 }}
            className="absolute inset-y-0 left-0 w-[82%] max-w-[320px] bg-background shadow-2xl flex flex-col pt-safe pb-safe"
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <span className="font-semibold text-lg">YKS Hunter</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Menüyü kapat"
                className="h-11 w-11 -mr-2 flex items-center justify-center rounded-xl active:bg-accent"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {header}
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium transition-colors',
                    isActive(pathname, item.href)
                      ? 'bg-primary/10 text-foreground'
                      : 'text-muted-foreground active:bg-accent'
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
            {footer && <div className="border-t border-border px-2 py-2">{footer}</div>}
          </motion.nav>
        </div>
      )}
    </AnimatePresence>
  )
}

/** Alt sekme çubuğu: en sık kullanılan sayfalara tek dokunuşla geçiş. */
export function MobileBottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border pb-safe">
      <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <span className={cn('rounded-full px-4 py-1 transition-colors', active && 'bg-primary/10')}>
                {item.icon}
              </span>
              {item.short || item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
