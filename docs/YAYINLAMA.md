# 🚀 YKS Hunter v2 — Yayınlama Rehberi

Bu rehber v1'den (tek ortak şifreli sistem) v2'ye (herkesin kendi hesabı olduğu sistem) geçişi ve APK'nın dağıtımını anlatır. Sırayla uygula.

---

## 0. Yedek al (2 dk)

Supabase Dashboard → **Database → Backups**. Ücretsiz planda otomatik yedek yoksa SQL Editor'da önemli tabloları (`trial_analyses`, `mindmap_analyses`, `subjects`, `topics`, `question_sets`, `image_games`) CSV olarak dışa aktar.

## 1. Veritabanı migration'ı (3 dk)

1. Supabase Dashboard → **SQL Editor → New query**
2. `supabase/migrations/20261101_auth_rls.sql` dosyasının **tamamını** yapıştır → **Run**
3. "Success" görmelisin. Dosyayı tekrar çalıştırmak güvenlidir.

Bu migration şunları yapar:
- `profiles` tablosu (kullanıcı adı, XP, level, seri, rol)
- Tüm tablolarda RLS: içerik herkese okunur ama sadece admin yazar; analizler sadece sahibine görünür
- Eski şifre hash'li `users` tablosunu ve onu dışarı açan view'ları kilitler
- Oyun sonucu → XP/level/seri trigger'ı, liderlik tablosu fonksiyonu
- Eski verileri yeni hesaba taşımak için `claim_legacy_data()` fonksiyonu

> **Not:** Supabase Auth ayarlarında e-posta onayı açık olsa bile sorun yok. Kayıt sunucu tarafında `email_confirm: true` ile yapılıyor, gerçek e-posta gönderilmiyor.

## 2. Vercel ortam değişkenleri (3 dk)

Vercel → Project → **Settings → Environment Variables** (Production + Preview):

| Değişken | Nereden |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | aynı yer (`anon` / publishable key) |
| `SUPABASE_SERVICE_ROLE_KEY` | aynı yer (`service_role` / secret key). **Gizli tut.** |
| `INVITE_CODE` | Kendin belirle (ör. `yks2027-hunter`). Arkadaşlarına bunu vereceksin. |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Mevcut değerler |

Artık kullanılmayan değişken: `MASTER_PASSWORD` (silebilirsin).

Sonra **Deployments → Redeploy**. Bölge `vercel.json`'da `fra1` (Frankfurt) olarak ayarlı; Türkiye'den daha hızlı.

## 3. Admin hesabını oluştur ve eski veriyi taşı (2 dk)

1. Siteyi aç → **Kayıt Ol** → kullanıcı adı, şifre ve `INVITE_CODE`.
   **İlk kaydolan kişi otomatik olarak admin olur**, o yüzden ilk sen kaydol.
2. **Ayarlar → Profil → "Eski sistemdeki verilerimi bu hesaba taşı"** butonuna bas.
   Eski deneme ve ağaç analizlerin ve XP'n hesabına geçer.
3. Menüde **Admin Paneli** linkini görmelisin.

Başka birini admin yapmak için SQL Editor'da şunu çalıştır:

```sql
update profiles set role = 'admin' where username = 'kullanici_adi';
```

## 4. Android APK

### 4a. (Bir kere) İmzalama anahtarı oluştur — önerilir

Anahtar olmadan da APK üretilir (debug imzalı), ama o durumda her yeni sürümde arkadaşlarının eski uygulamayı silip yeniden kurması gerekir. Kalıcı bir anahtarla güncellemeler doğrudan üstüne kurulur.

Java yüklü bir bilgisayarda:

```bash
bash mobile/scripts/create-keystore.sh
```

Script'in yazdırdığı 4 değeri GitHub → repo → **Settings → Secrets and variables → Actions → New repository secret** altına ekle:
`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

`.jks` dosyasını güvenli bir yerde yedekle. Kaybedersen güncelleme yayınlayamazsın.

### 4b. Site adresini tanımla

GitHub → **Settings → Secrets and variables → Actions → Variables → New variable**:
`CAP_SERVER_URL` = Vercel adresin (ör. `https://ykshunter.vercel.app`)

APK bu adresi açar. Web'e yaptığın her güncelleme APK'yı yeniden dağıtmadan telefonlara gelir.

### 4c. Sürüm yayınla

```bash
git tag v2.0.0
```

```bash
git push origin v2.0.0
```

GitHub Actions → **Android APK** iş akışı yaklaşık 5 dakikada `ykshunter-2.0.0.apk` dosyasını derleyip **Releases** sayfasına yükler. Actions sekmesinden **Run workflow** ile elle de çalıştırabilirsin; o durumda APK, çalıştırmanın **Artifacts** kısmından indirilir.

### 4d. Arkadaşlarına dağıt

Releases linkini gönder. Telefonda:
1. APK'yı indir ve aç.
2. "Bilinmeyen kaynaklardan yüklemeye izin ver" uyarısında izin ver.
3. Uygulamayı aç → **Kayıt Ol** → davet kodu.

### Yerelde derlemek istersen

Android Studio (veya Android SDK + JDK 21) gerekir:

```bash
cd mobile && npm ci && CAP_SERVER_URL=https://senin-adresin.vercel.app npm run apk:debug
```

Çıktı: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`

---

## Sorun giderme

| Belirti | Çözüm |
|---|---|
| Kayıtta "Kayıt şu an kapalı" | Vercel'de `INVITE_CODE` tanımlı değil |
| Kayıtta "Kayıt oluşturulamadı" | `SUPABASE_SERVICE_ROLE_KEY` eksik/yanlış, veya migration çalıştırılmadı |
| Girişten sonra içerik boş | Migration çalıştırılmadı veya RLS politikaları eksik. Migration'ı tekrar çalıştır |
| Admin Paneli görünmüyor | `select username, role from profiles;` ile rolünü kontrol et |
| APK'da "Bağlantı kurulamadı" | `CAP_SERVER_URL` yanlış veya internet yok |
| Yeni APK eskisinin üstüne kurulmuyor | İmzalama anahtarı yok veya değişti. Eskisini sil ve yeniden kur, ya da 4a'yı uygula |
