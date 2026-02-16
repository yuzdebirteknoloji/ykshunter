# 🧪 Test Rehberi

## 🎯 Test Edilecek Özellikler

### 1. ⚡ Hızlı Yükleme Testi

#### A) İlk Yükleme
```bash
# Tarayıcıyı aç ve Network sekmesini aç
1. http://localhost:3000/games adresine git
2. Network sekmesinde yükleme süresini kontrol et
3. Beklenen: <1 saniye

# Cache'i temizle ve tekrar test et
4. Hard refresh (Ctrl+Shift+R veya Cmd+Shift+R)
5. Yükleme süresini karşılaştır
```

#### B) Sayfa Geçişleri
```bash
1. Ana Sayfa → Oyunlar → Dashboard → Oyunlar
2. Her geçişte süreyi ölç
3. Beklenen: <300ms (cache sayesinde)
```

#### C) Cache Testi
```bash
# Browser Console'da
1. F12 → Console
2. Bir dersi seç (örn: TYT Kimya)
3. Başka bir dersi seç (örn: AYT Biyoloji)
4. Tekrar TYT Kimya'ya dön
5. Beklenen: Anında yükleme (cache'den)
```

### 2. 📝 Konu Ekleme Testi

#### A) Oyunlar Sayfasından
```bash
Test 1: Normal Ekleme
1. /games sayfasına git
2. Bir ders seç
3. "Yeni Konu" butonuna tıkla
4. "Test Konusu 1" yaz
5. "Konu Ekle" butonuna tıkla
6. ✅ Toast mesajı görünmeli
7. ✅ Konu listede görünmeli

Test 2: Enter ile Kaydetme
1. "Yeni Konu" butonuna tıkla
2. "Test Konusu 2" yaz
3. Enter tuşuna bas
4. ✅ Konu eklenmeli

Test 3: Escape ile İptal
1. "Yeni Konu" butonuna tıkla
2. "Test Konusu 3" yaz
3. Escape tuşuna bas
4. ✅ Form kapanmalı
5. ✅ Konu eklenmemeli

Test 4: Boş İsim Kontrolü
1. "Yeni Konu" butonuna tıkla
2. Hiçbir şey yazmadan "Konu Ekle"ye tıkla
3. ✅ Hata mesajı görünmeli
4. ✅ Konu eklenmemeli
```

#### B) Admin Panelinden
```bash
Test 1: Normal Ekleme
1. /dashboard sayfasına git
2. "İçerik Yönetimi" sekmesine tıkla
3. Bir dersi genişlet
4. "Yeni Konu Ekle" butonuna tıkla
5. "Admin Test Konusu" yaz
6. "Ekle" butonuna tıkla
7. ✅ Konu eklenmeli
8. ✅ Listede görünmeli

Test 2: Çoklu Ekleme
1. Aynı derse 3 farklı konu ekle
2. ✅ Hepsi görünmeli
3. ✅ Sıralama doğru olmalı (en yeni üstte)
```

### 3. 🔄 Cache Invalidation Testi

```bash
Test 1: Konu Ekleme Sonrası
1. /games sayfasında bir konu ekle
2. /dashboard → İçerik Yönetimi'ne git
3. ✅ Yeni konu orada da görünmeli

Test 2: Admin'den Ekleme Sonrası
1. Admin panelden bir konu ekle
2. /games sayfasına git
3. ✅ Yeni konu orada da görünmeli

Test 3: Silme Sonrası
1. Admin panelden bir konu sil
2. /games sayfasına git
3. ✅ Silinen konu görünmemeli
```

### 4. 📱 Mobil Test

```bash
Test 1: Responsive Design
1. Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
2. iPhone 12 Pro seç
3. /games sayfasına git
4. ✅ Butonlar dokunulabilir boyutta
5. ✅ Form tam genişlikte
6. ✅ Scroll sorunsuz

Test 2: Mobil Konu Ekleme
1. Mobil görünümde "Yeni Konu" butonuna dokun
2. Ekran klavyesi açılmalı
3. Konu adı yaz
4. "Konu Ekle" butonuna dokun
5. ✅ Konu eklenmeli
6. ✅ Form kapanmalı
```

### 5. 🎨 Animasyon Testi

```bash
Test 1: Form Animasyonları
1. "Yeni Konu" butonuna tıkla
2. ✅ Form yumuşak açılmalı (fade + slide)
3. Escape'e bas
4. ✅ Form yumuşak kapanmalı

Test 2: Loading States
1. Yavaş internet simüle et (DevTools → Network → Slow 3G)
2. Bir ders seç
3. ✅ Skeleton loader görünmeli
4. ✅ Veriler yüklenince smooth geçiş olmalı
```

### 6. ⚠️ Error Handling Testi

```bash
Test 1: Network Hatası
1. DevTools → Network → Offline
2. Bir konu eklemeyi dene
3. ✅ Hata mesajı görünmeli
4. ✅ Form açık kalmalı (veri kaybı olmamalı)

Test 2: Validation Hatası
1. Çok uzun bir konu adı gir (>100 karakter)
2. ✅ Uygun hata mesajı görünmeli

Test 3: Duplicate Kontrolü
1. Aynı isimde iki konu eklemeyi dene
2. ✅ İkinci ekleme başarılı olmalı (duplicate izin verilir)
```

### 7. 🔍 Prefetch Testi

```bash
Test 1: Hover Prefetch
1. Network sekmesini aç
2. Bir ders butonunun üzerine gel (tıklama!)
3. ✅ Network'te topics isteği görünmeli
4. Derse tıkla
5. ✅ Anında yüklenmeli (cache'den)

Test 2: Auto Prefetch
1. Sayfayı yenile
2. Network sekmesini izle
3. ✅ İlk 3-4 ders için otomatik prefetch olmalı
```

## 🎯 Performans Benchmarks

### Lighthouse Testi
```bash
1. Chrome DevTools → Lighthouse
2. "Generate report" tıkla
3. Beklenen skorlar:
   - Performance: 90+
   - Accessibility: 100
   - Best Practices: 100
   - SEO: 100
```

### Bundle Size Kontrolü
```bash
npm run build

# Çıktıda kontrol et:
- First Load JS: <200KB
- Total Size: <500KB
```

### Cache Hit Rate
```bash
# Browser Console'da
1. 10 farklı sayfa geçişi yap
2. Network sekmesinde "from disk cache" sayısını say
3. Beklenen: %70+ cache hit rate
```

## ✅ Test Checklist

### Fonksiyonel Testler
- [ ] Konu ekleme (Games sayfası)
- [ ] Konu ekleme (Admin panel)
- [ ] Enter ile kaydetme
- [ ] Escape ile iptal
- [ ] Boş isim validasyonu
- [ ] Cache invalidation
- [ ] Mobil responsive
- [ ] Animasyonlar

### Performans Testler
- [ ] İlk yükleme <1s
- [ ] Sayfa geçişi <300ms
- [ ] Cache hit <50ms
- [ ] Prefetch çalışıyor
- [ ] Bundle size <200KB
- [ ] Lighthouse 90+

### UX Testler
- [ ] Loading states
- [ ] Error messages
- [ ] Success toasts
- [ ] Keyboard shortcuts
- [ ] Smooth animations
- [ ] Mobile friendly

### Edge Cases
- [ ] Offline mode
- [ ] Slow network
- [ ] Çok uzun isimler
- [ ] Özel karakterler
- [ ] Concurrent edits

## 🐛 Bilinen Sorunlar

### Potansiyel Sorunlar
1. **Çok hızlı ekleme**: Arka arkaya çok hızlı konu eklenirse cache race condition olabilir
   - Çözüm: Debounce veya loading state
   
2. **Offline mode**: Offline'ken eklenen konular kaybolabilir
   - Çözüm: Service Worker + IndexedDB (gelecek)

3. **Concurrent edits**: İki kullanıcı aynı anda eklerse conflict olabilir
   - Çözüm: Optimistic locking (gelecek)

## 📊 Test Sonuçları Şablonu

```markdown
## Test Sonuçları - [Tarih]

### Performans
- İlk yükleme: ___ms
- Sayfa geçişi: ___ms
- Cache hit: ___ms
- Lighthouse: ___/100

### Fonksiyonellik
- Konu ekleme: ✅/❌
- Cache invalidation: ✅/❌
- Mobil: ✅/❌
- Animasyonlar: ✅/❌

### Notlar
- [Bulunan sorunlar]
- [İyileştirme önerileri]
```

## 🚀 Sonraki Adımlar

Test sonuçlarına göre:
1. Performans sorunları varsa → Profiling yap
2. UX sorunları varsa → Kullanıcı feedback al
3. Bug varsa → Issue aç ve fix et
4. Her şey OK ise → Production'a deploy et!

---

**Happy Testing! 🎉**
