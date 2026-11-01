# PWA Kurulum Sistemi (2025-2026)

## 🚀 Yeni Web Install API

Uygulama artık **2025-2026 Web Install API** kullanıyor!

### Nasıl Çalışır?

1. **YENİ API** (`navigator.install()`) - Deneysel
   - Chrome/Edge'de flag ile aktif
   - Tek tıkla direkt kurulum
   - Prompt yok, direkt yükleme

2. **ESKİ API** (`beforeinstallprompt`) - Fallback
   - HTTPS'te otomatik çalışır
   - Tarayıcı prompt'u gösterir

3. **Manuel Talimatlar** - Son çare
   - iOS: Safari paylaş menüsü
   - Android: Tarayıcı menüsü
   - Windows: Adres çubuğu simgesi

## 🔧 Web Install API'yi Aktif Etme

### Chrome/Edge (Windows/Mac)

1. Tarayıcıda `chrome://flags` veya `edge://flags` aç
2. Ara: **"Web App Installation API"**
3. **Enabled** yap
4. Tarayıcıyı yeniden başlat

### Sonuç

Artık "Uygulamayı İndir" butonuna tıklayınca:
- ✅ Direkt kurulum başlar
- ✅ Prompt yok
- ✅ Tek tıkla yükleme

## 📱 Platform Desteği

| Platform | API | Durum |
|----------|-----|-------|
| Chrome (Windows/Mac) | `navigator.install()` | ✅ Flag ile |
| Edge (Windows/Mac) | `navigator.install()` | ✅ Flag ile |
| Chrome (Android) | `beforeinstallprompt` | ✅ Otomatik |
| Safari (iOS) | Manuel | ⚠️ Paylaş menüsü |
| Firefox | Manuel | ⚠️ Tarayıcı menüsü |

## 🎯 Kullanıcı Deneyimi

### HTTPS'te (Production)
1. Butona tıkla
2. Otomatik kurulum başlar
3. Uygulama yüklenir

### Localhost'ta (Development)
1. Butona tıkla
2. Platform bazlı talimat gösterilir
3. Kullanıcı manuel adımları takip eder

## 📚 Kaynaklar

- [Web Install API - Progressier](https://progressier.com/pwa-capabilities/web-install-api)
- [What PWA Can Do Today](https://whatpwacando.today/installation)
- [MDN - Making PWAs Installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)

## 🔮 Gelecek

Web Install API henüz deneysel ama:
- Chrome/Edge'de flag ile kullanılabilir
- Yakında tüm tarayıcılarda standart olacak
- PWA kurulumu native app kadar kolay olacak

---

**Not**: Localhost'ta `beforeinstallprompt` çalışmaz (HTTPS gerekir). Bu yüzden development'ta manuel talimatlar gösterilir. Production'da (HTTPS) otomatik çalışacak!
