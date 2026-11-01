#!/usr/bin/env bash
# APK imzalama anahtarı oluşturur ve GitHub Secrets'a girilecek değerleri yazdırır.
# Bu anahtarı KAYBETME: aynı anahtarla imzalanmayan güncellemeler eski sürümün üstüne kurulamaz.
# Kullanım: bash mobile/scripts/create-keystore.sh
set -euo pipefail

OUT="${1:-ykshunter-release.jks}"
ALIAS="ykshunter"

read -r -s -p "Keystore şifresi (en az 6 karakter): " PASS; echo

keytool -genkeypair -v \
  -keystore "$OUT" -alias "$ALIAS" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$PASS" -keypass "$PASS" \
  -dname "CN=YKS Hunter, O=Yuzdebir Teknoloji, C=TR"

echo
echo "✅ $OUT oluşturuldu. Güvenli bir yerde yedekle, repoya EKLEME."
echo
echo "GitHub > Settings > Secrets and variables > Actions > New repository secret:"
echo "  ANDROID_KEYSTORE_BASE64   = (aşağıdaki uzun metin)"
echo "  ANDROID_KEYSTORE_PASSWORD = (girdiğin şifre)"
echo "  ANDROID_KEY_ALIAS         = $ALIAS"
echo "  ANDROID_KEY_PASSWORD      = (girdiğin şifre)"
echo
base64 -w0 "$OUT" 2>/dev/null || base64 "$OUT"
echo
