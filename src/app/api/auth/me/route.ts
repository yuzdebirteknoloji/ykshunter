import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
  }
  return NextResponse.json({ user })
}

/** Görünen adı güncelle */
export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })

  const { displayName } = await request.json()
  const value = String(displayName || '').trim().slice(0, 40)
  if (!value) return NextResponse.json({ error: 'Görünen ad boş olamaz' }, { status: 400 })

  const { createServerSupabase } = await import('@/lib/supabase/server')
  const supabase = await createServerSupabase()
  const { error } = await supabase.from('profiles').update({ display_name: value }).eq('id', user.id)
  if (error) return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 })
  return NextResponse.json({ success: true })
}
