# 🎯 YKS Hunter

YKS'ye hazırlanan öğrenciler için oyunlaştırılmış çalışma uygulaması. Web'de (PWA) ve Android uygulaması (APK) olarak çalışır.

## Özellikler

- **Oyunlar:** eşleştirme, sıralama, gruplama ve görsel (etiketli şekil / yazı kapatma) oyunları
- **XP, level ve günlük seri**: her oyun sonucu kaydedilir, XP sunucuda hesaplanır
- **Liderlik tablosu**: haftalık, aylık, tüm zamanlar
- **Deneme analizi** ve **ağaç (mindmap) analizi**: her kullanıcıya özel
- **Admin paneli**: ders/konu/soru seti yönetimi, toplu içe aktarma, görsel oyun editörü, duyurular
- **Çok kullanıcılı**: kullanıcı adı + şifre ile giriş, davet kodlu kayıt, kişisel verileri koruyan satır bazlı erişim kuralları (RLS)

## Teknolojiler

Next.js 16 (App Router) · React 19 · Supabase (Auth + Postgres + RLS) · TanStack Query · Tailwind · Framer Motion · Cloudinary · Capacitor 8 (Android)

## Klasör yapısı

```
src/
  app/                 sayfalar ve API route'ları
  components/          arayüz bileşenleri (admin/ altında admin paneli)
  lib/
    supabase.ts        tarayıcı istemcisi ve veri fonksiyonları
    supabase/server.ts sunucu istemcileri (oturumlu + service role)
    auth.ts            oturum / rol yardımcıları
  proxy.ts             giriş zorunluluğu, admin koruması, oturum tazeleme
packages/game-engine/  oyun mantığı
supabase/migrations/   veritabanı migration'ları (sırayla çalıştır)
supabase/legacy/       v1'den kalan eski SQL dosyaları (referans)
mobile/                Capacitor Android projesi
public/sw.js           service worker (offline desteği)
```

## Geliştirme

```bash
npm install
cp .env.example .env.local   # değerleri doldur
npm run dev
```

Kontroller:

```bash
npm run type-check
npm run build
```

## Yayına alma

Adım adım rehber: **[docs/YAYINLAMA.md](docs/YAYINLAMA.md)**

Kısaca:
1. Supabase SQL Editor'da `supabase/migrations/20261101_auth_rls.sql` dosyasını çalıştır.
2. Vercel'e env değişkenlerini gir (`.env.example`'daki liste) ve deploy et.
3. Siteye ilk kaydolan kişi **admin** olur.
4. `v2.0.0` gibi bir tag at → GitHub Actions APK'yı derleyip Releases'a yükler.
