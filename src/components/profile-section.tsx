'use client'

import { useEffect, useState } from 'react'
import { UserCircle, DatabaseBackup } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface Me {
  id: string
  username: string
  displayName: string | null
  level: number
  totalXp: number
  streakDays: number
  role: 'user' | 'admin'
}

export function ProfileSection() {
  const [me, setMe] = useState<Me | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user) {
          setMe(d.user)
          setDisplayName(d.user.displayName || '')
        }
      })
      .catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    })
    setSaving(false)
    if (res.ok) toast.success('Görünen ad güncellendi')
    else toast.error((await res.json().catch(() => ({}))).error || 'Güncellenemedi')
  }

  const claimLegacy = async () => {
    if (!confirm('Eski (tek şifreli) sistemdeki deneme/ağaç analizleri ve XP senin hesabına taşınacak. Devam?')) return
    setClaiming(true)
    const { data, error } = await supabase.rpc('claim_legacy_data')
    setClaiming(false)
    if (error) {
      toast.error(error.message)
      return
    }
    const d = data as { trial_analyses: number; mindmap_analyses: number }
    toast.success(`Taşındı: ${d.trial_analyses} deneme, ${d.mindmap_analyses} ağaç analizi`)
  }

  if (!me) return null

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <UserCircle className="w-5 h-5" /> Profil
      </h2>
      <div className="grid grid-cols-3 gap-3 mb-5 text-center">
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xl font-bold">{me.level}</div>
          <div className="text-xs text-muted-foreground">Level</div>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xl font-bold">{me.totalXp}</div>
          <div className="text-xs text-muted-foreground">XP</div>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <div className="text-xl font-bold">{me.streakDays}🔥</div>
          <div className="text-xs text-muted-foreground">Seri</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        Kullanıcı adı: <span className="font-medium text-foreground">@{me.username}</span>
        {me.role === 'admin' && <span className="ml-2 text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">admin</span>}
      </p>
      <div className="flex gap-2">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={40}
          placeholder="Görünen ad"
          className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
        >
          Kaydet
        </button>
      </div>

      {me.role === 'admin' && (
        <button
          onClick={claimLegacy}
          disabled={claiming}
          className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <DatabaseBackup className="w-4 h-4" />
          {claiming ? 'Taşınıyor...' : 'Eski sistemdeki verilerimi bu hesaba taşı'}
        </button>
      )}
    </div>
  )
}
