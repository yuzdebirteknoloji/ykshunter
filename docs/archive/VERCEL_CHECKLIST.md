# ✅ Vercel Deployment Checklist

## Pre-Deployment

### 1. Code Quality
- [ ] `npm run build` başarılı
- [ ] TypeScript hataları yok
- [ ] Console.log'lar temizlendi (production'da)
- [ ] Unused imports temizlendi
- [ ] Git'te uncommitted değişiklik yok

### 2. Environment Variables
- [ ] `.env.example` güncel
- [ ] Local `.env.local` çalışıyor
- [ ] Supabase URL ve Key hazır
- [ ] Production environment variables listesi hazır

### 3. Database
- [ ] Supabase projesi oluşturuldu
- [ ] `supabase-schema.sql` çalıştırıldı
- [ ] RLS policies aktif
- [ ] Test verisi eklendi (opsiyonel)

### 4. Git Repository
- [ ] GitHub/GitLab repository oluşturuldu
- [ ] `.gitignore` doğru yapılandırıldı
- [ ] Tüm dosyalar commit edildi
- [ ] `main` branch'e push edildi

## Deployment

### 5. Vercel Setup
- [ ] Vercel hesabı oluşturuldu
- [ ] GitHub/GitLab bağlandı
- [ ] "New Project" oluşturuldu
- [ ] Repository seçildi
- [ ] Framework: Next.js (otomatik algılandı)
- [ ] Root Directory: `.` (default)

### 6. Environment Variables (Vercel)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` eklendi
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` eklendi
- [ ] Tüm environment'lar için eklendi:
  - [ ] Production
  - [ ] Preview
  - [ ] Development

### 7. Build & Deploy
- [ ] İlk deploy başlatıldı
- [ ] Build başarılı (yeşil ✓)
- [ ] Deployment URL'i alındı
- [ ] Production URL'e atandı

## Post-Deployment

### 8. Functionality Test
- [ ] Ana sayfa açılıyor
- [ ] Login/Register çalışıyor
- [ ] Admin paneline giriş yapılabiliyor
- [ ] Ders eklenebiliyor
- [ ] Konu eklenebiliyor
- [ ] Soru seti eklenebiliyor
- [ ] Oyunlar çalışıyor:
  - [ ] Eşleştirme
  - [ ] Sıralama
  - [ ] Gruplama
- [ ] Tema değiştirme çalışıyor
- [ ] Logout çalışıyor

### 9. Mobile Test
- [ ] Mobil tarayıcıda açılıyor
- [ ] Sidebar mobilde çalışıyor
- [ ] Oyunlar mobilde oynanabiliyor
- [ ] Touch interactions çalışıyor
- [ ] Responsive design doğru

### 10. PWA Test
- [ ] "Ana ekrana ekle" seçeneği görünüyor
- [ ] Manifest.json yükleniyor
- [ ] Service Worker kayıtlı
- [ ] Offline çalışma test edildi
- [ ] App icon'lar doğru

### 11. Performance
- [ ] Lighthouse score kontrol edildi
- [ ] Page load < 3s
- [ ] Images optimize
- [ ] No console errors
- [ ] No 404 errors

### 12. Security
- [ ] HTTPS aktif (Vercel otomatik)
- [ ] Environment variables güvenli
- [ ] RLS policies test edildi
- [ ] Auth flow güvenli
- [ ] No sensitive data exposed

## Optional

### 13. Custom Domain (Opsiyonel)
- [ ] Domain satın alındı
- [ ] Vercel'de domain eklendi
- [ ] DNS kayıtları güncellendi
- [ ] SSL sertifikası aktif
- [ ] www redirect ayarlandı

### 14. Analytics (Opsiyonel)
- [ ] Vercel Analytics aktif
- [ ] Google Analytics eklendi (opsiyonel)
- [ ] Error tracking ayarlandı

### 15. Monitoring
- [ ] Vercel Dashboard bookmark'landı
- [ ] Deployment notifications ayarlandı
- [ ] Error alerts ayarlandı

## Troubleshooting

### Build Fails
```bash
# Local'de test et
npm run build

# Logs'u kontrol et
vercel logs

# Environment variables'ı kontrol et
vercel env ls
```

### Runtime Errors
```bash
# Production logs
vercel logs --follow

# Specific deployment
vercel logs [deployment-url]
```

### Database Connection Issues
- Supabase URL doğru mu?
- Anon key doğru mu?
- RLS policies doğru mu?
- Network erişimi var mı?

## Success Criteria

✅ Build başarılı
✅ Deployment yeşil
✅ Production URL çalışıyor
✅ Tüm features çalışıyor
✅ Mobile responsive
✅ PWA çalışıyor
✅ No critical errors

## Next Steps

1. İlk admin kullanıcısını oluştur
2. Test verisi ekle
3. Kullanıcıları davet et
4. Feedback topla
5. İyileştirmeler yap

---

**🎉 Deployment tamamlandı! Artık canlıdasınız!**

Production URL: `https://your-app.vercel.app`
