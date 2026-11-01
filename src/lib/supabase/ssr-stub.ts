/**
 * APK (yerel mod) derlemesinde '@supabase/ssr' bu dosyayla değiştirilir
 * (next.config.js → turbopack.resolveAlias). Yerel modda Supabase hiç
 * kullanılmadığı için ~270 KB'lık kütüphane pakete girmez.
 */
export function createBrowserClient(): never {
  throw new Error('Supabase yerel (APK) modda kullanılamaz')
}
export function createServerClient(): never {
  throw new Error('Supabase yerel (APK) modda kullanılamaz')
}
