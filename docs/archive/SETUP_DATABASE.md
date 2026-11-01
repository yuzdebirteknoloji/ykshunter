# 🗄️ Veritabanı Kurulumu

## ⚠️ ÖNEMLİ: İlk Kurulum

Veritabanı henüz kurulmadı! Şu adımları takip et:

## 1️⃣ Supabase'e Git

```
https://supabase.com/dashboard
```

Projen: `obqvgbqvcpisupeyywrb`

## 2️⃣ SQL Editor'ü Aç

Sol menüden **SQL Editor** seç

## 3️⃣ Schema'yı Çalıştır

`supabase-schema.sql` dosyasının içeriğini kopyala ve SQL Editor'de çalıştır.

**Veya** şu komutu çalıştır:

```sql
-- Tüm tabloları oluştur
-- supabase-schema.sql dosyasındaki tüm SQL'i buraya yapıştır
```

## 4️⃣ Test Kullanıcıları Oluşturulacak

Schema çalıştırıldığında otomatik olarak 3 test kullanıcısı oluşturulur:

```
Username: ahmet
Password: test123
XP: 250, Level: 3

Username: ayse
Password: test123
XP: 180, Level: 2

Username: mehmet
Password: test123
XP: 420, Level: 5
```

## 🚀 Alternatif: Kayıt Ol

Eğer veritabanını kurmak istemiyorsan:

1. `/login` sayfasına git
2. "Kayıt ol" seçeneğine tıkla
3. Yeni kullanıcı oluştur
4. Giriş yap!

## ✅ Kontrol Et

Veritabanının kurulu olup olmadığını kontrol etmek için:

```sql
-- Supabase SQL Editor'de çalıştır
SELECT * FROM users;
```

Eğer tablo yoksa hata verir. O zaman schema'yı çalıştırman gerekiyor.

## 📝 Schema Dosyası

`supabase-schema.sql` dosyasında:
- ✅ users tablosu
- ✅ game_results tablosu
- ✅ user_topic_stats tablosu
- ✅ daily_activity tablosu
- ✅ Trigger'lar (otomatik XP güncelleme)
- ✅ View'lar (leaderboard, stats)
- ✅ Test kullanıcıları

## 🔧 Sorun Giderme

### "Kullanıcı adı veya şifre hatalı" Hatası

**Sebep**: Veritabanında kullanıcı yok

**Çözüm 1**: Schema'yı çalıştır (yukarıdaki adımlar)

**Çözüm 2**: Kayıt ol ile yeni kullanıcı oluştur

### "Table doesn't exist" Hatası

**Sebep**: Schema çalıştırılmamış

**Çözüm**: Supabase SQL Editor'de `supabase-schema.sql`'i çalıştır

---

**Not**: Schema'yı bir kez çalıştırdıktan sonra tüm sistem çalışacak!
