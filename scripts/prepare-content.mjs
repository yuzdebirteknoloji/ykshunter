#!/usr/bin/env node
/**
 * Supabase'den alınan içerik dışa aktarımını APK'ya gömülecek hâle getirir.
 *
 *   npm run content:prepare -- <dosya.json | csv-klasörü>
 *
 * Kabul edilen girdiler:
 *  - Tek JSON: { subjects: [], topics: [], question_sets: [], image_games: [] }
 *  - Supabase SQL Editor'ın JSON çıktısı: [{ "json_build_object": { ... } }]
 *  - Klasör: içinde bir .json dosyası, ya da subjects.csv, topics.csv,
 *    question_sets.csv, image_games.csv (Supabase Table Editor > Export > CSV)
 *
 * CI'da (GitHub Actions) mobile/content-source klasörü için otomatik çalışır.
 *
 * Çıktı: mobile/content/content.json + mobile/content/images/*
 * İçerikteki Cloudinary görselleri indirilir; APK internetsiz çalışır.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'

const TABLES = ['subjects', 'topics', 'question_sets', 'image_games']
const JSON_COLUMNS = ['data', 'regions']
const BOOL_COLUMNS = ['is_random', 'shuffle_sets']
const outDir = join(process.cwd(), 'mobile', 'content')
const imgDir = join(outDir, 'images')

const input = process.argv[2]
if (!input || !existsSync(input)) {
  console.error('Kullanım: npm run content:prepare -- <dosya.json | csv-klasörü>')
  process.exit(1)
}

// ---------------- okuma ----------------

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  const [header, ...body] = rows.filter((r) => r.length > 1 || r[0])
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), r[i] === '' ? null : r[i]])))
}

function unwrap(data) {
  // [{ json_build_object: {...} }] veya [{ "?column?": "..." }]
  if (Array.isArray(data) && data.length === 1 && data[0] && typeof data[0] === 'object' && !data[0].id) {
    const only = Object.values(data[0])[0]
    return typeof only === 'string' ? JSON.parse(only) : only
  }
  return data
}

function load() {
  if (statSync(input).isDirectory()) {
    const json = readdirSync(input).find((f) => f.toLowerCase().endsWith('.json'))
    if (json) return unwrap(JSON.parse(readFileSync(join(input, json), 'utf8').replace(/^\uFEFF/, '')))
    const content = {}
    for (const t of TABLES) {
      const file = readdirSync(input).find((f) => f.toLowerCase().startsWith(t) && f.endsWith('.csv'))
      content[t] = file ? parseCsv(readFileSync(join(input, file), 'utf8').replace(/^﻿/, '')) : []
    }
    return content
  }
  return unwrap(JSON.parse(readFileSync(input, 'utf8').replace(/^﻿/, '')))
}

function normalize(row) {
  const r = { ...row }
  for (const k of JSON_COLUMNS) {
    if (typeof r[k] === 'string') {
      try { r[k] = JSON.parse(r[k]) } catch {}
    }
  }
  for (const k of BOOL_COLUMNS) {
    if (r[k] === 'true' || r[k] === 't') r[k] = true
    if (r[k] === 'false' || r[k] === 'f') r[k] = false
  }
  return r
}

// ---------------- görseller ----------------

const URL_RE = /https?:\/\/res\.cloudinary\.com\/[^\s"')]+/g
const downloaded = new Map()
let failed = 0

async function localize(url) {
  if (downloaded.has(url)) return downloaded.get(url)
  const ext = (extname(new URL(url).pathname) || '.jpg').toLowerCase().slice(0, 6)
  const name = createHash('sha1').update(url).digest('hex').slice(0, 16) + ext
  const target = join(imgDir, name)
  if (!existsSync(target)) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      writeFileSync(target, Buffer.from(await res.arrayBuffer()))
    } catch (e) {
      failed++
      console.warn(`  ⚠️  indirilemedi (internetten yüklenecek): ${url} — ${e.message}`)
      downloaded.set(url, url)
      return url
    }
  }
  const local = `/content/images/${name}`
  downloaded.set(url, local)
  return local
}

async function localizeDeep(value) {
  if (typeof value === 'string') {
    const urls = value.match(URL_RE)
    if (!urls) return value
    let out = value
    for (const u of urls) out = out.replace(u, await localize(u))
    return out
  }
  if (Array.isArray(value)) return Promise.all(value.map(localizeDeep))
  if (value && typeof value === 'object') {
    const entries = await Promise.all(Object.entries(value).map(async ([k, v]) => [k, await localizeDeep(v)]))
    return Object.fromEntries(entries)
  }
  return value
}

// ---------------- çalıştır ----------------

const raw = load()
const content = {}
for (const t of TABLES) content[t] = (Array.isArray(raw?.[t]) ? raw[t] : []).map(normalize)

if (!TABLES.some((t) => content[t].length)) {
  console.error('❌ Dosyada içerik bulunamadı. Beklenen anahtarlar: ' + TABLES.join(', '))
  process.exit(1)
}

rmSync(outDir, { recursive: true, force: true })
mkdirSync(imgDir, { recursive: true })

console.log('🖼️  Görseller indiriliyor...')
for (const t of TABLES) content[t] = await localizeDeep(content[t])

const body = JSON.stringify(content)
const version = createHash('sha1').update(body).digest('hex').slice(0, 12)
writeFileSync(join(outDir, 'content.json'), JSON.stringify({ version, ...content }))

console.log('✅ mobile/content/content.json hazır')
for (const t of TABLES) console.log(`   ${t}: ${content[t].length}`)
console.log(`   görsel: ${[...downloaded.values()].filter((v) => v.startsWith('/content')).length} indirildi, ${failed} başarısız`)
