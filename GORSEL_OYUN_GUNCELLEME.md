# Görsel Oyun Sistemi Güncelleme

## 📋 Yapılan Değişiklikler

### 1. İki Farklı Oyun Modu Eklendi

#### **Mod 1: Bölge İşaretleme** (Mevcut Sistem)
- Görselde bölgeler çizilir (dikdörtgen, polygon, kalem)
- Bölgelere etiketler atanır
- Oyuncular etiketleri seçip bölgelere tıklar

#### **Mod 2: Yazı Kapatma** (YENİ)
- Görseldeki yazılar beyaz kutucuklarla kapatılır
- Her kapatılmış alana etiket girilir
- Oyuncular etiketleri sürükleyip kapatılmış alanlara bırakır

### 2. Admin Panel Güncellemeleri

**Dosya:** `src/components/admin/image-game-tab.tsx`

- Tab sistemi eklendi (Bölge İşaretleme / Yazı Kapatma)
- Her mod için ayrı component:
  - `RegionMarkingMode`: Mevcut bölge işaretleme sistemi
  - `TextCoverMode`: Yeni yazı kapatma sistemi

**Yazı Kapatma Modu Özellikleri:**
- Görseldeki yazıların üzerine sürükleyerek beyaz kutucuk çizme
- Her kutucuğa etiket girme
- Sınırsız sayıda kutucuk ekleme
- Kutucukları silme ve düzenleme

### 3. Oyun Oynama Sayfası Güncellemeleri

**Dosya:** `src/app/play-image/[id]/page.tsx`

- `game_type` kontrolü eklendi
- Text-cover modunda:
  - Beyaz kutucuklar görselin üzerine çiziliyor
  - Yazılar kapatılmış görünüyor
  - Sürükle-bırak sistemi aynı şekilde çalışıyor

### 4. Database Güncellemeleri

**Dosya:** `src/lib/supabase.ts`
- `ImageGame` interface'ine `game_type` alanı eklendi
- `createImageGame` fonksiyonu güncellendi

**Dosya:** `supabase-schema.sql`
- `image_games` tablosuna `game_type` kolonu eklendi
- Constraint: `'region'` veya `'text-cover'`
- Index eklendi: `idx_image_games_type`

**Migration Dosyası:** `add-game-type-migration.sql`
- Mevcut veritabanına `game_type` kolonu ekler
- Varsayılan değer: `'region'`

## 🚀 Kurulum Adımları

### 1. Database Migration Çalıştır

Supabase Dashboard'da SQL Editor'ü aç ve şu komutu çalıştır:

```sql
-- Migration dosyasının içeriğini buraya yapıştır
ALTER TABLE image_games 
ADD COLUMN IF NOT EXISTS game_type TEXT DEFAULT 'region';

ALTER TABLE image_games
ADD CONSTRAINT valid_game_type CHECK (game_type IN ('region', 'text-cover'));

CREATE INDEX IF NOT EXISTS idx_image_games_type ON image_games(game_type);

UPDATE image_games SET game_type = 'region' WHERE game_type IS NULL;
```

### 2. Kodu Test Et

```bash
npm run dev
```

Admin paneline git:
1. "Görsel Eşleştirme Oyunu" sekmesine tıkla
2. İki tab göreceksin: "📍 Bölge İşaretleme" ve "📝 Yazı Kapatma"
3. Her iki modu da test et

## 📝 Kullanım Kılavuzu

### Bölge İşaretleme Modu (Mevcut)

1. Görsel yükle
2. Çizim aracını seç (Dikdörtgen/Kalem/Polygon)
3. Görselde bölgeleri işaretle
4. Her bölgeye etiket gir
5. Oyunu kaydet

### Yazı Kapatma Modu (Yeni)

1. Etiketli bir görsel yükle (örn: anatomi şeması)
2. Görseldeki yazıların üzerine sürükleyerek beyaz kutucuklar çiz
3. Her kutucuğa etiket gir (örn: "İris", "Kornea")
4. Oyunu kaydet

**Oyun Oynama:**
- Oyuncu görseli görür (yazılar beyaz kutucuklarla kapalı)
- Yan tarafta etiketler listelenir
- Oyuncu etiketleri sürükleyip doğru kutucuklara bırakır

## 🎨 Görsel Örnekler

### Admin Panel - Tab Sistemi
```
┌─────────────────────────────────────────┐
│ 🖼️ Görsel Eşleştirme Oyunu             │
│ İki farklı oyun modu ile...            │
├─────────────────────────────────────────┤
│ [📍 Bölge İşaretleme] [📝 Yazı Kapatma]│
├─────────────────────────────────────────┤
│                                         │
│  (Seçilen modun içeriği burada)        │
│                                         │
└─────────────────────────────────────────┘
```

### Yazı Kapatma Modu - Örnek
```
Orijinal Görsel:          Admin Görünümü:         Oyuncu Görünümü:
┌──────────────┐         ┌──────────────┐        ┌──────────────┐
│ ┌─→ İris     │         │ ┌─→ [1]      │        │ ┌─→ [    ]   │
│ │            │         │ │             │        │ │             │
│ └─→ Kornea   │   →     │ └─→ [2]      │   →    │ └─→ [    ]   │
│              │         │               │        │               │
│ ┌─→ Retina   │         │ ┌─→ [3]      │        │ ┌─→ [    ]   │
└──────────────┘         └──────────────┘        └──────────────┘
                                                   
                                                   Etiketler:
                                                   • İris
                                                   • Kornea  
                                                   • Retina
```

## 🔧 Teknik Detaylar

### Component Yapısı

```
ImageGameTab (Ana Component)
├── Tab Sistemi (gameMode state)
├── RegionMarkingMode (Bölge İşaretleme)
│   ├── Canvas çizim araçları
│   ├── Bölge listesi
│   └── Kaydet butonu
└── TextCoverMode (Yazı Kapatma)
    ├── Canvas (beyaz kutucuk çizimi)
    ├── Kapatılmış yazılar listesi
    └── Kaydet butonu
```

### Canvas Çizim Mantığı

**Text-Cover Modunda:**
```typescript
// Beyaz kutucuk çiz
ctx.fillStyle = '#ffffff'
ctx.fillRect(box.x, box.y, box.width, box.height)

// Kenarlık çiz
ctx.strokeStyle = isSelected ? '#ec4899' : '#8b5cf6'
ctx.strokeRect(box.x, box.y, box.width, box.height)

// Numara yaz
ctx.fillText(`${index + 1}`, box.x + 5, box.y + 20)
```

## ✅ Test Checklist

- [ ] Admin panelde iki tab görünüyor
- [ ] Bölge İşaretleme modu çalışıyor (mevcut sistem)
- [ ] Yazı Kapatma modunda görsel yüklenebiliyor
- [ ] Yazıların üzerine beyaz kutucuk çizilebiliyor
- [ ] Kutucuklara etiket girilebiliyor
- [ ] Oyun kaydediliyor
- [ ] Oyun oynama sayfasında text-cover oyunlar açılıyor
- [ ] Beyaz kutucuklar görselin üzerinde görünüyor
- [ ] Sürükle-bırak çalışıyor
- [ ] Doğru/yanlış kontrolü çalışıyor

## 🐛 Bilinen Sorunlar

Şu an bilinen bir sorun yok.

## 📚 İlgili Dosyalar

- `src/components/admin/image-game-tab.tsx` - Admin panel
- `src/app/play-image/[id]/page.tsx` - Oyun oynama sayfası
- `src/lib/supabase.ts` - Database fonksiyonları
- `supabase-schema.sql` - Database şeması
- `add-game-type-migration.sql` - Migration dosyası

## 🎯 Gelecek Geliştirmeler

- [ ] Kutucuk boyutlarını ayarlama
- [ ] Kutucuk renklerini özelleştirme
- [ ] Toplu kutucuk ekleme
- [ ] Şablon sistemleri (örn: anatomi şablonları)
- [ ] Oyun istatistikleri (hangi mod daha çok oynanıyor)
