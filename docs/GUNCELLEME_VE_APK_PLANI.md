# YKS Hunter – Güncelleme ve Android APK Planı

> Hazırlanma: Kasım 2026 · Kapsam: mevcut Next.js uygulamasını güncellemek, çok kullanıcılı hâle getirmek ve arkadaşlara dağıtılabilir bir APK üretmek.

## 1. Mevcut Durum (İnceleme Bulguları)

**Teknoloji:** Next.js 16.1 (App Router, Turbopack) · React 19 · Supabase · TanStack Query · Tailwind 3 · Framer Motion · Cloudinary · next-pwa 5. Vercel'de çalışıyor.

**Özellikler:** Eşleştirme / sıralama / gruplama oyunları, görsel (etiketli resim) oyunlar, deneme analizi, ağaç (mindmap) analizi, admin paneli (toplu içe aktarma, duyurular, içerik yönetimi), dashboard.

**Sağlık kontrolü:**
- `tsc --noEmit` ✅ hatasız.
- `npm run build` ❌ env değişkenleri olmadan çöküyor: `src/app/api/announcements/route.ts` Supabase istemcisini modül seviyesinde oluşturuyor.

### Kritik sorunlar (arkadaşlar kullanmadan önce çözülmeli)

| # | Sorun | Yer | Etki |
|---|-------|-----|------|
| 1 | **Tek kullanıcılı giriş.** Giriş sadece ortak bir `MASTER_PASSWORD` ile yapılıyor ve herkes veritabanındaki *ilk* kullanıcıya bağlanıyor. | `src/app/api/auth/login/route.ts` | Tüm arkadaşlar aynı hesabı, aynı XP'yi, birbirinin deneme analizlerini görür. |
| 2 | **Session cookie imzasız.** Kullanıcı objesi düz JSON olarak cookie'ye yazılıyor. | `src/lib/auth.ts` | Cookie elle düzenlenerek başka kullanıcı olunabilir. |
| 3 | **RLS fiilen kapalı.** Politikalar `auth.uid()` kullanıyor ama Supabase Auth kullanılmıyor; `FIX_DATABASE_ERROR.sql` ve mindmap SQL'i RLS'yi kapatıyor. Anon key istemcide açık. | `*.sql`, `src/lib/supabase.ts` | Anon key'i olan herkes tüm tabloları okuyup yazabilir/silebilir. |
| 4 | **Admin yetkisi yok.** `/admin`, içerik yönetimi, `POST/DELETE /api/announcements`, `/api/upload-image` herhangi bir rol kontrolü yapmıyor. | ilgili route'lar | Her kullanıcı içerik silebilir, Cloudinary'ye sınırsız yükleme yapabilir. |
| 5 | Giriş log'larında şifrenin ilk 2 karakteri basılıyor; varsayılan şifre `defaultpassword`. | login route | Bilgi sızıntısı. |

### Fonksiyonel hatalar / teknik borç

- **Oyun sonuçları kaydedilmiyor:** `/api/game/result` hiçbir yerden çağrılmıyor → XP/level/streak veritabanında hiç artmıyor. Ayrıca `game_results.mode` constraint'i görsel oyunları kapsamıyor.
- **PWA çalışmıyor olabilir:** `next-pwa@5` webpack eklentisi; build Turbopack ile yapılıyor ve `public/sw.js` üretilmiyor. Bakımı da bırakılmış.
- `middleware.ts` → Next 16'da `proxy.ts` olarak yeniden adlandırılmalı (deprecation uyarısı). `swcMinify` artık geçersiz seçenek.
- `vercel.json` içinde Supabase URL/anon key sabit yazılmış, bölge `iad1` (ABD) → Türkiye'deki kullanıcılar için `fra1` daha hızlı.
- Kullanılmayan monorepo kalıntıları: `apps/web`, `packages/*`, `turbo.json` (kök uygulama bunları kullanmıyor).
- Kökte 41 adet dağınık `.md` ve 7 adet sıralı olmayan `.sql` dosyası → migration sırası belirsiz.
- Marka tutarsızlığı: manifest "Learn Game", README "YKS Flow-Learn", repo "ykshunter".
- Bağımlılıklar: minor güncellemeler mevcut (next 16.4, supabase-js 2.118, react 19.3 vb.). Büyük major'lar (Tailwind 4, framer-motion → motion 12+, lucide 1.x) opsiyonel.
- Test yok, CI yok, lint script'i (`next lint`) Next 16'da kaldırıldı.

## 2. Hedef Mimari

```
[Android APK (Capacitor WebView)] ──┐
[Tarayıcı / PWA]  ──────────────────┼──> Vercel (Next.js, fra1) ──> Supabase (Auth + Postgres + RLS)
                                    │                         └──> Cloudinary (signed upload, admin)
```

**APK yaklaşımı – Önerilen: Capacitor + uzak URL.** Uygulama API route'ları ve sunucu tarafı oturum kullandığı için `next export` ile statik paketlenemez. Capacitor, Vercel'deki siteyi native kabuk içinde açar; bize native geri tuşu, splash, status bar, bildirim gibi yetenekler verir. İçerik güncellemesi için APK'yı yeniden dağıtmaya gerek kalmaz.

| Seçenek | Artı | Eksi |
|---|---|---|
| **Capacitor (uzak URL)** ✅ | Kolay, native eklentiler, Play'siz sideload | İnternet gerekir (PWA cache ile hafifletilir) |
| TWA (Bubblewrap) | En hafif, Chrome motoru | Cihazda Chrome şart, `assetlinks.json` doğrulaması gerekir yoksa URL çubuğu görünür |
| Statik export + Capacitor | Tam offline | API route'larının Supabase Edge Function'a taşınması gerekir – büyük iş |

## 3. Uygulama Planı

### Faz 0 — Temizlik ve sağlam build (≈0,5 gün)
1. `.env.example` oluştur (Supabase URL/anon key, `SUPABASE_SERVICE_ROLE_KEY`, Cloudinary, `SESSION_SECRET`); `vercel.json`'dan sabit key'leri kaldır, bölgeyi `fra1` yap.
2. Supabase istemcisini route içinde lazy oluştur → env yokken build kırılmasın.
3. `middleware.ts` → `proxy.ts`, `swcMinify` kaldır, `lint` script'ini ESLint CLI'a taşı.
4. `apps/`, `packages/`, `turbo.json` kaldır (veya gerçekten kullanılacaksa taşı — öneri: kaldır).
5. Dokümanları `docs/` altında birkaç dosyada birleştir; SQL'leri `supabase/migrations/0001_…sql` şeklinde sıralı hâle getir.
6. Bağımlılıkların minor/patch güncellemesi; build + tip kontrolü.

### Faz 1 — Çok kullanıcılı ve güvenli kimlik doğrulama (≈2–3 gün) ⚠️ en önemli faz
1. **Supabase Auth'a geçiş** (`@supabase/ssr`): kullanıcı adı + şifre ile kayıt/giriş (arka planda `kullaniciadi@ykshunter.local` sahte e-postası veya gerçek e-posta).
2. `public.users` → `profiles` tablosu (`id = auth.users.id`, `username`, `display_name`, `total_xp`, `level`, `streak_days`, `role`).
3. **Davet kodu** ile kayıt (sadece arkadaşlar kayıt olabilsin): `invite_codes` tablosu veya env'de tek kod.
4. Tüm tablolarda **RLS aç**:
   - `subjects`, `topics`, `question_sets`, `image_games`, `announcements`: herkes okur, sadece `role = 'admin'` yazar.
   - `game_results`, `user_topic_stats`, `daily_activity`, `trial_analyses`, `mindmap_analyses`: sadece sahibi (`auth.uid() = user_id`).
5. `/admin` ve admin API'lerine rol kontrolü; `/api/upload-image` için oturum + boyut/tür sınırı.
6. Mevcut verinin taşınması: mevcut tek kullanıcının verileri senin hesabına bağlanır.
7. Giriş/kayıt sayfası yeniden tasarlanır; eski master-password akışı ve log'lar silinir.

### Faz 2 — Fonksiyonel düzeltmeler ve arkadaşlar için özellikler (≈1–2 gün)
1. Oyun bitiminde `/api/game/result` çağrısı (veya doğrudan RLS'li insert); `mode` constraint'ine görsel oyun ekle; XP sunucuda hesaplansın (istemciden gelen XP'ye güvenilmesin).
2. Streak hesaplamasını trigger'a bağla.
3. **Arkadaş liderlik tablosu** (haftalık XP) — arkadaş grubu için motivasyon.
4. Profil/ayarlar: görünen ad, avatar, şifre değiştirme.
5. Marka birliği: isim "YKS Hunter", yeni ikon seti (maskable + Android adaptive icon).

### Faz 3 — Mobil deneyim ve PWA (≈1 gün)
1. `next-pwa` → **Serwist** (`@serwist/next`) ile değiştir; offline sayfası, içerik ve görsel cache'i.
2. Safe-area (`env(safe-area-inset-*)`), viewport, dokunmatik hedef boyutları, oyun ekranlarında yatay/dikey kontrolü.
3. Mobilde sidebar yerine alt navigasyon çubuğu.
4. Lighthouse mobil skoru ≥ 90 hedefi.

### Faz 4 — Android APK (Capacitor) (≈1 gün)
1. `mobile/` klasöründe Capacitor projesi: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`.
2. `capacitor.config.ts`: `appId: com.yuzdebir.ykshunter`, `server.url: https://<vercel-domain>`, `allowNavigation` sadece kendi domainimiz + Supabase + Cloudinary.
3. Eklentiler: `@capacitor/app` (Android geri tuşu → tarayıcı geçmişi), `@capacitor/splash-screen`, `@capacitor/status-bar`, `@capacitor/network` (offline uyarısı), `@capacitor/share` (opsiyonel).
4. Uygulamada `Capacitor.isNativePlatform()` kontrolü ile PWA kurulum uyarısının APK'da gizlenmesi.
5. İkon/splash üretimi: `@capacitor/assets`.
6. Release imzalama: keystore oluştur, **repo'ya koyma** — GitHub Secrets'ta base64 olarak sakla.
7. Test: Android 8+ gerçek cihaz/emülatör; giriş cookie'sinin uygulama yeniden açıldığında korunduğu, görsel yükleme (kamera/galeri `<input type=file>`), geri tuşu, offline davranışı.

### Faz 5 — CI/CD ve dağıtım (≈0,5 gün)
1. GitHub Actions: PR'larda `tsc` + lint + build.
2. `v*` tag'i atıldığında: JDK 21 + Android SDK ile `./gradlew assembleRelease`, imzala, **GitHub Releases**'a `ykshunter-vX.Y.Z.apk` yükle.
3. Arkadaşlara dağıtım: Releases linki veya QR kod; "Bilinmeyen kaynaklara izin ver" kısa rehberi.
4. Uygulama içi güncelleme uyarısı: açılışta en son release sürümünü kontrol et, eskiyse indirme linki göster. (Web içeriği zaten Vercel'den canlı geldiği için APK güncellemesi sadece native değişikliklerde gerekir.)
5. (Opsiyonel) Firebase App Distribution veya Play Console "Internal testing" (100 kişiye kadar, tek seferlik 25$).

## 4. Zaman Çizelgesi (tahmini)

| Faz | Süre |
|---|---|
| 0 – Temizlik/build | 0,5 gün |
| 1 – Auth + RLS | 2–3 gün |
| 2 – Düzeltmeler/özellikler | 1–2 gün |
| 3 – Mobil/PWA | 1 gün |
| 4 – APK | 1 gün |
| 5 – CI/dağıtım | 0,5 gün |
| **Toplam** | **≈6–8 iş günü** |

Önerilen sıra: 0 → 1 → 4 (erken bir APK ile arkadaşlarla test) → 2 → 3 → 5.

## 5. Riskler
- **Veri taşıma:** Auth geçişinde mevcut ilerleme kaybolmasın diye Supabase yedeği alınmalı (`pg_dump` / dashboard backup).
- **Supabase free tier:** 1 hafta işlem olmazsa proje durdurulur; arkadaş grubu aktifse sorun olmaz.
- **Cloudinary kotası:** yükleme sadece admin + deneme analizi için açık kalmalı, boyut sınırı konmalı.
- **WebView cookie'leri:** Capacitor'da `server.url` aynı origin olduğu için sorun beklenmez; yine de Faz 4'te doğrulanacak.

## 6. Netleşmesi Gerekenler
1. Vercel'deki canlı domain hangisi? (APK bu adresi açacak)
2. Giriş: kullanıcı adı + şifre mi, e-posta + şifre mi, Google ile giriş mi?
3. İçeriği (ders/konu/oyun) sadece sen mi ekleyeceksin, yoksa arkadaşların da ekleyebilsin mi?
4. Deneme/ağaç analizleri tamamen kişisel mi kalsın, yoksa paylaşılabilir mi olsun?
5. Kaç kişi kullanacak? (>100 ise Play internal testing yerine Releases yeterli)
