// Performance monitoring utilities

export function reportWebVitals(metric: any) {
  // Web Vitals metriklerini konsola yazdır (production'da analytics'e gönderilebilir)
  if (process.env.NODE_ENV === 'development') {
    console.log(metric)
  }

  // Production'da analytics servisine gönder
  if (process.env.NODE_ENV === 'production') {
    // Örnek: Google Analytics, Vercel Analytics, vb.
    // sendToAnalytics(metric)
  }
}

// Lazy load için intersection observer
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.01,
    ...options,
  })
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Preload critical resources
export function preloadResource(href: string, as: string) {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  document.head.appendChild(link)
}

// Prefetch next page
export function prefetchPage(href: string) {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

// Check if device has good connection
export function hasGoodConnection(): boolean {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return true // Assume good connection if API not available
  }

  const connection = (navigator as any).connection
  const effectiveType = connection?.effectiveType

  // 4g or better
  return effectiveType === '4g' || effectiveType === '5g'
}

// Get device memory (if available)
export function getDeviceMemory(): number {
  if (typeof navigator === 'undefined' || !('deviceMemory' in navigator)) {
    return 4 // Default to 4GB
  }

  return (navigator as any).deviceMemory || 4
}

// Check if device is low-end
export function isLowEndDevice(): boolean {
  const memory = getDeviceMemory()
  const cores = navigator.hardwareConcurrency || 2

  return memory < 4 || cores < 4
}
