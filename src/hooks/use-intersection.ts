import { useEffect, useRef, useState } from 'react'

interface IntersectionOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

export function useIntersection(
  options: IntersectionOptions = {}
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const { threshold = 0, root = null, rootMargin = '0px', freezeOnceVisible = false } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const elementRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Don't observe if already visible and frozen
    if (freezeOnceVisible && isIntersecting) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold, root, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, freezeOnceVisible, isIntersecting])

  return [elementRef, isIntersecting]
}
