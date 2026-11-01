/**
 * Supabase istemcisinin uygulamada kullanılan kısmını taklit eden, IndexedDB
 * üzerinde çalışan küçük bir sorgu oluşturucu. Böylece APK'da (yerel mod)
 * mevcut ekranlar ve admin paneli hiç değiştirilmeden çalışır.
 *
 * Desteklenen: select (+ "subjects(*)" gibi tekil ilişki), eq, neq, is, in,
 * order, limit, single, maybeSingle, insert, update, delete, upsert.
 */
import { getDB, newId, type TableName } from './db'
import { ensureSeeded } from './seed'
import { notifyContentChanged } from '../content-events'

type Row = Record<string, any>
type Filter = (row: Row) => boolean
type Result = { data: any; error: { message: string; code?: string } | null; count?: number | null }

/** Silinen kayıtla birlikte silinmesi gerekenler (Postgres'teki ON DELETE CASCADE karşılığı) */
const CASCADE: Partial<Record<TableName, { table: TableName; column: string }[]>> = {
  subjects: [
    { table: 'topics', column: 'subject_id' },
    { table: 'image_games', column: 'subject_id' },
    { table: 'trial_analyses', column: 'subject_id' },
  ],
  topics: [
    { table: 'question_sets', column: 'topic_id' },
    { table: 'image_games', column: 'topic_id' },
  ],
}

/** Yeni kayıtlarda varsayılan değerler */
const DEFAULTS: Partial<Record<TableName, Row>> = {
  topics: { shuffle_sets: true },
  question_sets: { is_random: true },
  image_games: { game_type: 'region', regions: [] },
  announcements: { type: 'info', icon: '📢', is_active: true, priority: 0 },
  mindmap_analyses: { is_solved: false, unit_name: null },
}

const LOCAL_USER_ID = 'local-user'

export class LocalQuery implements PromiseLike<Result> {
  private filters: Filter[] = []
  private orders: { column: string; ascending: boolean }[] = []
  private limitCount: number | null = null
  private mode: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select'
  private payload: Row[] | Row | null = null
  private selectColumns: string | null = null
  private returnRows = false
  private singleMode: 'single' | 'maybe' | null = null

  constructor(private table: TableName) {}

  // ---- sorgu kurucular ----
  select(columns = '*') {
    if (this.mode === 'select') this.selectColumns = columns
    else this.returnRows = true
    this.selectColumns = columns
    return this
  }
  insert(values: Row | Row[]) {
    this.mode = 'insert'
    this.payload = values
    return this
  }
  upsert(values: Row | Row[]) {
    this.mode = 'upsert'
    this.payload = values
    return this
  }
  update(values: Row) {
    this.mode = 'update'
    this.payload = values
    return this
  }
  delete() {
    this.mode = 'delete'
    return this
  }
  eq(column: string, value: any) {
    this.filters.push((r) => r[column] === value || (r[column] != null && value != null && String(r[column]) === String(value)))
    return this
  }
  neq(column: string, value: any) {
    this.filters.push((r) => r[column] !== value)
    return this
  }
  is(column: string, value: null | boolean) {
    this.filters.push((r) => (value === null ? r[column] == null : r[column] === value))
    return this
  }
  in(column: string, values: any[]) {
    const set = new Set(values.map(String))
    this.filters.push((r) => set.has(String(r[column])))
    return this
  }
  order(column: string, opts: { ascending?: boolean } = {}) {
    this.orders.push({ column, ascending: opts.ascending !== false })
    return this
  }
  limit(n: number) {
    this.limitCount = n
    return this
  }
  single() {
    this.singleMode = 'single'
    return this
  }
  maybeSingle() {
    this.singleMode = 'maybe'
    return this
  }

  then<T1 = Result, T2 = never>(
    onfulfilled?: ((value: Result) => T1 | PromiseLike<T1>) | null,
    onrejected?: ((reason: any) => T2 | PromiseLike<T2>) | null
  ): PromiseLike<T1 | T2> {
    return this.execute().then(onfulfilled, onrejected)
  }

  // ---- çalıştırma ----
  private async execute(): Promise<Result> {
    try {
      await ensureSeeded()
      const db = await getDB()
      let rows: Row[]

      switch (this.mode) {
        case 'select': {
          rows = this.applyFilters(await db.getAll(this.table))
          rows = this.applyOrderAndLimit(rows)
          rows = await this.attachRelations(rows)
          break
        }
        case 'insert':
        case 'upsert': {
          const now = new Date().toISOString()
          const list = Array.isArray(this.payload) ? this.payload : [this.payload as Row]
          const tx = db.transaction(this.table, 'readwrite')
          rows = []
          for (const item of list) {
            const existing = this.mode === 'upsert' && item.id ? await tx.store.get(item.id) : undefined
            const row: Row = {
              ...(DEFAULTS[this.table] ?? {}),
              ...(this.table === 'trial_analyses' || this.table === 'mindmap_analyses' || this.table === 'game_results'
                ? { user_id: LOCAL_USER_ID }
                : {}),
              created_at: now,
              ...existing,
              ...stripUndefined(item),
              id: item.id ?? existing?.id ?? newId(),
              updated_at: now,
            }
            await tx.store.put(row)
            rows.push(row)
          }
          await tx.done
          break
        }
        case 'update': {
          const tx = db.transaction(this.table, 'readwrite')
          const all = await tx.store.getAll()
          rows = []
          for (const r of this.applyFilters(all)) {
            const updated = { ...r, ...stripUndefined(this.payload as Row) }
            await tx.store.put(updated)
            rows.push(updated)
          }
          await tx.done
          break
        }
        case 'delete': {
          const matched = this.applyFilters(await db.getAll(this.table))
          await deleteWithCascade(this.table, matched.map((r) => r.id))
          rows = matched
          break
        }
      }

      if (this.mode !== 'select') notifyContentChanged()

      if (this.mode !== 'select' && !this.returnRows && !this.singleMode) {
        return { data: null, error: null }
      }
      return this.shape(rows)
    } catch (e: any) {
      console.error(`[local db] ${this.table}.${this.mode}`, e)
      return { data: null, error: { message: e?.message || String(e) } }
    }
  }

  private shape(rows: Row[]): Result {
    if (this.singleMode === 'single') {
      if (rows.length !== 1) {
        return {
          data: null,
          error: { message: rows.length ? 'Birden fazla kayıt bulundu' : 'Kayıt bulunamadı', code: 'PGRST116' },
        }
      }
      return { data: rows[0], error: null }
    }
    if (this.singleMode === 'maybe') return { data: rows[0] ?? null, error: null }
    return { data: rows, error: null, count: rows.length }
  }

  private applyFilters(rows: Row[]) {
    return this.filters.length ? rows.filter((r) => this.filters.every((f) => f(r))) : rows
  }

  private applyOrderAndLimit(rows: Row[]) {
    if (this.orders.length) {
      rows = [...rows].sort((a, b) => {
        for (const { column, ascending } of this.orders) {
          const av = a[column]
          const bv = b[column]
          if (av === bv) continue
          if (av == null) return 1
          if (bv == null) return -1
          const cmp = av < bv ? -1 : 1
          return ascending ? cmp : -cmp
        }
        return 0
      })
    }
    return this.limitCount != null ? rows.slice(0, this.limitCount) : rows
  }

  /** "id, name, subjects(name)" → her satıra ilgili subjects kaydını ekler */
  private async attachRelations(rows: Row[]) {
    const relations = [...(this.selectColumns || '').matchAll(/(\w+)\s*\(/g)].map((m) => m[1])
    if (!relations.length || !rows.length) return rows
    const db = await getDB()
    for (const rel of relations) {
      const fk = rel.replace(/s$/, '') + '_id'
      const related = new Map((await db.getAll(rel as TableName)).map((r: Row) => [r.id, r]))
      rows = rows.map((r) => ({ ...r, [rel]: related.get(r[fk]) ?? null }))
    }
    return rows
  }
}

async function deleteWithCascade(table: TableName, ids: string[]) {
  if (!ids.length) return
  const db = await getDB()
  for (const child of CASCADE[table] ?? []) {
    const idSet = new Set(ids)
    const children = (await db.getAll(child.table)).filter((r: Row) => idSet.has(r[child.column]))
    await deleteWithCascade(child.table, children.map((r: Row) => r.id))
  }
  const tx = db.transaction(table, 'readwrite')
  for (const id of ids) await tx.store.delete(id)
  await tx.done
}

function stripUndefined(obj: Row) {
  return Object.fromEntries(Object.entries(obj ?? {}).filter(([, v]) => v !== undefined))
}

export { LOCAL_USER_ID }
