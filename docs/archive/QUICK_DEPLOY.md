# ⚡ 5 Dakikada Vercel'e Deploy

## 1️⃣ Supabase Setup (2 dakika)

```bash
# 1. https://supabase.com/dashboard adresine git
# 2. "New Project" oluştur
# 3. SQL Editor'ü aç
# 4. supabase-schema.sql dosyasını kopyala-yapıştır ve çalıştır
# 5. Settings → API → URL ve anon key'i kopyala
```

## 2️⃣ GitHub'a Push (1 dakika)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 3️⃣ Vercel Deploy (2 dakika)

```bash
# 1. https://vercel.com/new adresine git
# 2. GitHub repo'nu seç
# 3. Environment Variables ekle:

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# 4. "Deploy" butonuna tıkla
# 5. 2 dakika bekle ☕
```

## ✅ Bitti!

Deployment URL'ini aç ve test et:
- Login/Register
- Admin panel (/admin)
- Ders ekle
- Oyun oyna

---

## 🔧 Sorun mu var?

### Build hatası
```bash
# Local'de test et
npm install
npm run build
```

### Database bağlantı hatası
- Supabase URL doğru mu?
- Anon key doğru mu?
- SQL schema çalıştırıldı mı?

### Environment variables çalışmıyor
- `NEXT_PUBLIC_` prefix'i var mı?
- Vercel'de her environment için eklendi mi?
- Redeploy yaptın mı?

---

## 📱 Mobil Test

1. Telefonda production URL'i aç
2. Tarayıcı menüsünden "Ana ekrana ekle"
3. App gibi kullan!

---

**🎉 Tebrikler! Uygulamanız canlıda!**
