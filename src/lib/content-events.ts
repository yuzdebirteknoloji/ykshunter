import { dataCache } from './cache'

export const CONTENT_CHANGED_EVENT = 'ykshunter:content-changed'

/**
 * İçerik (ders/konu/oyun/analiz) değiştiğinde çağrılır: bellek önbelleğini
 * temizler ve React Query'ye "veriler eskidi" haberini verir. Böylece yeni
 * eklenen içerik uygulamayı yeniden açmadan hemen görünür.
 */
export function notifyContentChanged() {
  dataCache.clear()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CONTENT_CHANGED_EVENT))
  }
}
