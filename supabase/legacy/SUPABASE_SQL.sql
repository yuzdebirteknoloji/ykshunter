-- ============================================
-- GÖRSEL OYUN SİSTEMİ - GAME_TYPE MIGRATION
-- ============================================
-- Bu SQL'i Supabase Dashboard → SQL Editor'de çalıştırın
-- Tarih: 2025-02-01
-- ============================================

-- 1. game_type kolonunu ekle (yoksa)
ALTER TABLE image_games 
ADD COLUMN IF NOT EXISTS game_type TEXT DEFAULT 'region';

-- 2. Eski constraint'i sil (varsa)
ALTER TABLE image_games
DROP CONSTRAINT IF EXISTS valid_game_type;

-- 3. Yeni constraint ekle
ALTER TABLE image_games
ADD CONSTRAINT valid_game_type CHECK (game_type IN ('region', 'text-cover'));

-- 4. Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_image_games_type ON image_games(game_type);

-- 5. Mevcut kayıtları güncelle
UPDATE image_games SET game_type = 'region' WHERE game_type IS NULL;

-- 6. Kontrol et (sonuçları göreceksiniz)
SELECT 
  COUNT(*) as toplam_oyun,
  COUNT(CASE WHEN game_type = 'region' THEN 1 END) as bolge_oyunlari,
  COUNT(CASE WHEN game_type = 'text-cover' THEN 1 END) as yazi_kapatma_oyunlari
FROM image_games;

-- ============================================
-- BAŞARILI! ✅
-- ============================================
-- Artık iki farklı oyun modu kullanabilirsiniz:
-- 1. 📍 Bölge İşaretleme (region)
-- 2. 📝 Yazı Kapatma (text-cover)
-- ============================================
