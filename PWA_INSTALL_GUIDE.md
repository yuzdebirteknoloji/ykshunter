# 📱 PWA Kurulum Rehberi

## 🎯 Neden Yüklemeliyim?

Uygulamayı cihazınıza yüklediğinizde:
- ⚡ Daha hızlı açılır
- 📱 Uygulama gibi çalışır (tam ekran)
- 🔌 Çevrimdışı kullanabilirsiniz
- 🚀 Daha iyi performans
- 🎨 Ana ekrandan direkt erişim

## 🖥️ Masaüstü Kurulum

### Chrome / Edge / Brave

#### Yöntem 1: Otomatik İstem (Production'da)
1. Siteyi açın
2. Sağ altta çıkan "Yükle" butonuna tıklayın
3. Açılan pencerede "Yükle" butonuna basın
4. Uygulama masaüstünüze eklenir

#### Yöntem 2: Manuel Kurulum
1. Siteyi açın
2. Adres çubuğunun **sağındaki** simgelere bakın:
   - 💻 veya ⊕ simgesini görüyorsanız tıklayın
   - "Yükle" veya "Install" seçeneğini seçin
3. Açılan pencerede "Yükle" butonuna basın

#### Yöntem 3: Menüden
1. Sağ üst köşedeki ⋮ (üç nokta) menüsüne tıklayın
2. "Uygulamayı yükle" veya "Install Learn Game" seçeneğini seçin
3. "Yükle" butonuna basın

#### Yöntem 4: Ayarlar Sayfası
1. Sol menüden "Ayarlar" sayfasına gidin
2. "Masaüstüne Yükle" butonuna tıklayın
3. Açılan pencerede "Yükle" butonuna basın

### Firefox

1. Adres çubuğunun sağındaki ⋮ (üç nokta) menüsüne tıklayın
2. "Siteyi Yükle" veya "Install Site" seçeneğini seçin
3. "Yükle" butonuna basın

### Safari (macOS)

1. Menü çubuğundan **Dosya** → **Ana Ekrana Ekle** seçin
2. İsim girin (varsayılan: Learn Game)
3. "Ekle" butonuna basın

## 📱 Mobil Kurulum

### Android (Chrome / Edge / Samsung Internet)

#### Yöntem 1: Otomatik İstem
1. Siteyi açın
2. Altta çıkan "Ana ekrana ekle" bildirimini görün
3. "Ekle" butonuna tıklayın
4. Açılan pencerede tekrar "Ekle" butonuna basın
5. Uygulama ana ekranınıza eklenir

#### Yöntem 2: Manuel
1. Sağ üst köşedeki ⋮ (üç nokta) menüsüne tıklayın
2. "Ana ekrana ekle" veya "Uygulamayı yükle" seçeneğini seçin
3. "Ekle" butonuna basın

#### Yöntem 3: Ayarlar Sayfası
1. Sol menüden "Ayarlar" sayfasına gidin
2. "Masaüstüne Yükle" butonuna tıklayın
3. Açılan pencerede "Ekle" butonuna basın

### iOS (Safari)

**ÖNEMLİ**: iOS'ta sadece Safari tarayıcısı PWA kurulumunu destekler!

1. Safari'de siteyi açın
2. Alttaki **paylaş** butonuna (⬆️) basın
3. Aşağı kaydırın ve **"Ana Ekrana Ekle"** seçeneğini bulun
4. Seçeneğe tıklayın
5. İsim girin (varsayılan: Learn Game)
6. Sağ üstteki **"Ekle"** butonuna basın
7. Uygulama ana ekranınıza eklenir

**Not**: Chrome veya başka tarayıcılar iOS'ta PWA kurulumunu desteklemez. Safari kullanmalısınız.

## 🔍 Kurulum Kontrolü

### Başarılı Kurulum Nasıl Anlaşılır?

#### Masaüstü
- ✅ Masaüstünüzde "Learn Game" ikonu görünür
- ✅ Başlat menüsünde uygulama listelenir
- ✅ Uygulama kendi penceresinde açılır (tarayıcı çubuğu yok)

#### Mobil
- ✅ Ana ekranda "Learn Game" ikonu görünür
- ✅ Tam ekran açılır (adres çubuğu yok)
- ✅ Uygulama geçişlerinde görünür

## 🛠️ Sorun Giderme

### "Yükle" Butonu Görünmüyor

**Neden?**
- Development modunda çalışıyorsunuz (PWA sadece production'da aktif)
- Tarayıcınız PWA'yı desteklemiyor
- Uygulama zaten yüklü

**Çözüm:**
1. Production build alın:
   ```bash
   npm run build
   npm start
   ```
2. Veya Vercel'e deploy edin
3. HTTPS üzerinden erişin (localhost hariç)

### iOS'ta Kurulum Çalışmıyor

**Kontrol Edin:**
- ✅ Safari kullanıyor musunuz? (Chrome/Firefox desteklemez)
- ✅ Paylaş butonunu (⬆️) buldunuz mu?
- ✅ "Ana Ekrana Ekle" seçeneğini gördünüz mü?

### Uygulama Açılmıyor

**Çözüm:**
1. Uygulamayı silin
2. Tarayıcı cache'ini temizleyin
3. Tekrar yükleyin

### Eski Sürüm Açılıyor

**Çözüm:**
1. Ayarlar sayfasından "Önbelleği Temizle"
2. Veya uygulamayı silip tekrar yükleyin

## 📊 Kurulum Sonrası

### Ayarlar Sayfası
`/settings` sayfasından:
- Kurulum durumunu kontrol edin
- Önbellek boyutunu görün
- Cache'i temizleyin
- Güncellemeleri kontrol edin

### Güncelleme
Yeni sürüm çıktığında:
1. Uygulama otomatik bildirim gösterir
2. "Güncelle" butonuna tıklayın
3. Sayfa yenilenir ve yeni sürüm yüklenir

### Kaldırma

#### Masaüstü
- **Windows**: Başlat → Learn Game → Sağ tık → Kaldır
- **macOS**: Applications → Learn Game → Çöp Kutusu
- **Linux**: Uygulama menüsü → Sağ tık → Kaldır

#### Mobil
- **Android**: Ana ekran → Learn Game → Uzun bas → Kaldır
- **iOS**: Ana ekran → Learn Game → Uzun bas → Uygulamayı Sil

## 💡 İpuçları

### Performans
- İlk açılış biraz yavaş olabilir (cache dolduruluyor)
- Sonraki açılışlar çok hızlı olacak
- Çevrimdışı kullanım için önce online açın (cache dolsun)

### Güncelleme
- Uygulama otomatik güncelleme kontrolü yapar
- Bildirim geldiğinde güncelleyin
- Veya ayarlar sayfasından manuel kontrol edin

### Depolama
- Uygulama ~10-50 MB yer kaplar
- Cache temizleyerek yer açabilirsiniz
- Ayarlar sayfasından boyutu görebilirsiniz

## 🎯 Önerilen Kullanım

1. **İlk Kurulum**
   - Production'da açın (Vercel URL)
   - Kurulum istemini kabul edin
   - Veya ayarlar sayfasından yükleyin

2. **Günlük Kullanım**
   - Ana ekrandan direkt açın
   - Tarayıcı açmaya gerek yok
   - Daha hızlı ve akıcı deneyim

3. **Çevrimdışı**
   - İnternet olmadan da çalışır
   - Temel özellikler kullanılabilir
   - Senkronizasyon online olunca yapılır

## 📞 Destek

Sorun yaşıyorsanız:
1. Bu rehberi tekrar okuyun
2. Tarayıcı cache'ini temizleyin
3. Uygulamayı silip tekrar yükleyin
4. GitHub'da issue açın

---

**Not**: PWA özellikleri sadece HTTPS üzerinden çalışır. Localhost'ta test ederken `npm run build && npm start` kullanın.
