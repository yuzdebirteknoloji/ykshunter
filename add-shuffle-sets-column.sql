-- Topic tablosuna shuffle_sets kolonu ekle
ALTER TABLE topics 
ADD COLUMN IF NOT EXISTS shuffle_sets BOOLEAN DEFAULT true;

-- Mevcut tüm konular için shuffle_sets'i true yap (varsayılan davranış)
UPDATE topics SET shuffle_sets = true WHERE shuffle_sets IS NULL;

-- Yorum: 
-- shuffle_sets = true: Setler rastgele sırada gelir (varsayılan)
-- shuffle_sets = false: Setler oluşturulma sırasına göre gelir
