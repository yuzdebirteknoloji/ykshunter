import { useState, useEffect, useRef, useMemo } from 'react'

interface VirtualScrollOptions {
  itemHeight: number
  overscan?: number
  containerHeight?: number
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const { itemHeight, overscan = 3, containerHeight = 600 } = options
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = Math.min(items.length, start + visibleCount + overscan * 2)

    return { start, end }
  }, [scrollTop, itemHeight, overscan, containerHeight, items.length])

  const virtualItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      offsetTop: (visibleRange.start + index) * itemHeight
    }))
  }, [items, visibleRange, itemHeight])

  const totalHeight = items.length * itemHeight

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return {
    virtualItems,
    totalHeight,
    containerRef,
    handleScroll
  }
}
