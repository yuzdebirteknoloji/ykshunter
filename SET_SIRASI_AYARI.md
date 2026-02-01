# 🎲 Set Sırası Ayarı

## Özellik

Artık her konu için setlerin rastgele mi yoksa sırayla mı geleceğini ayarlayabilirsiniz!

## Nasıl Kullanılır?

### 1. İçerik Yönetimi'ne Git
- Dashboard → İçerik Yönetimi tab'ına tıkla

### 2. Konuyu Düzenle
- Dersi genişlet
- Düzenlemek istediğin konunun yanındaki **✏️ Düzenle** butonuna tıkla

### 3. Set Sırası Ayarını Seç

#### 🎲 Rastgele Sıra (Varsayılan)
- Setler her oyunda farklı sırada gelir
- Daha dinamik ve çeşitli deneyim
- Öğrenci her seferinde farklı sorularla karşılaşır

#### 📋 Sabit Sıra
- Setler her zaman aynı sırada gelir
- Oluşturulma sırasına göre sıralanır
- Belirli bir öğrenme sırası istiyorsan ideal
- Örnek: Temel → Orta → İleri seviye

### 4. Kaydet
- Değişiklikleri kaydet
- Ayar hemen aktif olur

## Önemli Notlar

### ✅ Etkilenenler:
- Set sırası (hangi set önce gelecek)
- "Sonraki Set" butonu davranışı
  - Rastgele: Her tıklamada rastgele bir set
  - Sabit: Sırayla bir sonraki set

### ❌ Etkilenmeyenler:
- Setlerin içindeki sorular (her türlü karıştırılır)
- Eşleştirme oyununda terim-açıklama sırası
- Sıralama oyununda öğe sırası
- Gruplama oyununda öğe sırası

## Kullanım Senaryoları

### Rastgele Sıra İçin:
- ✅ Genel tekrar ve pratik
- ✅ Sınav hazırlığı
- ✅ Çeşitlilik istenen konular
- ✅ Tüm setler aynı seviyede

### Sabit Sıra İçin:
- ✅ Adım adım öğrenme
- ✅ Zorluk seviyesi artan konular
- ✅ Belirli bir sıra gereken konular
- ✅ Örnek: Temel kavramlar → İleri konular

## Örnek

### Biyoloji - Sinir Sistemi

**Rastgele Sıra (Varsayılan):**
```
Oyun 1: Set 3 → Set 1 → Set 5 → Set 2 → Set 4
Oyun 2: Set 2 → Set 4 → Set 1 → Set 3 → Set 5
```

**Sabit Sıra:**
```
Oyun 1: Set 1 → Set 2 → Set 3 → Set 4 → Set 5
Oyun 2: Set 1 → Set 2 → Set 3 → Set 4 → Set 5
```

## Database Değişikliği

SQL dosyasını çalıştır:
```sql
-- add-shuffle-sets-column.sql dosyasını Supabase'de çalıştır
```

Bu dosya:
- `topics` tablosuna `shuffle_sets` kolonu ekler
- Varsayılan değer: `true` (rastgele)
- Mevcut tüm konular için `true` olarak ayarlar

## Teknik Detaylar

### Database:
- Kolon: `topics.shuffle_sets`
- Tip: `BOOLEAN`
- Varsayılan: `true`

### Frontend:
- İçerik Yönetimi'nde düzenleme modal'ı
- Radio button ile seçim
- Anında kayıt

### Oyun Mantığı:
```typescript
// İlk set seçimi
if (topic.shuffle_sets !== false) {
  // Rastgele başla
  const initialIndex = Math.floor(Math.random() * questionSets.length)
} else {
  // İlk setten başla
  const initialIndex = 0
}

// Sonraki set
if (topic.shuffle_sets !== false) {
  // Rastgele bir set
  nextIndex = Math.floor(Math.random() * questionSets.length)
} else {
  // Sırayla sonraki
  nextIndex = (currentIndex + 1) % questionSets.length
}
```

## Sonuç

Artık her konu için set sırasını kontrol edebilirsin:
- 🎲 Rastgele: Dinamik ve çeşitli
- 📋 Sabit: Yapılandırılmış ve sıralı

**Not:** Setlerin içindeki sorular her türlü karıştırılır, sadece set sırası etkilenir!
