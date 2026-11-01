#!/usr/bin/env node
/**
 * APK için web uygulamasını tamamen statik (sunucusuz) olarak derler ve
 * mobile/www klasörüne koyar. Gömülü içerik mobile/content'ten kopyalanır.
 *
 *   npm run build:mobile
 *
 * Statik çıktıda sunucu kodu olamayacağı için API route'ları ve proxy derleme
 * sırasında geçici olarak kenara alınır, sonra geri konur.
 */
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const stash = join(root, '.mobile-build-stash')
const serverOnly = ['src/app/api', 'src/proxy.ts']
const outDir = join(root, 'out')
const wwwDir = join(root, 'mobile', 'www')
const contentDir = join(root, 'mobile', 'content')

function moveAside() {
  mkdirSync(stash, { recursive: true })
  for (const p of serverOnly) {
    const from = join(root, p)
    if (existsSync(from)) renameSync(from, join(stash, p.replace(/\//g, '__')))
  }
}

function restore() {
  for (const p of serverOnly) {
    const from = join(stash, p.replace(/\//g, '__'))
    if (existsSync(from)) renameSync(from, join(root, p))
  }
  rmSync(stash, { recursive: true, force: true })
}

if (existsSync(stash)) {
  console.log('Önceki yarım kalmış derlemeden kalan dosyalar geri konuyor...')
  restore()
}

let status = 1
moveAside()
process.on('SIGINT', () => {
  restore()
  process.exit(130)
})
try {
  rmSync(join(root, '.next'), { recursive: true, force: true })
  rmSync(outDir, { recursive: true, force: true })
  const r = spawnSync('npx', ['next', 'build'], {
    stdio: 'inherit',
    env: { ...process.env, NEXT_PUBLIC_APP_MODE: 'local', NEXT_TELEMETRY_DISABLED: '1' },
  })
  status = r.status ?? 1
} finally {
  restore()
}

if (status !== 0) {
  console.error('❌ Derleme başarısız')
  process.exit(status)
}

// Web sürümüne ait, APK'da gereksiz dosyalar
for (const f of ['sw.js', 'login', 'offline', 'leaderboard']) {
  rmSync(join(outDir, f), { recursive: true, force: true })
}

if (existsSync(contentDir)) {
  cpSync(contentDir, join(outDir, 'content'), { recursive: true })
  console.log('📦 Gömülü içerik eklendi')
} else {
  console.log('ℹ️  mobile/content yok, APK boş içerikle başlayacak')
}

rmSync(wwwDir, { recursive: true, force: true })
cpSync(outDir, wwwDir, { recursive: true })
rmSync(outDir, { recursive: true, force: true })
console.log(`✅ Statik uygulama hazır: mobile/www`)
