import { cookies } from 'next/headers'

export interface User {
  id: string
  username: string
  displayName: string | null
  totalXp: number
  level: number
  streakDays: number
}

// Basit session yönetimi (cookie-based)
const SESSION_COOKIE_NAME = 'session'

export async function setUserSession(user: User, rememberMe: boolean = false) {
  const cookieStore = await cookies()
  
  // Beni hatırla: 30 gün, değilse: 7 gün
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7
  
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/'
  })
}

export async function getUserSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE_NAME)
  
  if (!session) return null
  
  try {
    return JSON.parse(session.value)
  } catch {
    return null
  }
}

export async function clearUserSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function requireAuth(): Promise<User> {
  const user = await getUserSession()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
