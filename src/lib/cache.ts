// Notion-style caching system for ultra-fast data loading

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly STALE_WHILE_REVALIDATE = 30 * 1000 // 30 seconds

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Return stale data if within stale-while-revalidate window
    if (Date.now() < entry.expiresAt + this.STALE_WHILE_REVALIDATE) {
      return entry.data
    }

    // Data too old, remove it
    this.cache.delete(key)
    return null
  }

  isStale(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return true
    return Date.now() > entry.expiresAt
  }

  invalidate(pattern?: string) {
    if (!pattern) {
      this.cache.clear()
      return
    }

    // Invalidate keys matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  clear() {
    this.cache.clear()
  }
}

export const dataCache = new DataCache()

// Optimistic update helper
export function optimisticUpdate<T>(
  key: string,
  updater: (current: T | null) => T
) {
  const current = dataCache.get<T>(key)
  const updated = updater(current)
  dataCache.set(key, updated)
  return updated
}
