# Cloudinary Kurulum Rehberi

Görsel eşleştirme oyunu için Cloudinary entegrasyonu.

## 1. Cloudinary Hesabı Oluştur

1. https://cloudinary.com adresine git
2. **Sign Up for Free** butonuna tıkla
3. Email ile ücretsiz hesap oluştur

## 2. API Bilgilerini Al

1. Dashboard'a giriş yap
2. Sol üstte **Dashboard** sekmesinde şunları göreceksin:
   - **Cloud Name**: `dxyz123abc` gibi
   - **API Key**: `123456789012345` gibi
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz` gibi (gizli tut!)

## 3. Upload Preset Oluştur

1. Sol menüden **Settings** > **Upload** sayfasına git
2. **Upload presets** bölümünde **Add upload preset** butonuna tıkla
3. Ayarları yap:
   - **Preset name**: `ybt_images` (veya istediğin isim)
   - **Signing Mode**: **Unsigned** seç
   - **Folder**: `game-images` (opsiyonel)
4. **Save** butonuna tıkla

## 4. Environment Variables Ekle

`.env.local` dosyana şunları ekle:

```env
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
CLOUDINARY_UPLOAD_PRESET=ybt_images
```

**ÖNEMLİ**: Bu bilgileri `.env.local` dosyasına ekle, `.env` dosyasına EKLEME (git'e gitmemeli)!

## 5. Vercel'de Environment Variables Ekle

1. Vercel Dashboard > Project > Settings > Environment Variables
2. Yukarıdaki 4 değişkeni ekle
3. **Production**, **Preview**, **Development** için hepsini seç
4. **Save** butonuna tıkla
5. Projeyi yeniden deploy et

## Test Et

1. Admin Panel > 🖼️ Görsel Oyun sekmesine git
2. Bir görsel yükle
3. Başarılı olursa Cloudinary'ye yüklenmiş demektir

## Sorun Giderme

**"Upload failed" hatası alıyorsan:**
- API Key ve Secret'ı kontrol et
- Upload Preset'in "Unsigned" olduğundan emin ol
- Cloud Name'i doğru yazdığından emin ol

**Görsel yüklenmiyor:**
- Browser console'da hata mesajlarına bak
- Network tab'da API isteğini kontrol et
- `.env.local` dosyasının doğru yerde olduğundan emin ol
