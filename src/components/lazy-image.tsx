'use client'

import { useState, useEffect, useRef } from 'react'
import { createIntersectionObserver } from '@/lib/performance'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  width?: number
  height?: number
}

export function LazyImage({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E',
  width,
  height,
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = createIntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setImageSrc(src)
          observer?.disconnect()
        }
      })
    })

    if (imgRef.current && observer) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer?.disconnect()
    }
  }, [src])

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      onLoad={() => setIsLoaded(true)}
      loading="lazy"
    />
  )
}
