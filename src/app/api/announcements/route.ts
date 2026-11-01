import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { requireAdmin, requireAuth, authErrorResponse } from '@/lib/auth'

const TYPES = ['info', 'success', 'warning', 'update']

export async function GET() {
  try {
    await requireAuth()
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    return authErrorResponse(error) ?? NextResponse.json({ error: 'Duyurular alınamadı' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    if (!body.title || !body.message) {
      return NextResponse.json({ error: 'Başlık ve mesaj gerekli' }, { status: 400 })
    }
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title: String(body.title).slice(0, 200),
        message: String(body.message).slice(0, 2000),
        type: TYPES.includes(body.type) ? body.type : 'info',
        priority: Number(body.priority) || 0,
        is_active: body.isActive !== false,
      })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    return authErrorResponse(error) ?? NextResponse.json({ error: 'Duyuru eklenemedi' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })
    const supabase = await createServerSupabase()
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return authErrorResponse(error) ?? NextResponse.json({ error: 'Duyuru silinemedi' }, { status: 500 })
  }
}
