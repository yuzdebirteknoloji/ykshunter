# 🚀 Database Migration Talimatı

## ⚠️ ÖNEMLİ: Bu adımları takip edin

Görsel oyun sisteminin yeni özelliği için database'e `game_type` kolonu eklenmesi gerekiyor.

## 📋 Adım Adım Kurulum

### 1. Supabase Dashboard'a Git

1. Tarayıcıda Supabase projenizi açın
2. Sol menüden **SQL Editor** seçeneğine tıklayın
3. **New Query** butonuna tıklayın

### 2. Migration SQL'ini Çalıştır

Aşağıdaki SQL kodunu kopyalayıp SQL Editor'e yapıştırın ve **RUN** butonuna basın:

```sql
-- Migration: Add game_type column to image_games table
-- Date: 2025-02-01

-- Add game_type column with default value 'region' for existing records
ALTER TABLE image_games 
ADD COLUMN IF NOT EXISTS game_type TEXT DEFAULT 'region';

-- Drop constraint if exists, then add it (to avoid duplicate error)
ALTER TABLE image_games
DROP CONSTRAINT IF EXISTS valid_game_type;

ALTER TABLE image_games
ADD CONSTRAINT valid_game_type CHECK (game_type IN ('region', 'text-cover'));

-- Create index for faster filtering by game type
CREATE INDEX IF NOT EXISTS idx_image_games_type ON image_games(game_type);

-- Update existing records to have 'region' type (if any exist without it)
UPDATE image_games SET game_type = 'region' WHERE game_type IS NULL;

-- Verify the migration
SELECT 
  COUNT(*) as total_games,
  COUNT(CASE WHEN game_type = 'region' THEN 1 END) as region_games,
  COUNT(CASE WHEN game_type = 'text-cover' THEN 1 END) as text_cover_games
FROM image_games;
```

### 3. Sonucu Kontrol Et

SQL çalıştıktan sonra en altta bir tablo göreceksiniz:

```
total_games | region_games | text_cover_games
------------|--------------|------------------
     5      |      5       |        0
```

Bu, migration'ın başarılı olduğunu gösterir.

### 4. Uygulamayı Yeniden Başlat

Terminal'de:

```bash
# Ctrl+C ile durdur
# Sonra tekrar başlat
npm run dev
```

### 5. Test Et

1. Admin paneline git: `http://localhost:3000/admin`
2. "Görsel Eşleştirme Oyunu" sekmesine tıkla
3. İki tab göreceksin:
   - 📍 Bölge İşaretleme
   - 📝 Yazı Kapatma
4. "Yazı Kapatma" tab'ına tıkla
5. Bir görsel yükle ve test et

## ✅ Başarı Kontrolü

Migration başarılı olduysa:
- ✅ Oyun oluşturulurken hata almayacaksınız
- ✅ İki farklı mod çalışacak
- ✅ Oyunlar kaydedilecek

## 🐛 Sorun Giderme

### Hata: "column game_type does not exist"

**Çözüm:** Migration SQL'ini tekrar çalıştırın.

### Hata: "constraint already exists"

**Çözüm:** Normal, migration zaten çalıştırılmış. Devam edebilirsiniz.

### Hata: "permission denied"

**Çözüm:** Supabase projesinde admin yetkileriniz olduğundan emin olun.

## 📞 Yardım

Sorun yaşarsanız:
1. Supabase Dashboard → Table Editor → image_games
2. Kolonları kontrol edin, `game_type` kolonu var mı?
3. Yoksa migration'ı tekrar çalıştırın

---

**Not:** Bu migration sadece bir kez çalıştırılmalıdır. Tekrar çalıştırmak zararsızdır (IF NOT EXISTS kullanıldı).
