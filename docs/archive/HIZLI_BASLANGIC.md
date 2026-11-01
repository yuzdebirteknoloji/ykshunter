# 🚀 Hızlı Başlangıç - Görsel Oyun Sistemi

## ⚡ 3 Adımda Kurulum

### 1️⃣ Supabase'e Git
```
https://supabase.com/dashboard
```

### 2️⃣ SQL Editor'ü Aç
Sol menü → **SQL Editor** → **New Query**

### 3️⃣ Bu Kodu Yapıştır ve Çalıştır

```sql
ALTER TABLE image_games 
ADD COLUMN IF NOT EXISTS game_type TEXT DEFAULT 'region';

ALTER TABLE image_games
DROP CONSTRAINT IF EXISTS valid_game_type;

ALTER TABLE image_games
ADD CONSTRAINT valid_game_type CHECK (game_type IN ('region', 'text-cover'));

CREATE INDEX IF NOT EXISTS idx_image_games_type ON image_games(game_type);

UPDATE image_games SET game_type = 'region' WHERE game_type IS NULL;
```

**RUN** butonuna bas ✅

---

## 🎮 Kullanım

### Admin Panel
```
http://localhost:3000/admin
```

1. "Görsel Eşleştirme Oyunu" sekmesi
2. İki mod var:
   - **📍 Bölge İşaretleme**: Bölgeleri çiz ve etiketle
   - **📝 Yazı Kapatma**: Yazıları beyaz kutucuklarla kapat

### Yazı Kapatma Modu Nasıl Kullanılır?

1. Etiketli bir görsel yükle (örn: anatomi şeması)
2. Yazıların üzerine sürükleyerek beyaz kutucuklar çiz
3. Her kutucuğa etiket gir
4. Kaydet

**Oyuncu ne görür?**
- Yazılar beyaz kutucuklarla kapalı
- Yan tarafta etiketler var
- Etiketleri sürükleyip doğru yerlere bırakır

---

## ✅ Test Et

Migration başarılı mı?

1. Admin panelde oyun oluştur
2. Hata almazsan ✅ başarılı
3. Hata alırsan ⚠️ migration'ı tekrar çalıştır

---

## 🆘 Sorun mu var?

**Hata: "game_type does not exist"**
→ Migration'ı tekrar çalıştır

**Oyun kaydedilmiyor**
→ Console'da hatayı kontrol et
→ MIGRATION_TALIMAT.md dosyasına bak

---

**Hazır! 🎉**
