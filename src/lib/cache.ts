// In-memory cache with TTL and stale-while-revalidate
interface CacheEntry<T> {
  data: T
  timestamp: number
  staleTime: number
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultStaleTime = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, staleTime?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      staleTime: staleTime || this.defaultStaleTime,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    return entry.data as T
  }

  isStale(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return true
    return Date.now() - entry.timestamp > entry.staleTime
  }

  invalidate(prefix: string): void {
    const keysToDelete: string[] = []
    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  clear(): void {
    this.cache.clear()
  }
}

export const dataCache = new DataCache()
