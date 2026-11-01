'use client'

import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryProvider } from '@/providers/query-provider'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import { MobileTopBar, MobileDrawer, MobileBottomNav, type NavItem } from '@/components/mobile-nav'
import { OnboardingTutorial } from '@/components/onboarding-tutorial'
import { NativeThemeSync } from '@/components/native-theme-sync'
import { Home, Gamepad2, Settings, User, Moon, Sun, LogOut, LayoutDashboard, NotebookPen, Network, Trophy } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { PWAUpdatePrompt } from '@/components/pwa-update-prompt'
import { OfflineIndicator } from '@/components/offline-indicator'
import { AnnouncementsDisplay } from '@/components/announcements-display'
import { Toaster } from 'sonner'
import { ServiceWorkerRegister } from '@/components/sw-register'
import { fetchMe, logout } from '@/lib/api-client'
import { IS_LOCAL } from '@/lib/app-mode'

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
    label: 'Liderlik',
    href: '/leaderboard',
    icon: <Trophy className="text-foreground h-5 w-5 flex-shrink-0" />,
  },
  {
    label: 'Ayarlar',
    href: '/settings',
    icon: <Settings className="text-foreground h-5 w-5 flex-shrink-0" />,
  },
  {
    label: 'Deneme Analizi',
    href: '/trial-analysis',
    icon: <NotebookPen className="text-foreground h-5 w-5 flex-shrink-0" />,
  },
  {
    label: 'Ağaç Analizi',
    href: '/mindmap-analysis',
    icon: <Network className="text-foreground h-5 w-5 flex-shrink-0" />,
  },
]

// Mobil alt sekme çubuğu (en sık kullanılanlar)
const mobileTabs: NavItem[] = [
  { label: 'Ana Sayfa', short: 'Ana Sayfa', href: '/', icon: <Home className="h-5 w-5" /> },
  { label: 'Oyunlar', short: 'Oyunlar', href: '/games', icon: <Gamepad2 className="h-5 w-5" /> },
  { label: 'Deneme Analizi', short: 'Deneme', href: '/trial-analysis', icon: <NotebookPen className="h-5 w-5" /> },
  { label: 'Ağaç Analizi', short: 'Ağaç', href: '/mindmap-analysis', icon: <Network className="h-5 w-5" /> },
  { label: 'Ayarlar', short: 'Ayarlar', href: '/settings', icon: <Settings className="h-5 w-5" /> },
]

const adminLink = {
  label: 'Admin Paneli',
  href: '/dashboard',
  icon: <LayoutDashboard className="text-foreground h-5 w-5 flex-shrink-0" />,
}

// Bu sayfalarda yan menü gösterilmez
const BARE_ROUTES = ['/login', '/offline']

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const isBare = BARE_ROUTES.includes(pathname)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isBare) return

    // Kullanıcı bilgisini al
    fetchMe().then((u) => u && setUser(u))
  }, [mounted, isBare])

  const handleLogout = async () => {
    // Mobilde sidebar'ı kapat
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setOpen(false);
    }

    try {
      await logout()
      window.location.href = '/login'
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  if (isBare) {
    return <main className="min-h-[100dvh] w-full pt-safe pb-safe">{children}</main>
  }

  // Hydration hatalarını önlemek için mounted kontrolü
  if (!mounted) {
    return (
      <div className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden">
        <div className="hidden md:block w-[60px] border-r border-border" />
        <div className="md:hidden pt-safe border-b border-border"><div className="h-14" /></div>
        <main className="flex-1 overflow-auto w-full pb-bottom-nav">
          {children}
        </main>
      </div>
    )
  }

  const handleThemeToggle = () => {
    if (!mounted) return
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navLinks = [
    ...links.filter((l) => !(IS_LOCAL && l.href === '/leaderboard')),
    ...(user?.role === 'admin' ? [adminLink] : []),
  ]

  const drawerButton =
    'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-medium text-muted-foreground active:bg-accent'

  return (
    <>
      <div className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden px-safe">
        {/* Masaüstü yan menü */}
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              <div className="font-normal flex space-x-2 items-center text-sm text-foreground py-1 relative z-20 mb-8">
                <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
                {open && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium text-foreground whitespace-pre">
                    YKS Hunter
                  </motion.span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <SidebarLink key={link.href} link={link} />
                ))}
              </div>
              <AnnouncementsDisplay open={open} />
            </div>

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              {user && (
                <div className={`flex items-center gap-2 py-2 px-2 ${open ? 'mb-2' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  {open && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.displayName || user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        Level {user.level || 1} • {user.totalXp || 0} XP
                      </p>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={handleThemeToggle}
                className="flex items-center gap-2 py-2 px-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5 flex-shrink-0" /> : <Moon className="h-5 w-5 flex-shrink-0" />}
                {open && <span className="text-sm">Tema Değiştir</span>}
              </button>
              {!IS_LOCAL && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2 px-2 text-muted-foreground hover:text-red-500 hover:bg-accent rounded-md transition-colors"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                  {open && <span className="text-sm">Çıkış Yap</span>}
                </button>
              )}
            </div>
          </SidebarBody>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Mobil üst çubuk */}
          <MobileTopBar onMenu={() => setMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden w-full pb-bottom-nav">{children}</main>
        </div>
      </div>

      {/* Mobil menü ve alt sekmeler */}
      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={navLinks}
        header={
          user && (
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{user.displayName || user.username}</p>
                <p className="text-xs text-muted-foreground">
                  Level {user.level || 1} • {user.totalXp || 0} XP • {user.streakDays || 0}🔥
                </p>
              </div>
            </div>
          )
        }
        footer={
          <>
            <button
              onClick={() => {
                setMenuOpen(false)
                window.dispatchEvent(new Event('ykshunter:show-tutorial'))
              }}
              className={drawerButton}
            >
              <span className="h-5 w-5 flex items-center justify-center">❓</span>
              Nasıl kullanılır?
            </button>
            <button onClick={handleThemeToggle} className={drawerButton}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {theme === 'dark' ? 'Açık tema' : 'Koyu tema'}
            </button>
            {!IS_LOCAL && (
              <button onClick={handleLogout} className={drawerButton + ' text-red-500'}>
                <LogOut className="h-5 w-5" />
                Çıkış Yap
              </button>
            )}
          </>
        }
      />
      <MobileBottomNav items={mobileTabs} />

      <OnboardingTutorial />
      <NativeThemeSync />
      {!IS_LOCAL && <ServiceWorkerRegister />}
      {!IS_LOCAL && <PWAUpdatePrompt />}
      {!IS_LOCAL && <OfflineIndicator />}
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
        <title>YKS Hunter</title>
        <meta name="description" content="Oyunlaştırılmış YKS hazırlık platformu" />
        <meta name="keywords" content="eğitim, oyun, öğrenme, gamification, quiz, sınav" />
        <meta name="author" content="YKS Hunter" />

        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="YKS Hunter" />

        {/* Icons */}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="YKS Hunter" />

        {/* Theme Colors */}
        <meta name="theme-color" content="#6366f1" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />

        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />

        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange
          >
            <LayoutContent>{children}</LayoutContent>
            <Toaster position="top-center" richColors closeButton offset={{ top: "calc(var(--sat) + 12px)" }} mobileOffset={{ top: "calc(var(--sat) + 64px)" }} />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
