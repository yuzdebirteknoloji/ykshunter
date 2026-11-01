'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crosshair } from 'lucide-react'
import { toast } from 'sonner'

type Mode = 'login' | 'register'

const inputClass =
  'w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(mode === 'login' ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'login'
            ? { username, password }
            : { username, password, displayName, inviteCode }
        ),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        toast.error(data.error || 'Bir hata oluştu')
        return
      }

      toast.success(mode === 'login' ? 'Giriş başarılı!' : 'Hoş geldin! 🎉')
      // Tam sayfa yenileme: proxy yeni oturum cookie'lerini görsün
      window.location.href = '/'
    } catch {
      toast.error('Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crosshair className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-1">YKS Hunter</h1>
            <p className="text-muted-foreground text-sm">Oyunlaştırılmış YKS hazırlığı</p>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg mb-6">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {m === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Kullanıcı adı</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                placeholder="ornek_kullanici"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                className={inputClass}
                required
                minLength={3}
                maxLength={24}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Görünen ad (opsiyonel)</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Adın"
                  maxLength={40}
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className={inputClass}
                required
                minLength={6}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Davet kodu</label>
                <input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Arkadaşından aldığın kod"
                  autoCapitalize="none"
                  className={inputClass}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Bekle...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
