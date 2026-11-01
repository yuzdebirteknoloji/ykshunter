import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'

const MODES = ['matching', 'sequence', 'grouping', 'image']

/** XP sunucuda hesaplanır; istemciden gelen XP'ye güvenilmez. */
function calculateXp(isCorrect: boolean, mistakes: number) {
  if (!isCorrect) return 2 // denemek de bir şeydir
  return Math.max(5, 20 - mistakes * 2)
}

function calculateScore(isCorrect: boolean, mistakes: number, timeSpentMs: number) {
  if (!isCorrect) return 0
  const timeBonus = Math.max(0, 60 - Math.floor(timeSpentMs / 1000))
  return Math.max(10, 100 - mistakes * 10) + timeBonus
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const topicId = String(body.topicId || '').slice(0, 100)
    const mode = String(body.mode || '')
    if (!topicId || !MODES.includes(mode)) {
      return NextResponse.json({ error: 'Eksik veya geçersiz parametreler' }, { status: 400 })
    }

    const isCorrect = Boolean(body.isCorrect)
    const mistakes = Math.min(Math.max(0, Math.floor(Number(body.mistakes) || 0)), 1000)
    const timeSpent = Math.min(Math.max(0, Math.floor(Number(body.timeSpent) || 0)), 24 * 60 * 60 * 1000)

    const admin = createAdminSupabase()

    // Basit spam koruması: aynı kullanıcı 3 saniyede birden fazla sonuç gönderemez.
    const { data: last } = await admin
      .from('game_results')
      .select('played_at')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (last && Date.now() - new Date(last.played_at).getTime() < 3000) {
      return NextResponse.json({ error: 'Çok hızlı' }, { status: 429 })
    }

    const xpEarned = calculateXp(isCorrect, mistakes)
    const { error } = await admin.from('game_results').insert({
      user_id: user.id,
      topic_id: topicId,
      mode,
      is_correct: isCorrect,
      mistakes,
      time_spent: timeSpent,
      score: calculateScore(isCorrect, mistakes, timeSpent),
      xp_earned: xpEarned,
    })
    if (error) {
      console.error('Save game result error:', error)
      return NextResponse.json({ error: 'Sonuç kaydedilemedi' }, { status: 500 })
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('total_xp, level, streak_days')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ success: true, xpEarned, user: profile })
  } catch (error) {
    const authResponse = authErrorResponse(error)
    if (authResponse) return authResponse
    console.error('Save game result error:', error)
    return NextResponse.json({ error: 'Sonuç kaydedilemedi' }, { status: 500 })
  }
}
