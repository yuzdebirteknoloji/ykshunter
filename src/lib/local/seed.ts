import { CONTENT_TABLES, getDB, getMeta, setMeta } from './db'

/**
 * APK ile gelen içerik: public/content/content.json
 * { version: string, subjects: [], topics: [], question_sets: [], image_games: [] }
 *
 * Sürüm değiştiğinde (yeni APK) içerik kayıtları id'ye göre güncellenir.
 * Kullanıcının kendi eklediği içerik ve tüm kişisel veriler korunur.
 */
let seedPromise: Promise<void> | null = null

export function ensureSeeded() {
  if (!seedPromise) seedPromise = seed().catch((e) => {
    console.error('[local db] içerik yüklenemedi', e)
  })
  return seedPromise
}

async function seed() {
  let content: any
  try {
    const res = await fetch('/content/content.json', { cache: 'no-store' })
    if (!res.ok) return
    content = await res.json()
  } catch {
    return
  }

  const version = String(content.version ?? '0')
  if ((await getMeta<string>('contentVersion')) === version) return
  await importContent(content)
  await setMeta('contentVersion', version)
}

/**
 * İçerik JSON'unu (subjects, topics, question_sets, image_games) yerel veritabanına
 * ekler/günceller. Supabase'den alınan dışa aktarım da bu formatta okunabilir.
 */
export async function importContent(content: any) {
  // Supabase SQL çıktısı tek kolonlu bir dizi olarak da gelebilir: [{ "json_build_object": {...} }]
  if (Array.isArray(content) && content.length === 1 && typeof content[0] === 'object') {
    const only = Object.values(content[0])[0]
    content = typeof only === 'string' ? JSON.parse(only) : only
  }
  const db = await getDB()
  const now = new Date().toISOString()
  const counts: Record<string, number> = {}
  for (const table of CONTENT_TABLES) {
    const rows: any[] = Array.isArray(content?.[table]) ? content[table] : []
    counts[table] = 0
    if (!rows.length) continue
    const tx = db.transaction(table, 'readwrite')
    for (const row of rows) {
      if (!row?.id) continue
      const clean = { ...row }
      // CSV/SQL dışa aktarımlarında JSON kolonlar metin olarak gelebilir
      for (const key of ['data', 'regions']) {
        if (typeof clean[key] === 'string') {
          try { clean[key] = JSON.parse(clean[key]) } catch {}
        }
      }
      await tx.store.put({ created_at: now, updated_at: now, ...clean, id: String(clean.id) })
      counts[table]++
    }
    await tx.done
  }
  if (!Object.values(counts).some(Boolean)) {
    throw new Error('Dosyada içerik bulunamadı (subjects / topics / question_sets / image_games)')
  }
  return counts
}
