import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Tamamen çevrimdışı APK: web uygulaması statik olarak derlenip (npm run build:mobile)
 * www/ klasörüne konur ve APK'nın içine gömülür. Sunucu, internet veya giriş gerekmez;
 * tüm veriler telefondaki IndexedDB'de saklanır.
 */
const config: CapacitorConfig = {
  appId: 'com.yuzdebir.ykshunter',
  appName: 'YKS Hunter',
  webDir: 'www',
  // Web tarafı uygulama içinde çalıştığını bu ekten anlayabilir
  appendUserAgent: 'YKSHunterApp',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      backgroundColor: '#0a0a0a',
      showSpinner: false,
    },
    // Android 15+ uygulamayı kenardan kenara çizer; güvenli alan değerleri
    // CSS'e --safe-area-inset-* olarak verilir (globals.css'te kullanılıyor).
    SystemBars: {
      insetsHandling: 'css',
    },
  },
}

export default config
