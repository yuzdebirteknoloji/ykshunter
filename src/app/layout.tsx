'use client'

import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import { Home, Gamepad2, Settings, User, Moon, Sun, LogOut, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { PWAUpdatePrompt } from '@/components/pwa-update-prompt'
import { OfflineIndicator } from '@/components/offline-indicator'

const links = [
  {
    label: 'Ana Sayfa',
    href: '/',
    icon: <Home className="text-foreground h-5 w-5 flex-shrink-0" />,
  },
  {
    label: 'Oyunlar',
    href: '/games',
    icon: <Gamepad2 className="text-foreground h-5 w-5 flex-shrink-0" />,
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: <Settings className="text-foreground h-5 w-5 flex-shrink-0" />,
  },
  {
    label: 'Ayarlar',
    href: '/settings',
    icon: <Settings className="text-foreground h-5 w-5 flex-shrink-0" />,
  },
]

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Kullanıcı bilgisini al
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {})

    // Kurulum durumunu kontrol et
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true
    
    if (!standalone) {
      setShowInstallButton(true)
    }
  }, [mounted])

  const handleLogout = async () => {
    // Mobilde sidebar'ı kapat
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setOpen(false);
    }
    
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('Logout error:', err)
    }
  }
  
  // Hydration hatalarını önlemek için mounted kontrolü
  if (!mounted) {
    return (
      <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden">
        <div className="w-[60px] border-r border-border" />
        <main className="flex-1 overflow-auto w-full">
          {children}
        </main>
      </div>
    )
  }

  const handleThemeToggle = () => {
    if (!mounted) return
    setTheme(theme === 'dark' ? 'light' : 'dark');
    // Mobilde sidebar'ı kapat
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              {/* Logo */}
              <div className="font-normal flex space-x-2 items-center text-sm text-foreground py-1 relative z-20 mb-8">
                <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
                {open && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium text-foreground whitespace-pre"
                  >
                    Learn Game
                  </motion.span>
                )}
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            </div>
            
            {/* Bottom Section */}
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              {/* User Info */}
              {user && (
                <div className={`flex items-center gap-2 py-2 px-2 ${open ? 'mb-2' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  {open && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.displayName || user.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Level {user.level || 1} • {user.totalXp || 0} XP
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={handleThemeToggle}
                  className="flex items-center gap-2 py-2 px-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 flex-shrink-0" />
                  ) : (
                    <Moon className="h-5 w-5 flex-shrink-0" />
                  )}
                  {open && <span className="text-sm">Tema Değiştir</span>}
                </button>
              )}

              {/* Install Button */}
              {showInstallButton && (
                <button
                  onClick={() => router.push('/settings')}
                  className="flex items-center gap-2 py-2 px-2 text-muted-foreground hover:text-indigo-500 hover:bg-accent rounded-md transition-colors"
                >
                  <Download className="h-5 w-5 flex-shrink-0" />
                  {open && <span className="text-sm">Uygulamayı Yükle</span>}
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-2 px-2 text-muted-foreground hover:text-red-500 hover:bg-accent rounded-md transition-colors"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {open && <span className="text-sm">Çıkış Yap</span>}
              </button>
            </div>
          </SidebarBody>
        </Sidebar>
        <main className="flex-1 overflow-auto w-full">
          {children}
        </main>
      </div>
      {mounted && (
        <>
          <PWAInstallPrompt />
          <PWAUpdatePrompt />
          <OfflineIndicator />
        </>
      )}
    </>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <title>Learn Game - Eğlenerek Öğren</title>
        <meta name="description" content="Gamification ile öğrenme deneyimi - Oyunlaştırılmış eğitim platformu" />
        <meta name="keywords" content="eğitim, oyun, öğrenme, gamification, quiz, sınav" />
        <meta name="author" content="Learn Game" />
        
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Learn Game" />
        
        {/* Icons */}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icon-192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-512.png" sizes="512x512" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Learn Game" />
        
        {/* Theme Colors */}
        <meta name="theme-color" content="#6366f1" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        
        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        
        {/* Performance Hints */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <LayoutContent>{children}</LayoutContent>
        </ThemeProvider>
      </body>
    </html>
  )
}
