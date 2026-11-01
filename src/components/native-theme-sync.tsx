'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

/** APK'da durum çubuğu simgelerinin rengini açık/koyu temaya uydurur. */
export function NativeThemeSync() {
  const { resolvedTheme } = useTheme()
  useEffect(() => {
    const cap = (globalThis as any).Capacitor
    if (!cap?.isNativePlatform?.() || !resolvedTheme) return
    import('@capacitor/status-bar')
      .then(({ StatusBar, Style }) => StatusBar.setStyle({ style: resolvedTheme === 'dark' ? Style.Dark : Style.Light }))
      .catch(() => {})
  }, [resolvedTheme])
  return null
}
