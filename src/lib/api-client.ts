/**
 * Tarayıcı tarafı API katmanı. Web'de Next.js API route'larına gider,
 * APK'da (yerel mod) her şeyi telefondaki veritabanından halleder.
 */
import { IS_LOCAL } from './app-mode'

export interface Me {
  id: string
  username: string
  displayName: string | null
  totalXp: number
  level: number
  streakDays: number
  role: 'user' | 'admin'
}

export async function fetchMe(): Promise<Me | null> {
  if (IS_LOCAL) {
    const { getLocalMe } = await import('./local/profile')
    return getLocalMe()
  }
  try {
    const res = await fetch('/api/auth/me')
    if (!res.ok) return null
    return (await res.json()).user ?? null
  } catch {
    return null
  }
}

export async function updateDisplayName(displayName: string): Promise<{ ok: boolean; error?: string }> {
  const value = displayName.trim().slice(0, 40)
  if (IS_LOCAL) {
    const { setLocalDisplayName } = await import('./local/profile')
    await setLocalDisplayName(value)
    return { ok: true }
  }
  const res = await fetch('/api/auth/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName: value }),
  })
  if (res.ok) return { ok: true }
  return { ok: false, error: (await res.json().catch(() => ({}))).error }
}

export async function logout() {
  if (IS_LOCAL) return
  await fetch('/api/auth/logout', { method: 'POST' })
}

// ---------------- Duyurular ----------------

export async function fetchAnnouncements(): Promise<any[]> {
  if (IS_LOCAL) {
    const { localSupabase } = await import('./local/client')
    const { data } = await localSupabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
    return data ?? []
  }
  const res = await fetch('/api/announcements')
  if (!res.ok) return []
  return (await res.json()).data ?? []
}

export async function createAnnouncement(body: {
  title: string
  message: string
  type?: string
  priority?: number
  isActive?: boolean
}) {
  if (IS_LOCAL) {
    const { localSupabase } = await import('./local/client')
    const { error } = await localSupabase.from('announcements').insert({
      title: body.title,
      message: body.message,
      type: body.type || 'info',
      priority: Number(body.priority) || 0,
      is_active: body.isActive !== false,
    })
    if (error) throw new Error(error.message)
    return
  }
  const res = await fetch('/api/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Duyuru eklenemedi')
}

export async function deleteAnnouncement(id: string) {
  if (IS_LOCAL) {
    const { localSupabase } = await import('./local/client')
    await localSupabase.from('announcements').delete().eq('id', id)
    return
  }
  await fetch(`/api/announcements?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}
