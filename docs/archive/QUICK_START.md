# 🚀 Hızlı Başlangıç - Oyun Motoru

## ✅ Kurulum Tamamlandı!

Oyun motoru başarıyla kuruldu ve çalışıyor. Build testi başarılı! ✨

## 📱 Sayfalar

### 1. Ana Sayfa
```
http://localhost:3000/
```
- Dashboard görünümü
- İstatistikler (XP, Streak, Level)
- Ders listesi

### 2. Oyun Listesi
```
http://localhost:3000/games
```
- Sinir Sistemi konusu için 6 oyun
- 2 Matching (Eşleştirme)
- 2 Sequence (Sıralama)
- 2 Grouping (Gruplama)

### 3. Oyun Sayfaları
```
http://localhost:3000/game/game_001  (Nöron Yapısı - Matching)
http://localhost:3000/game/game_002  (Refleks Yayı - Sequence)
http://localhost:3000/game/game_003  (İmpuls İletimi - Sequence)
http://localhost:3000/game/game_004  (Beyin Bölümleri - Grouping)
http://localhost:3000/game/game_005  (Otonom Sinir - Grouping)
http://localhost:3000/game/game_006  (Beyin Görevleri - Matching)
```

## 🎮 Oyun Modları

### 🔗 Matching (Eşleştirme)
- Sol tarafta terimler, sağ tarafta açıklamalar
- Tıklayarak eşleştir
- Tüm eşleştirmeler tamamlanınca "Cevabı Gönder" aktif olur

### 📊 Sequence (Sıralama)
- Aşağıdaki öğeleri tıklayarak sıraya diz
- Yanlış sıralamayı ✕ ile kaldır
- Tüm öğeler sıralandığında "Cevabı Gönder" aktif olur

### 📦 Grouping (Gruplama)
- Öğeleri doğru kategorilere yerleştir
- Her öğe için kategori butonlarına tıkla
- Tüm öğeler yerleştirildiğinde "Cevabı Gönder" aktif olur

## 🎯 Özellikler

✅ **Tek JSON Yapısı**: Tüm oyunlar aynı formatta
✅ **Type-Safe**: Full TypeScript desteği
✅ **Responsive**: Mobil ve desktop uyumlu
✅ **Dark Theme**: Modern karanlık tema
✅ **Animasyonlar**: Smooth Framer Motion animasyonları
✅ **Progress Tracking**: İlerleme takibi
✅ **Score System**: Hata ve süre bazlı puanlama

## 📂 Dosya Yapısı

```
packages/game-engine/
├── src/
│   ├── types.ts              # Tip tanımları
│   ├── game-engine.ts        # Ana motor
│   ├── matching.ts           # Eşleştirme
│   ├── sorting.ts            # Sıralama
│   ├── grouping.ts           # Gruplama
│   ├── utils.ts              # Yardımcılar
│   ├── sample-data.ts        # Örnek veriler
│   └── index.ts              # Exports

src/app/
├── game/[id]/page.tsx        # Dinamik oyun sayfası
├── games/page.tsx            # Oyun listesi
└── page.tsx                  # Ana sayfa
```

## 🔧 Komutlar

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production
npm start

# Type check
npm run type-check
```

## 📊 Build Sonuçları

```
Route (app)                    Size     First Load JS
┌ ○ /                          4.76 kB  158 kB
├ ○ /admin                     56.1 kB  210 kB
├ ƒ /game/[id]                 4.2 kB   110 kB
└ ○ /games                     2.83 kB  148 kB

✓ Build başarılı!
✓ TypeScript hatasız
✓ Tüm sayfalar çalışıyor
```

## 🎨 Yeni Oyun Ekleme

### 1. JSON Formatı

```typescript
// packages/game-engine/src/sample-data.ts

export const myGames: GameCollection = {
  subject: "AYT Biyoloji",
  topic: "Hücre",
  games: [
    {
      id: "game_007",
      title: "Hücre Organelleri",
      mode: "matching",
      data: [
        { key: "Mitokondri", value: "Enerji üretimi" },
        { key: "Ribozom", value: "Protein sentezi" }
      ]
    }
  ]
}
```

### 2. Sayfada Kullan

```typescript
// src/app/games/page.tsx
import { myGames } from '../../../packages/game-engine/src/sample-data'

// Otomatik olarak tüm oyunlar listelenir
```

## 🤖 NotebookLM ile İçerik Üretimi

### Prompt Şablonu

```
Yüklediğim dokümanları analiz et. [KONU ADI] konusuyla ilgili; 
en az 2 'matching', 2 'sequence' ve 2 'grouping' oyunu oluştur. 

Çıktıyı tam olarak şu JSON yapısında ver:

{
  "subject": "AYT Biyoloji",
  "topic": "[Konu]",
  "games": [
    {
      "id": "unique_id",
      "title": "Oyun Başlığı",
      "mode": "matching | sequence | grouping",
      "data": [...]
    }
  ]
}

Hiçbir açıklama metni ekleme, sadece JSON kodunu ver.
```

### Kullanım

1. NotebookLM'e kaynaklarını yükle (PDF, notlar)
2. Yukarıdaki prompt'u kullan
3. Çıkan JSON'u `sample-data.ts`'e ekle
4. Otomatik olarak oyun listesinde görünür

## 🎯 Skor Sistemi

### Puan Hesaplama
```
Score = 100 - (mistakes × 10) - (timeSpent / 1000)
```

### XP Hesaplama
```
XP = Score × ModeMultiplier + (Streak × 5)

Mode Multipliers:
- Matching: 1.0x
- Sequence: 1.2x
- Grouping: 1.5x
```

### Örnek
```
Score: 85
Mode: Grouping (1.5x)
Streak: 5 gün
XP = 85 × 1.5 + (5 × 5) = 152 XP
```

## 📖 Detaylı Dokümantasyon

- `GAME_ENGINE_GUIDE.md` - Tam kullanım kılavuzu
- `CHANGELOG.md` - Değişiklik geçmişi
- `packages/game-engine/README.md` - Package docs

## 🐛 Sorun Giderme

### Build Hatası
```bash
# Cache temizle
rm -rf .next
npm run build
```

### TypeScript Hatası
```bash
# Type check
npm run type-check
```

### Import Hatası
- Tüm import'lar relative path kullanıyor
- `@repo/game-engine` yerine `../../../../packages/game-engine/src`

## 🚀 Sıradaki Adımlar

1. **Veritabanı**: Supabase ile oyun sonuçlarını kaydet
2. **Leaderboard**: Kullanıcı sıralaması
3. **Achievements**: Rozet sistemi
4. **Multiplayer**: Arkadaşlarla yarışma
5. **AI Hints**: Takıldığında ipucu

## ✅ Test Edildi

- ✅ Build başarılı
- ✅ TypeScript hatasız
- ✅ Tüm sayfalar çalışıyor
- ✅ Tüm oyun modları test edildi
- ✅ Responsive tasarım OK
- ✅ Dark theme OK

## 🎉 Hazır!

Oyun motoru production-ready durumda. Şimdi:

1. `http://localhost:3000/games` adresine git
2. Bir oyun seç
3. Oyna ve test et!

---

**Versiyon**: 0.2.0  
**Tarih**: 29 Ocak 2026  
**Durum**: ✅ Production Ready
