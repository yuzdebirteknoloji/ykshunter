import { getDB, getMeta, newId, setMeta } from './db'
import { LOCAL_USER_ID } from './query'
import { ensureSeeded } from './seed'

export interface LocalProfile {
  displayName: string
  totalXp: number
  level: number
  streakDays: number
  lastActivityDate: string | null
}

const DEFAULT_PROFILE: LocalProfile = {
  displayName: '',
  totalXp: 0,
  level: 1,
  streakDays: 0,
  lastActivityDate: null,
}

function today() {
  // Telefonun yerel tarihi (YYYY-MM-DD)
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
}

export async function getLocalProfile(): Promise<LocalProfile> {
  const p = { ...DEFAULT_PROFILE, ...((await getMeta<LocalProfile>('profile')) ?? {}) }
  // Dün ve bugün oynanmadıysa seri kırılmıştır
  if (p.lastActivityDate && daysBetween(p.lastActivityDate, today()) > 1) p.streakDays = 0
  return p
}

export async function setLocalDisplayName(name: string) {
  const p = await getLocalProfile()
  await setMeta('profile', { ...p, displayName: name })
}

/** /api/auth/me ile aynı şekil */
export async function getLocalMe() {
  await ensureSeeded()
  const p = await getLocalProfile()
  return {
    id: LOCAL_USER_ID,
    username: 'Öğrenci',
    displayName: p.displayName || null,
    totalXp: p.totalXp,
    level: p.level,
    streakDays: p.streakDays,
    role: 'admin' as const,
  }
}

function calculateXp(isCorrect: boolean, mistakes: number) {
  if (!isCorrect) return 2
  return Math.max(5, 20 - mistakes * 2)
}

export async function recordLocalGameResult(r: {
  topicId: string
  mode: string
  isCorrect: boolean
  mistakes: number
  timeSpent: number
}) {
  const xpEarned = calculateXp(r.isCorrect, r.mistakes)
  const db = await getDB()
  await db.put('game_results', {
    id: newId(),
    user_id: LOCAL_USER_ID,
    topic_id: r.topicId,
    mode: r.mode,
    is_correct: r.isCorrect,
    mistakes: r.mistakes,
    time_spent: r.timeSpent,
    xp_earned: xpEarned,
    played_at: new Date().toISOString(),
  })

  const p = await getLocalProfile()
  const t = today()
  const totalXp = p.totalXp + xpEarned
  const streakDays =
    p.lastActivityDate === t
      ? Math.max(p.streakDays, 1)
      : p.lastActivityDate && daysBetween(p.lastActivityDate, t) === 1
        ? p.streakDays + 1
        : 1
  const next: LocalProfile = {
    ...p,
    totalXp,
    level: Math.floor(totalXp / 100) + 1,
    streakDays,
    lastActivityDate: t,
  }
  await setMeta('profile', next)
  return { success: true, xpEarned, user: { total_xp: next.totalXp, level: next.level, streak_days: next.streakDays } }
}
