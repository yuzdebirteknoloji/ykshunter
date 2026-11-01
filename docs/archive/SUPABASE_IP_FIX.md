# Supabase IP Erişim Sorunu Çözümü

## Sorun
Vercel deployment'ı Supabase'e bağlanamıyor çünkü Supabase IP kısıtlaması var.

## Çözüm 1: IP Allow List (Hızlı)

1. [Supabase Dashboard](https://supabase.com/dashboard) → Projen
2. **Settings** → **Database** → Scroll down
3. **"Network Restrictions"** veya **"IP Allow List"** bul
4. Şu IP'leri ekle:

```
0.0.0.0/0
```

⚠️ Bu geçici bir çözüm - tüm IP'lere izin verir!

## Çözüm 2: Connection Pooler (ÖNERİLEN)

### Adımlar:

1. Supabase Dashboard → **Database** → **Connection Pooling**
2. **Mode:** Transaction
3. **Connection string**'i kopyala
4. Vercel'de environment variable'ı güncelle

### Yeni .env formatı:

```env
# Connection Pooler URL (Vercel için)
NEXT_PUBLIC_SUPABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# Anon Key (aynı kalır)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Çözüm 3: Supabase Client Library Kullan

Direkt PostgreSQL yerine Supabase JS client kullan:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://obqvgbqvcpisupeyywrb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
)
```

Bu REST API üzerinden çalışır, IP kısıtlaması olmaz.

## Vercel'de Environment Variables Güncelleme

1. [Vercel Dashboard](https://vercel.com/dashboard)
2. Projen → **Settings** → **Environment Variables**
3. `NEXT_PUBLIC_SUPABASE_URL` değerini güncelle
4. **Save**
5. **Redeploy** yap

## Test

```bash
# Local test
npm run build

# Vercel'de test
# Deployment loglarını kontrol et
```

## Notlar

- Connection Pooler serverless ortamlar için optimize edilmiştir
- IPv6 desteğini kapatmak da yardımcı olabilir
- Production'da mutlaka IP kısıtlaması kullan
