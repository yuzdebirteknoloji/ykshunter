import { getDB, TABLES, getMeta, setMeta } from './db'

const BACKUP_FORMAT = 'ykshunter-backup'

export async function createBackup() {
  const db = await getDB()
  const tables: Record<string, unknown[]> = {}
  for (const t of TABLES) tables[t] = await db.getAll(t)
  return {
    format: BACKUP_FORMAT,
    version: 1,
    createdAt: new Date().toISOString(),
    profile: (await getMeta('profile')) ?? null,
    contentVersion: (await getMeta('contentVersion')) ?? null,
    tables,
  }
}

/** Yedeği geri yükler: mevcut verilerin TAMAMI yedektekiyle değiştirilir. */
export async function restoreBackup(backup: any) {
  if (backup?.format !== BACKUP_FORMAT || typeof backup.tables !== 'object') {
    throw new Error('Bu dosya bir YKS Hunter yedeği değil')
  }
  const db = await getDB()
  for (const t of TABLES) {
    const rows = Array.isArray(backup.tables[t]) ? backup.tables[t] : []
    const tx = db.transaction(t, 'readwrite')
    await tx.store.clear()
    for (const r of rows) if (r?.id) await tx.store.put(r)
    await tx.done
  }
  if (backup.profile) await setMeta('profile', backup.profile)
  if (backup.contentVersion) await setMeta('contentVersion', backup.contentVersion)
}

/** Yedeği dosya olarak dışarı verir: APK'da paylaş menüsü, tarayıcıda indirme. */
export async function exportBackupFile() {
  const backup = await createBackup()
  const json = JSON.stringify(backup)
  const date = new Date().toISOString().slice(0, 10)
  const fileName = `ykshunter-yedek-${date}.json`

  const cap = (globalThis as any).Capacitor
  if (cap?.isNativePlatform?.()) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem')
    const { Share } = await import('@capacitor/share')
    const written = await Filesystem.writeFile({
      path: fileName,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    })
    await Share.share({ title: 'YKS Hunter yedeği', files: [written.uri], dialogTitle: 'Yedeği kaydet / gönder' })
    return fileName
  }

  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
  return fileName
}
