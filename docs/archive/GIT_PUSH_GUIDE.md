# 🔐 Git Push Sorunu Çözümü

## Sorun
```
remote: Permission denied
fatal: unable to access 'https://github.com/...'
```

## Çözüm 1: Personal Access Token (Önerilen)

### 1. GitHub Token Oluştur
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)"
3. Scopes seç:
   - ✅ repo (tüm repo erişimi)
   - ✅ workflow
4. "Generate token"
5. Token'ı kopyala (bir daha göremezsin!)

### 2. Git Credentials Güncelle

**Windows:**
```bash
# Credential Manager'ı temizle
git credential-manager-core erase https://github.com

# Tekrar push yap
git push origin main

# Kullanıcı adı: GitHub username'in
# Şifre: Token'ı yapıştır (şifre değil!)
```

**Alternatif (URL'de token):**
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/yuzdebirteknoloji/ykshunter.git
git push origin main
```

## Çözüm 2: SSH Key (Daha Güvenli)

### 1. SSH Key Oluştur
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Enter tuşuna bas (default location)
# Passphrase opsiyonel
```

### 2. SSH Key'i GitHub'a Ekle
```bash
# Public key'i kopyala
cat ~/.ssh/id_ed25519.pub

# GitHub → Settings → SSH and GPG keys → New SSH key
# Key'i yapıştır ve kaydet
```

### 3. Remote URL'i Değiştir
```bash
git remote set-url origin git@github.com:yuzdebirteknoloji/ykshunter.git
git push origin main
```

## Çözüm 3: GitHub Desktop (En Kolay)

1. [GitHub Desktop](https://desktop.github.com/) indir
2. GitHub hesabınla giriş yap
3. Repository'yi ekle
4. "Push origin" butonuna tıkla

## Hızlı Test

```bash
# Hangi remote kullanıyorsun?
git remote -v

# HTTPS ise:
origin  https://github.com/yuzdebirteknoloji/ykshunter.git (fetch)
origin  https://github.com/yuzdebirteknoloji/ykshunter.git (push)

# SSH ise:
origin  git@github.com:yuzdebirteknoloji/ykshunter.git (fetch)
origin  git@github.com:yuzdebirteknoloji/ykshunter.git (push)
```

## Sonraki Adımlar

Push başarılı olduktan sonra:

1. **Vercel'e Git**
   - https://vercel.com/new
   - Repository'yi seç
   - Environment variables ekle
   - Deploy!

2. **Supabase'i Hazırla**
   - https://supabase.com/dashboard
   - New Project
   - SQL Editor → supabase-schema.sql çalıştır
   - URL ve Key'i kopyala

3. **Vercel Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

---

## Yardım

Hala sorun mu var?

```bash
# Git config kontrol et
git config --list

# User bilgilerini güncelle
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"

# Credential helper
git config --global credential.helper manager-core
```

**🎉 Push başarılı olunca Vercel otomatik deploy edecek!**
