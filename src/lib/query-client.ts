import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
      refetchOnWindowFocus: false, // Don't refetch on focus
      refetchOnMount: true, // Sadece veri eskimişse (stale/invalidate) yeniden çeker
      refetchOnReconnect: false, // Don't refetch on reconnect
      retry: false, // Don't retry on error
      retryOnMount: false,
    },
  },
})
