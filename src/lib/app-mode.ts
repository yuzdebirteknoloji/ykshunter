/**
 * 'local'  → Android APK: her şey telefonda (IndexedDB), sunucu/giriş yok.
 * 'online' → Web sürümü: Supabase + Vercel API'leri.
 */
export const APP_MODE: 'local' | 'online' =
  process.env.NEXT_PUBLIC_APP_MODE === 'local' ? 'local' : 'online'
export const IS_LOCAL = APP_MODE === 'local'
