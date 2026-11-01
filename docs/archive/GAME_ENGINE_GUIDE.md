# 🎮 Oyun Motoru - Kullanım Kılavuzu

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Master JSON Yapısı](#master-json-yapısı)
3. [Oyun Modları](#oyun-modları)
4. [Kurulum ve Kullanım](#kurulum-ve-kullanım)
5. [NotebookLM ile İçerik Üretimi](#notebooklm-ile-içerik-üretimi)
6. [React Component Örnekleri](#react-component-örnekleri)
7. [Skor Sistemi](#skor-sistemi)

---

## 🎯 Genel Bakış

Bu oyun motoru, eğitim içeriklerini oyunlaştırmak için tasarlanmış birleşik bir sistemdir. Tek bir JSON yapısı ile 3 farklı oyun modunu destekler:

- **Matching (Eşleştirme)**: Terim-açıklama eşleştirme
- **Sequence (Sıralama)**: Adımları doğru sıraya dizme
- **Grouping (Gruplama)**: Öğeleri kategorilere ayırma

### ✨ Özellikler

- ✅ Tek JSON yapısı - tüm modlar aynı formatta
- ✅ Type-safe TypeScript desteği
- ✅ Otomatik mod algılama ve yönlendirme
- ✅ Hata, süre ve streak bazlı puanlama
- ✅ NotebookLM ile AI destekli içerik üretimi
- ✅ React/Next.js ile kolay entegrasyon

---

## 📦 Master JSON Yapısı

Tüm oyunlar tek bir koleksiyon içinde tutulur:

\`\`\`json
{
  "subject": "AYT Biyoloji",
  "unit": "Sistemler",
  "topic": "Sinir Sistemi",
  "games": [
    {
      "id": "game_001",
      "title": "Nöron Yapısı",
      "mode": "matching",
      "data": [...]
    },
    {
      "id": "game_002",
      "title": "Refleks Yayı",
      "mode": "sequence",
      "data": [...]
    }
  ]
}
\`\`\`

### Alanlar

- **subject**: Ders adı (örn: "AYT Biyoloji")
- **unit**: Ünite adı (opsiyonel)
- **topic**: Konu başlığı
- **games**: Oyun dizisi

---

## 🎮 Oyun Modları

### 1. Matching (Eşleştirme)

Terimleri açıklamalarıyla eşleştirme oyunu.

**Data Formatı:**
\`\`\`json
{
  "id": "game_001",
  "title": "Nöron Yapısı",
  "mode": "matching",
  "data": [
    { "key": "Dendrit", "value": "Uyarıyı alan kısa uzantılar" },
    { "key": "Akson", "value": "Uyarıyı ileten uzun uzantı" }
  ]
}
\`\`\`

**Kullanım Senaryoları:**
- Terim-tanım eşleştirme
- Formül-açıklama eşleştirme
- Tarih-olay eşleştirme
- Yazar-eser eşleştirme

---

### 2. Sequence (Sıralama)

Öğeleri doğru sıraya dizme oyunu.

**Data Formatı:**
\`\`\`json
{
  "id": "game_002",
  "title": "Refleks Yayı",
  "mode": "sequence",
  "data": [
    "Reseptör",
    "Duyu Nöronu",
    "Ara Nöron",
    "Motor Nöron",
    "Efektör"
  ]
}
\`\`\`

**Kullanım Senaryoları:**
- Süreç adımları (biyolojik süreçler, kimyasal reaksiyonlar)
- Tarihsel olaylar kronolojisi
- Algoritma adımları
- Gelişim evreleri

---

### 3. Grouping (Gruplama)

Öğeleri kategorilere ayırma oyunu.

**Data Formatı:**
\`\`\`json
{
  "id": "game_003",
  "title": "Beyin Bölümleri",
  "mode": "grouping",
  "data": [
    { "item": "Serebrum", "category": "Ön Beyin" },
    { "item": "Beyincik", "category": "Arka Beyin" },
    { "item": "Pons", "category": "Arka Beyin" }
  ]
}
\`\`\`

**Kullanım Senaryoları:**
- Sınıflandırma (canlı türleri, element grupları)
- Karşılaştırma (sempatik vs parasempatik)
- Kategorizasyon (edebi akımlar, sanat dönemleri)

---

## 🚀 Kurulum ve Kullanım

### 1. Oyun Verisi Hazırlama

\`\`\`typescript
import { GameCollection } from '@repo/game-engine'

const myGames: GameCollection = {
  subject: "AYT Biyoloji",
  topic: "Sinir Sistemi",
  games: [
    // Oyunlarınızı buraya ekleyin
  ]
}
\`\`\`

### 2. Oyun Motoru Kullanımı

\`\`\`typescript
import { GameEngine } from '@repo/game-engine'

// Oyunu başlat
const game = myGames.games[0]
const state = GameEngine.initializeGame(game, true) // randomize=true

// İlerlemeyi kontrol et
const progress = GameEngine.getProgress(state) // 0-100

// Tamamlanma durumu
const isComplete = GameEngine.isGameComplete(state)

// Cevabı kontrol et
const isCorrect = GameEngine.checkAnswer(state)

// Sonucu al
const result = GameEngine.getResult(game.id, state, streak)
// { gameId, mode, isCorrect, mistakes, timeSpent, score, xp }
\`\`\`

### 3. React Component

\`\`\`typescript
'use client'

import { useState } from 'react'
import { GameEngine, AnyGame, GameState } from '@repo/game-engine'

export function GamePlayer({ game }: { game: AnyGame }) {
  const [state, setState] = useState<GameState>(() => 
    GameEngine.initializeGame(game, true)
  )

  // Mode'a göre component render et
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

---

## 🤖 NotebookLM ile İçerik Üretimi

### Adım 1: Kaynakları Yükle

NotebookLM'e şu kaynakları yükle:
- MEB ders kitapları (PDF)
- Ders notları
- Soru bankaları
- Özet dokümanlar

### Adım 2: Prompt Kullan

\`\`\`
Yüklediğim dokümanları analiz et. [Sinir Sistemi] konusuyla ilgili; 
en az 2 'matching', 2 'sequence' ve 2 'grouping' oyunu oluştur. 

Çıktıyı tam olarak şu JSON yapısında ver:

{
  "subject": "AYT Biyoloji",
  "unit": "Sistemler",
  "topic": "Sinir Sistemi",
  "games": [
    {
      "id": "game_001",
      "title": "Oyun Başlığı",
      "mode": "matching | sequence | grouping",
      "data": [Mode'a uygun data yapısı]
    }
  ]
}

KURALLAR:
- Hiçbir açıklama metni ekleme, sadece JSON kodunu ver
- Veriler sınav odaklı ve ezberlenmesi kritik bilgiler olsun
- matching mode için: [{ "key": "Terim", "value": "Açıklama" }]
- sequence mode için: ["Adım 1", "Adım 2", "Adım 3"]
- grouping mode için: [{ "item": "Öğe", "category": "Kategori" }]
- Her oyun en az 4, en fazla 8 öğe içersin
- ID'ler benzersiz olsun (game_001, game_002, ...)
\`\`\`

### Adım 3: JSON'u İçe Aktar

\`\`\`typescript
// src/data/sinir-sistemi.ts
export const sinirSistemiGames = {
  // NotebookLM'den gelen JSON'u buraya yapıştır
}
\`\`\`

---

## 🎨 React Component Örnekleri

### Matching Game

\`\`\`typescript
import { makeMatch, removeMatch } from '@repo/game-engine'

function MatchingGame({ state, setState }) {
  const handleMatch = (keyId: string, valueId: string) => {
    setState(makeMatch(state, keyId, valueId))
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Sol taraf: Keys */}
      <div>
        {state.pairs.map(pair => (
          <button key={pair.id} onClick={() => handleMatch(pair.id, selectedValue)}>
            {pair.key}
          </button>
        ))}
      </div>
      
      {/* Sağ taraf: Values */}
      <div>
        {state.pairs.map(pair => (
          <button key={pair.id}>
            {pair.value}
          </button>
        ))}
      </div>
    </div>
  )
}
\`\`\`

### Sequence Game (Sürükle-Bırak)

\`\`\`typescript
import { addToSequence, reorderSequence } from '@repo/game-engine'
import { DndContext } from '@dnd-kit/core'

function SequenceGame({ state, setState }) {
  const handleDragEnd = (event) => {
    const { active, over } = event
    const oldIndex = state.userOrder.indexOf(active.id)
    const newIndex = state.userOrder.indexOf(over.id)
    setState(reorderSequence(state, oldIndex, newIndex))
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {state.userOrder.map(itemId => {
        const item = state.items.find(i => i.id === itemId)
        return <SortableItem key={itemId} text={item.text} />
      })}
    </DndContext>
  )
}
\`\`\`

### Grouping Game

\`\`\`typescript
import { assignToGroup, removeFromGroup } from '@repo/game-engine'

function GroupingGame({ state, setState }) {
  return (
    <div>
      {/* Kategoriler */}
      {state.categories.map(category => (
        <div key={category}>
          <h3>{category}</h3>
          {state.items
            .filter(item => state.userAssignments[item.id] === category)
            .map(item => (
              <div key={item.id}>{item.text}</div>
            ))}
        </div>
      ))}
      
      {/* Atanmamış öğeler */}
      {state.items
        .filter(item => !state.userAssignments[item.id])
        .map(item => (
          <div key={item.id}>
            {item.text}
            {state.categories.map(cat => (
              <button onClick={() => setState(assignToGroup(state, item.id, cat))}>
                {cat}
              </button>
            ))}
          </div>
        ))}
    </div>
  )
}
\`\`\`

---

## 🏆 Skor Sistemi

### Puan Hesaplama

\`\`\`typescript
Score = 100 - (mistakes × 10) - (timeSpent / 1000)
\`\`\`

- Başlangıç puanı: 100
- Her hata: -10 puan
- Her saniye: -1 puan (max 30 saniye cezası)

### XP Hesaplama

\`\`\`typescript
XP = Score × ModeMultiplier + (Streak × 5)
\`\`\`

**Mode Multipliers:**
- Matching: 1.0x
- Sequence: 1.2x
- Grouping: 1.5x

**Örnek:**
- Score: 85
- Mode: Grouping (1.5x)
- Streak: 5 gün
- XP = 85 × 1.5 + (5 × 5) = 127.5 + 25 = **152 XP**

---

## 📚 API Referansı

### GameEngine

| Method | Açıklama | Parametreler | Dönüş |
|--------|----------|--------------|-------|
| `initializeGame()` | Oyunu başlatır | game, randomize | GameState |
| `checkAnswer()` | Cevabı kontrol eder | state | boolean |
| `getResult()` | Sonucu hesaplar | gameId, state, streak | GameResult |
| `isGameComplete()` | Tamamlanma durumu | state | boolean |
| `getProgress()` | İlerleme yüzdesi | state | number (0-100) |

### Matching Functions

- `makeMatch(state, keyId, valueId)` - Eşleştirme yapar
- `removeMatch(state, keyId)` - Eşleştirmeyi kaldırır
- `submitMatchingAnswer(state)` - Cevabı gönderir

### Sequence Functions

- `addToSequence(state, itemId)` - Sıraya ekler
- `removeFromSequence(state, itemId)` - Sıradan çıkarır
- `reorderSequence(state, fromIndex, toIndex)` - Sırayı değiştirir
- `submitSequenceAnswer(state)` - Cevabı gönderir

### Grouping Functions

- `assignToGroup(state, itemId, category)` - Gruba atar
- `removeFromGroup(state, itemId)` - Gruptan çıkarır
- `submitGroupingAnswer(state)` - Cevabı gönderir

---

## 🎯 Sıradaki Adımlar

1. **Veritabanı Entegrasyonu**: Oyun sonuçlarını Supabase'e kaydet
2. **Leaderboard**: Kullanıcı sıralaması ve karşılaştırma
3. **Achievements**: Başarı rozetleri sistemi
4. **Multiplayer**: Arkadaşlarla yarışma modu
5. **AI Hints**: Takıldığında ipucu sistemi

---

## 📞 Destek

Sorularınız için:
- GitHub Issues
- Discord Community
- Email: support@learngame.com

---

**Hazırlayan**: Kiro AI Assistant  
**Tarih**: 29 Ocak 2026  
**Versiyon**: 0.2.0
