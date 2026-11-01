import 'server-only'
import { createServerSupabase } from '@/lib/supabase/server'

export type Role = 'user' | 'admin'

export interface User {
  id: string
  username: string
  displayName: string | null
  totalXp: number
  level: number
  streakDays: number
  role: Role
}

/** Kullanıcı adları Supabase Auth'ta sahte bir e-posta olarak saklanır. */
export const USERNAME_REGEX = /^[a-z0-9_.]{3,24}$/
export function normalizeUsername(raw: string) {
  return String(raw || '').trim().toLowerCase()
}
export function usernameToEmail(username: string) {
  return `${normalizeUsername(username)}@users.ykshunter.app`
}

export class AuthError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message)
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, total_xp, level, streak_days, role')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    username: profile?.username ?? user.user_metadata?.username ?? '',
    displayName: profile?.display_name ?? null,
    totalXp: profile?.total_xp ?? 0,
    level: profile?.level ?? 1,
    streakDays: profile?.streak_days ?? 0,
    role: (profile?.role as Role) ?? 'user',
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) throw new AuthError(401, 'Oturum açmanız gerekiyor')
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== 'admin') throw new AuthError(403, 'Bu işlem için yetkiniz yok')
  return user
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: error.status })
  }
  return null
}
