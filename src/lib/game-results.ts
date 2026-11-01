import { toast } from 'sonner'
import { IS_LOCAL } from './app-mode'

export interface GameResultPayload {
  topicId: string
  mode: 'matching' | 'sequence' | 'grouping' | 'image'
  isCorrect: boolean
  mistakes: number
  timeSpent: number // ms
}

/** Oyun sonucunu sunucuya gönderir; XP sunucuda hesaplanır. Hata oyunu bozmaz. */
export async function saveGameResult(payload: GameResultPayload) {
  try {
    if (IS_LOCAL) {
      const { recordLocalGameResult } = await import('./local/profile')
      const data = await recordLocalGameResult(payload)
      toast.success(`+${data.xpEarned} XP`, { duration: 2000 })
      return data
    }
    const res = await fetch('/api/game/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.xpEarned) toast.success(`+${data.xpEarned} XP`, { duration: 2000 })
    return data
  } catch {
    return null
  }
}
