# 🚀 Vercel Deployment Guide

## Hızlı Başlangıç

### 1. GitHub'a Push

```bash
git init
git add .
git commit -m "Initial commit: YKS Flow-Learn App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Supabase Kurulumu

1. [Supabase Dashboard](https://supabase.com/dashboard)'a git
2. "New Project" oluştur
3. Project Settings → API → URL ve anon key'i kopyala
4. SQL Editor'de `supabase-schema.sql` dosyasını çalıştır

### 3. Vercel'e Deploy

#### A. Vercel Dashboard Üzerinden (Önerilen)

1. [Vercel Dashboard](https://vercel.com/new)'a git
2. "Import Git Repository" → GitHub repo'nu seç
3. **Framework Preset**: Next.js (otomatik algılanır)
4. **Root Directory**: `.` (boş bırak, root'ta)
5. **Environment Variables** ekle:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
6. "Deploy" butonuna tıkla

#### B. Vercel CLI ile

```bash
# Vercel CLI'yi yükle
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production'a deploy
vercel --prod
```

## Environment Variables

Vercel Dashboard → Settings → Environment Variables:

| Variable | Değer | Açıklama |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase anon/public key |

**Önemli:** Her environment (Production, Preview, Development) için aynı değerleri ekle.

## Build Ayarları

Vercel otomatik olarak şu ayarları kullanır:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

## Domain Ayarları

### Custom Domain Ekleme

1. Vercel Dashboard → Settings → Domains
2. Domain adını ekle (örn: `learngame.com`)
3. DNS kayıtlarını güncelle:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

## PWA (Progressive Web App)

Uygulama PWA olarak çalışıyor:
- ✅ Offline çalışma
- ✅ Ana ekrana eklenebilir
- ✅ Push notifications (gelecekte)

Service Worker otomatik oluşturuluyor: `/public/sw.js`

## Performance Optimizations

### Otomatik Optimizasyonlar
- ✅ Image optimization (Next.js Image)
- ✅ Code splitting
- ✅ Static generation
- ✅ Edge caching
- ✅ Compression (gzip/brotli)

### Cache Headers
- Static assets: 1 yıl cache
- Service Worker: No cache (her zaman fresh)
- API routes: No cache

## Monitoring

### Vercel Analytics
1. Dashboard → Analytics → Enable
2. Otomatik olarak:
   - Page views
   - Performance metrics
   - Web Vitals (LCP, FID, CLS)

### Error Tracking
Vercel otomatik olarak build ve runtime hatalarını gösterir:
- Dashboard → Deployments → Logs

## Troubleshooting

### Build Hatası: "Module not found"
```bash
# Local'de test et
npm run build

# Eğer çalışıyorsa, Vercel'de node version'ı kontrol et
# package.json'da engines belirtildi: Node 18+
```

### Environment Variables Çalışmıyor
- `NEXT_PUBLIC_` prefix'i olmalı (client-side için)
- Vercel'de her environment için ayrı ayrı ekle
- Deploy sonrası değişiklik yaptıysan, redeploy et

### Supabase Connection Error
- URL ve Key'leri kontrol et
- Supabase Dashboard → Settings → API
- RLS (Row Level Security) politikalarını kontrol et

### PWA Çalışmıyor
- HTTPS gerekli (Vercel otomatik sağlar)
- `/manifest.json` ve `/sw.js` erişilebilir olmalı
- Browser console'da service worker kayıtlı mı kontrol et

## Deployment Checklist

Vercel'e deploy etmeden önce:

- [ ] `.env.example` dosyası güncel
- [ ] `supabase-schema.sql` Supabase'de çalıştırıldı
- [ ] Tüm environment variables Vercel'e eklendi
- [ ] Local'de `npm run build` başarılı
- [ ] Git'e push edildi
- [ ] Vercel'de proje oluşturuldu
- [ ] İlk deploy başarılı
- [ ] Production URL'de test edildi
- [ ] PWA çalışıyor (mobilde test et)
- [ ] Admin panel erişilebilir

## Post-Deployment

### İlk Kullanıcı Oluşturma

1. `/login` sayfasına git
2. "Kayıt Ol" ile ilk admin kullanıcısını oluştur
3. `/admin` paneline giriş yap
4. İlk dersi ve konuları ekle

### Monitoring

- Vercel Dashboard'u düzenli kontrol et
- Analytics'i incele
- Error logs'u takip et

## Automatic Deployments

Her git push otomatik deploy tetikler:
- `main` branch → Production
- Diğer branch'ler → Preview deployments
- Pull requests → Preview URL'ler

## Rollback

Hatalı deploy'u geri al:
1. Vercel Dashboard → Deployments
2. Önceki başarılı deployment'ı bul
3. "..." → "Promote to Production"

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

## Hızlı Komutlar

```bash
# Local development
npm run dev

# Production build test
npm run build
npm start

# Deploy to Vercel
vercel --prod

# View logs
vercel logs

# Environment variables
vercel env ls
vercel env add NEXT_PUBLIC_SUPABASE_URL
```

## Sonuç

✅ Tek komutla deploy: `vercel --prod`
✅ Otomatik HTTPS ve CDN
✅ Sınırsız bandwidth
✅ Otomatik scaling
✅ Zero-config deployment

🎉 **Deployment tamamlandı! Artık uygulamanız canlıda!**
