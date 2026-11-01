# 📱 YKS Hunter — Çevrimdışı Android APK

APK **tamamen çevrimdışı** çalışır: internet, sunucu, Supabase veya giriş gerekmez. Tüm veriler (XP, seri, deneme ve ağaç analizleri ve fotoğrafları, kullanıcının eklediği içerik) telefonun kendi hafızasında (IndexedDB) saklanır.

Web sürümü (Vercel + Supabase + giriş) ayrı olarak çalışmaya devam eder; ikisi aynı kodu kullanır.

| | Web | APK |
|---|---|---|
| Veri | Supabase (bulut) | Telefon (IndexedDB) |
| Giriş | Kullanıcı adı + şifre | Yok |
| Liderlik tablosu | Var | Yok |
| Admin paneli | Sadece admin | Var (telefon sahibi kendi içeriğini yönetir) |
| İnternet | Gerekli | Gerekmez |

## 1. İçeriği koy

APK'nın içinde hazır gelecek dersler, konular, soru setleri ve görsel oyunlar `mobile/content-source/` klasöründen alınır.

**Supabase'den dışa aktarma (önerilen yol):** Supabase → SQL Editor'da şunu çalıştır:

```sql
select json_build_object(
  'subjects',      (select coalesce(json_agg(s), '[]') from subjects s),
  'topics',        (select coalesce(json_agg(t), '[]') from topics t),
  'question_sets', (select coalesce(json_agg(q), '[]') from question_sets q),
  'image_games',   (select coalesce(json_agg(i), '[]') from image_games i)
) as content;
```

Sonuçtaki hücreyi kopyala ve `mobile/content-source/content.json` olarak kaydet. Alternatif olarak Table Editor'dan dört tabloyu CSV olarak dışa aktarıp (`subjects.csv`, `topics.csv`, `question_sets.csv`, `image_games.csv`) aynı klasöre koyabilirsin.

APK derlenirken içerik okunur ve Cloudinary'deki görseller indirilip APK'nın içine gömülür.

> ⚠️ Repo herkese açık (public). Bu klasöre koyduğun içerik GitHub'da herkes tarafından görülebilir. İstemiyorsan repoyu private yap.

## 2. (Önerilir) İmzalama anahtarı

Anahtar yoksa APK debug anahtarıyla imzalanır ve her derlemede anahtar değişir. O durumda yeni sürümü kurmak için eskisini silmek gerekir, **silmek de telefondaki tüm verileri siler.** Bunu önlemek için bir kere anahtar oluştur:

```bash
bash mobile/scripts/create-keystore.sh
```

Script'in yazdırdığı 4 değeri GitHub → Settings → Secrets and variables → Actions altına ekle: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

## 3. APK üret

Tag at; GitHub Actions APK'yı derleyip **Releases** sayfasına koyar:

```bash
git tag v2.0.0
```

```bash
git push origin v2.0.0
```

Ya da Actions → **Android APK** → **Run workflow** (APK, çalıştırmanın Artifacts kısmında olur).

Yerelde (Android SDK + JDK 21 gerekir):

```bash
npm ci && cd mobile && npm ci && npm run apk:debug
```

## 4. Telefonda

- APK'yı aç → "Bilinmeyen kaynaklardan yüklemeye izin ver".
- **Ayarlar → Verilerim:**
  - **Yedek al**: tüm verileri bir JSON dosyası olarak Drive/WhatsApp vb. yere kaydeder.
  - **Yedekten geri yükle**: telefon değişince veya uygulama silinince verileri geri getirir.
  - **İçerik dosyası ekle**: yeni ders/konu/soru seti JSON'u (yukarıdaki SQL çıktısıyla aynı format) içe aktarır.
- Admin panelinden yeni içerik de eklenebilir. Fotoğraflar telefonda sıkıştırılıp saklanır.

## Teknik notlar

- `npm run build:mobile`: `NEXT_PUBLIC_APP_MODE=local` ile Next.js statik çıktı (`output: 'export'`) alır. API route'ları ve `proxy.ts` derleme sırasında geçici olarak kenara alınır. Çıktı `mobile/www`'ye kopyalanır.
- `src/lib/local/`: Supabase istemcisini taklit eden IndexedDB katmanı (`query.ts`), içerik yükleme (`seed.ts`), profil/XP (`profile.ts`), yedekleme (`backup.ts`), görsel sıkıştırma (`images.ts`).
- Capacitor uzantısız her yol için kök `index.html`'i döner. Bu yüzden uygulama içinde sayfa yenileme yapılmaz; dinamik sayfalar query parametresi kullanır (`/topic?id=…`, `/play?topic=…&mode=…`, `/play-image?id=…`).
- Yeni APK'da içerik sürümü (`content.json` → `version`) değişirse içerik id'ye göre güncellenir; kullanıcının verileri korunur.
