// NEXT_PUBLIC_APP_MODE=local → Android APK için tamamen statik (sunucusuz) çıktı
const isLocalApp = process.env.NEXT_PUBLIC_APP_MODE === 'local'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  output: isLocalApp ? 'export' : 'standalone',
  trailingSlash: isLocalApp,

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  images: {
    unoptimized: isLocalApp,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },

  // APK derlemesinde Supabase istemcisi pakete girmesin
  turbopack: isLocalApp
    ? { resolveAlias: { '@supabase/ssr': './src/lib/supabase/ssr-stub.ts' } }
    : {},

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@supabase/supabase-js'],
  },

  async headers() {
    if (isLocalApp) return []
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
      {
        // Kullanıcıya özel API cevapları CDN'de paylaşılmamalı
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },
}

if (isLocalApp) delete nextConfig.headers

module.exports = nextConfig
