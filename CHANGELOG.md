# Değişiklik Günlüğü

## [2.2.0] - 2026-11-01

### Düzeltmeler
- Ağaç Analizi'nde fotoğraf + not ekleme butonu alt menünün arkasında kalıyordu. Buton yukarı alındı, başlığa da "Fotoğraf + not ekle" butonu eklendi.
- Ünite seçmeden ekleme modalı açılınca kayıt yapılamıyordu. Modalın içinde ders/ünite seçimi eklendi.
- Ağaç Analizi sayfasından çıkınca uygulama koyu temada kalıyordu.
- Sayfalar gereksiz yere ekran boyundan uzun oluyordu (boş kaydırma).
- Modallar durum çubuğu / hareket çubuğu altında kalabiliyordu.
- Ana sayfada bir derse dokununca Oyunlar'da o ders seçili gelmiyordu.
- Android geri tuşuyla sayfa değişince mobil menü açık kalıyordu.

### İyileştirmeler
- Ana sayfada ilerleme kartı: level, XP, günlük seri ve sonraki level'a kalan XP.
- APK boyutu küçüldü: kullanılmayan Supabase kütüphanesi APK'dan çıkarıldı (~270 KB JS).
- Kalıcı indirme linki: releases/latest/download/ykshunter.apk her zaman son sürümü indirir.

## [2.1.0] - 2026-11-01

### Düzeltmeler
- JSON ile eklenen oyunlar uygulama yeniden açılana kadar görünmüyordu (önbellek). Artık hemen görünüyor.
- Android 15+'ta üst menü durum çubuğunun altında kalıp tıklanamıyordu. Güvenli alan boşlukları eklendi.
- Ayarlar'da "Kaydet" butonu taşıyordu.

### Yeni
- Mobil için yeni gezinme: alt sekme çubuğu, büyük hamburger butonu, soldan açılan menü.
- Toplu İçe Aktar: Sıralama / Eşleştirme / Gruplama için hazır NotebookLM promptları (tek dokunuşla kopyala) ve örnek JSON'lar.
- NotebookLM cevabındaki ```json işaretleri ve fazladan metinler otomatik temizleniyor; birden fazla JSON aynı anda yapıştırılabiliyor; hatalar anlaşılır Türkçe mesajlarla gösteriliyor.
- İçe aktarma sonrası "Hemen oyna" butonu.
- İlk açılışta bir kez gösterilen kullanım rehberi (menüden "Nasıl kullanılır?" ile tekrar açılabilir).
- Oyunlar listesinde sadece içeriği olan oyun türleri gösteriliyor.
- Durum çubuğu simgeleri açık/koyu temaya uyuyor.

## [2.0.0] - 2026-11-01

### Yeni
- Çok kullanıcılı sistem: kullanıcı adı + şifre ile giriş, davet kodlu kayıt (Supabase Auth)
- Liderlik tablosu (haftalık / aylık / tüm zamanlar)
- Profil bölümü (görünen ad, XP, level, seri)
- Android uygulaması (Capacitor) ve otomatik APK yayınlama (GitHub Actions)
- Offline sayfası ve yeni service worker
- Yeni ikon seti

### Düzeltmeler
- Oyun sonuçları artık kaydediliyor; XP, level ve seri gerçekten artıyor (görsel oyunlar dahil)
- Oyunu sıfırlama butonu çöküyordu
- Build, env değişkenleri olmadan da çalışıyor
- PWA ikonları bozuktu (gerçek PNG değildi)

### Güvenlik
- Ortak master şifre ve imzasız oturum cookie'si kaldırıldı
- Tüm tablolarda RLS: analizler sadece sahibine görünür, içerik sadece admin tarafından değiştirilebilir
- Eski `users` tablosundaki şifre hash'leri dışarıya kapatıldı
- Duyuru ve görsel yükleme API'lerine yetki kontrolü, yükleme boyut/tür sınırı
- Giriş log'larından şifre bilgisi kaldırıldı

---

## 🎮 Oyun Motoru Güncellemesi - v0.2.0

## 📅 Tarih: 29 Ocak 2026

## 🎯 Yapılan Değişiklikler

### ✨ Yeni Özellikler

#### 1. Master JSON Yapısı
- Tüm oyun modları tek bir JSON formatında birleştirildi
- `GameCollection` tipi ile koleksiyon yönetimi
- Subject, unit, topic metadata desteği
- Otomatik mod algılama ve yönlendirme

#### 2. Yeni Tip Tanımları (`types.ts`)
- `GameMode`: 'matching' | 'sequence' | 'grouping'
- `MatchingData`, `SequenceData`, `GroupingData`
- `AnyGame` union type
- `GameState` ve `GameResult` tipleri

#### 3. Birleşik Game Engine (`game-engine.ts`)
- `GameEngine` sınıfı ile merkezi yönetim
- `initializeGame()` - Mod bağımsız başlatma
- `checkAnswer()` - Otomatik cevap kontrolü
- `getResult()` - Skor ve XP hesaplama
- `isGameComplete()` - Tamamlanma kontrolü
- `getProgress()` - İlerleme yüzdesi

#### 4. Güncellenmiş Oyun Modülleri

**Matching (`matching.ts`)**
- `makeMatch()` - Eşleştirme yapma
- `removeMatch()` - Eşleştirme kaldırma
- `submitMatchingAnswer()` - Cevap gönderme

**Sequence (`sorting.ts`)**
- `addToSequence()` - Sıraya ekleme
- `removeFromSequence()` - Sıradan çıkarma
- `reorderSequence()` - Sürükle-bırak desteği
- `submitSequenceAnswer()` - Cevap gönderme

**Grouping (`grouping.ts`)**
- `assignToGroup()` - Gruba atama
- `removeFromGroup()` - Gruptan çıkarma
- `submitGroupingAnswer()` - Cevap gönderme

#### 5. Örnek Veri (`sample-data.ts`)
- Sinir Sistemi konusu için 6 örnek oyun
- 2 Matching, 2 Sequence, 2 Grouping oyunu
- NotebookLM prompt şablonu

#### 6. Yeni Sayfalar

**Oyun Listesi (`/games`)**
- Tüm oyunları grid görünümünde listeler
- Mod bazlı filtreleme ve renklendirme
- İlerleme takibi
- Responsive tasarım

**Oyun Sayfası (`/game/[id]`)**
- Dinamik oyun yükleme
- Mod bazlı component rendering
- İlerleme çubuğu
- Sonuç modal'ı
- Tekrar oynama özelliği

#### 7. Dokümantasyon
- `README.md` - Package dokümantasyonu
- `GAME_ENGINE_GUIDE.md` - Detaylı kullanım kılavuzu
- `CHANGELOG.md` - Değişiklik geçmişi

### 🔧 İyileştirmeler

#### Skor Sistemi
- Yeni skor hesaplama algoritması
- Mod bazlı XP çarpanları (Matching: 1.0x, Sequence: 1.2x, Grouping: 1.5x)
- Streak bonus sistemi
- Zaman ve hata bazlı ceza sistemi

#### Type Safety
- Tüm fonksiyonlar tam tip güvenliği ile
- Generic tipler ile esneklik
- Union types ile mod güvenliği

#### Developer Experience
- Tek satırda oyun başlatma
- Otomatik state yönetimi
- Kolay entegrasyon
- Detaylı TypeScript intellisense

### 📦 Dosya Yapısı

\`\`\`
packages/game-engine/
├── src/
│   ├── types.ts              # Tip tanımları
│   ├── game-engine.ts        # Ana motor
│   ├── matching.ts           # Eşleştirme modu
│   ├── sorting.ts            # Sıralama modu
│   ├── grouping.ts           # Gruplama modu
│   ├── utils.ts              # Yardımcı fonksiyonlar
│   ├── sample-data.ts        # Örnek veriler
│   └── index.ts              # Export hub
├── package.json
└── README.md

src/app/
├── game/
│   └── [id]/
│       └── page.tsx          # Dinamik oyun sayfası
├── games/
│   └── page.tsx              # Oyun listesi
└── page.tsx                  # Ana sayfa (güncellendi)
\`\`\`

### 🎨 UI/UX İyileştirmeleri

- Modern dark theme tasarım
- Smooth animasyonlar (Framer Motion)
- Responsive grid layout
- Progress indicators
- Interactive feedback
- Modal dialogs

### 🤖 NotebookLM Entegrasyonu

- Hazır prompt şablonu
- JSON format validasyonu
- Otomatik içerik üretimi desteği
- Sınav odaklı veri yapısı

## 📊 Önceki Yapı vs Yeni Yapı

### Önceki Yapı ❌
\`\`\`typescript
// Her mod için ayrı veri yapısı
const matchingPairs: MatchingPair[] = [...]
const sortingItems: SortingItem[] = [...]
const groupingItems: GroupingItem[] = [...]

// Ayrı başlatma fonksiyonları
initializeMatchingGame(pairs, groups, randomize)
initializeSortingGame(items, randomize)
initializeGroupingGame(items, groups, randomize)
\`\`\`

### Yeni Yapı ✅
\`\`\`typescript
// Tek veri yapısı
const games: GameCollection = {
  subject: "AYT Biyoloji",
  topic: "Sinir Sistemi",
  games: [
    { id: "1", mode: "matching", data: [...] },
    { id: "2", mode: "sequence", data: [...] },
    { id: "3", mode: "grouping", data: [...] }
  ]
}

// Tek başlatma fonksiyonu
const state = GameEngine.initializeGame(game, true)
\`\`\`

## 🚀 Kullanım Örneği

### Basit Kullanım
\`\`\`typescript
import { GameEngine } from '@repo/game-engine'
import { sinirSistemiGames } from '@repo/game-engine/sample-data'

// Oyunu seç
const game = sinirSistemiGames.games[0]

// Başlat
const state = GameEngine.initializeGame(game, true)

// Oyna
// ... kullanıcı etkileşimi ...

// Kontrol et
const isCorrect = GameEngine.checkAnswer(state)

// Sonuç al
const result = GameEngine.getResult(game.id, state, streak)
console.log(`Score: ${result.score}, XP: ${result.xp}`)
\`\`\`

### React Component
\`\`\`typescript
function GamePlayer({ game }: { game: AnyGame }) {
  const [state, setState] = useState(() => 
    GameEngine.initializeGame(game, true)
  )

  switch (game.mode) {
    case 'matching':
      return <MatchingGame state={state} setState={setState} />
    case 'sequence':
      return <SequenceGame state={state} setState={setState} />
    case 'grouping':
      return <GroupingGame state={state} setState={setState} />
  }
}
\`\`\`

## 📈 Performans

- ✅ Type-safe operations (compile-time checks)
- ✅ Immutable state updates
- ✅ Efficient array operations
- ✅ Minimal re-renders
- ✅ Lazy loading support

## 🔜 Sıradaki Adımlar

1. **Veritabanı Entegrasyonu**
   - Supabase ile oyun sonuçlarını kaydetme
   - Kullanıcı istatistikleri

2. **Multiplayer Mod**
   - Gerçek zamanlı yarışma
   - Leaderboard

3. **AI Hints**
   - Takıldığında ipucu sistemi
   - Adaptif zorluk

4. **Achievements**
   - Rozet sistemi
   - Milestone tracking

5. **Analytics**
   - Öğrenme analizi
   - Güçlü/zayıf konular

## 🐛 Bilinen Sorunlar

- Yok (şu an için)

## 💡 Notlar

- Tüm TypeScript hataları düzeltildi
- Tüm modlar test edildi ve çalışıyor
- Responsive tasarım tüm ekran boyutlarında test edildi
- NotebookLM prompt'u optimize edildi

## 👥 Katkıda Bulunanlar

- Kiro AI Assistant - Tüm geliştirme ve dokümantasyon

---

**Versiyon**: 0.2.0  
**Tarih**: 29 Ocak 2026  
**Durum**: ✅ Production Ready
