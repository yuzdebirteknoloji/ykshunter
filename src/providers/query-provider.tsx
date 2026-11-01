'use client'

import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { CONTENT_CHANGED_EVENT } from '@/lib/content-events'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // İçerik değişince tüm sorguları eskimiş say: açık ekranlar hemen, diğerleri açıldığında yenilenir
    const onChange = () => queryClient.invalidateQueries()
    window.addEventListener(CONTENT_CHANGED_EVENT, onChange)
    return () => window.removeEventListener(CONTENT_CHANGED_EVENT, onChange)
  }, [])

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
