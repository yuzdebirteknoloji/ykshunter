/* YKS Hunter service worker — elle yazılmış, bağımlılıksız. */
const VERSION = 'v2.0.0'
const STATIC_CACHE = `static-${VERSION}`
const PAGE_CACHE = `pages-${VERSION}`
const IMAGE_CACHE = `images-${VERSION}`
const PRECACHE = ['/offline', '/manifest.json', '/icon-192.png', '/icon-512.png', '/icon.svg', '/apple-touch-icon.png']
const MAX_IMAGES = 150

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

async function trimCache(name, max) {
  const cache = await caches.open(name)
  const keys = await cache.keys()
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i])
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // Sayfa geçişleri: önce ağ, olmazsa önbellek, o da yoksa offline sayfası
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok && !res.redirected) {
            const copy = res.clone()
            caches.open(PAGE_CACHE).then((c) => c.put(request, copy))
          }
          return res
        })
        .catch(async () => (await caches.match(request)) || caches.match('/offline'))
    )
    return
  }

  // Next.js derlenmiş dosyaları değişmez → önce önbellek
  if (url.origin === self.location.origin && url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(STATIC_CACHE).then((c) => c.put(request, copy))
            }
            return res
          })
      )
    )
    return
  }

  // Görseller (Cloudinary dahil): önbellekten ver, arkada tazele
  const isImage =
    request.destination === 'image' ||
    url.hostname === 'res.cloudinary.com' ||
    url.pathname.startsWith('/_next/image')
  if (isImage) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const hit = await cache.match(request)
        const network = fetch(request)
          .then((res) => {
            if (res.ok || res.type === 'opaque') {
              cache.put(request, res.clone())
              trimCache(IMAGE_CACHE, MAX_IMAGES)
            }
            return res
          })
          .catch(() => hit)
        return hit || network
      })
    )
  }
  // API ve Supabase istekleri önbelleğe alınmaz (kullanıcıya özel veri)
})
