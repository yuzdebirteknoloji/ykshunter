import { openDB, type IDBPDatabase } from 'idb'

export const TABLES = [
  'subjects',
  'topics',
  'question_sets',
  'image_games',
  'announcements',
  'trial_analyses',
  'mindmap_analyses',
  'game_results',
] as const
export type TableName = (typeof TABLES)[number]

/** İçerik tabloları (APK ile gelen + kullanıcının eklediği) */
export const CONTENT_TABLES: TableName[] = ['subjects', 'topics', 'question_sets', 'image_games']

const DB_NAME = 'ykshunter'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase> | null = null

export function getDB() {
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB bu ortamda yok')
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        for (const t of TABLES) {
          if (!db.objectStoreNames.contains(t)) db.createObjectStore(t, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta')
      },
    })
  }
  return dbPromise
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  return (await getDB()).get('meta', key)
}

export async function setMeta(key: string, value: unknown) {
  await (await getDB()).put('meta', value, key)
}

export function newId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
