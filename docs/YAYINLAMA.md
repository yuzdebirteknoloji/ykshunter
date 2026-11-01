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

APK artık **tamamen çevrimdışı** çalışan ayrı bir sürüm. Veriler telefonda tutuluyor, yukarıdaki Supabase/Vercel adımlarına ihtiyaç duymuyor. Ayrıntılar: **[APK_REHBERI.md](APK_REHBERI.md)**

---

## Sorun giderme

| Belirti | Çözüm |
|---|---|
| Kayıtta "Kayıt şu an kapalı" | Vercel'de `INVITE_CODE` tanımlı değil |
| Kayıtta "Kayıt oluşturulamadı" | `SUPABASE_SERVICE_ROLE_KEY` eksik/yanlış, veya migration çalıştırılmadı |
| Girişten sonra içerik boş | Migration çalıştırılmadı veya RLS politikaları eksik. Migration'ı tekrar çalıştır |
| Admin Paneli görünmüyor | `select username, role from profiles;` ile rolünü kontrol et |
| Yeni APK eskisinin üstüne kurulmuyor | İmzalama anahtarı yok veya değişti. Eskisini sil ve yeniden kur, ya da 4a'yı uygula |
