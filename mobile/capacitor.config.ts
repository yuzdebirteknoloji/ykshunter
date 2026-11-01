import type { CapacitorConfig } from '@capacitor/cli'

/**
 * APK, Vercel'deki canlı siteyi açan bir kabuktur. Böylece web'e yapılan her
 * güncelleme APK'yı yeniden dağıtmadan arkadaşlarının telefonuna gelir.
 *
 * Adres derleme sırasında CAP_SERVER_URL ile verilir (GitHub Actions'ta
 * repo değişkeni olarak). Örnek: CAP_SERVER_URL=https://ykshunter.vercel.app
 */
const serverUrl = process.env.CAP_SERVER_URL || 'https://ykshunter.vercel.app'

const config: CapacitorConfig = {
  appId: 'com.yuzdebir.ykshunter',
  appName: 'YKS Hunter',
  webDir: 'www',
  server: {
    url: serverUrl,
    // İnternet yoksa / site açılamazsa gösterilecek yerel sayfa
    errorPath: 'offline.html',
    // Bu alan adları uygulama içinde açılır; diğer linkler harici tarayıcıda açılır
    allowNavigation: [new URL(serverUrl).host, '*.supabase.co', 'res.cloudinary.com'],
  },
  // Web tarafı uygulama içinde çalıştığını bu ekten anlayabilir
  appendUserAgent: 'YKSHunterApp',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#0a0a0a',
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#0a0a0a',
    },
  },
}

export default config
