import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase/server'
import { normalizeUsername, usernameToEmail, USERNAME_REGEX } from '@/lib/auth'

function inviteCodeMatches(given: string) {
  const expected = process.env.INVITE_CODE
  if (!expected) return false
  const a = Buffer.from(String(given ?? '').trim())
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  try {
    const { username, password, displayName, inviteCode } = await request.json()
    const name = normalizeUsername(username)

    if (!process.env.INVITE_CODE) {
      return NextResponse.json({ error: 'Kayıt şu an kapalı' }, { status: 403 })
    }
    if (!inviteCodeMatches(inviteCode)) {
      return NextResponse.json({ error: 'Davet kodu geçersiz' }, { status: 403 })
    }
    if (!USERNAME_REGEX.test(name)) {
      return NextResponse.json(
        { error: 'Kullanıcı adı 3-24 karakter olmalı; sadece küçük harf, rakam, _ ve . içerebilir' },
        { status: 400 }
      )
    }
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalı' }, { status: 400 })
    }

    const admin = createAdminSupabase()
    const display = String(displayName || '').trim().slice(0, 40) || name

    // Profil satırı veritabanındaki trigger tarafından otomatik oluşturulur.
    const { error: createError } = await admin.auth.admin.createUser({
      email: usernameToEmail(name),
      password,
      email_confirm: true,
      user_metadata: { username: name, display_name: display },
    })

    if (createError) {
      const taken = /already|exists|registered/i.test(createError.message)
      return NextResponse.json(
        { error: taken ? 'Bu kullanıcı adı zaten alınmış' : 'Kayıt oluşturulamadı' },
        { status: taken ? 409 : 500 }
      )
    }

    const supabase = await createServerSupabase()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(name),
      password,
    })
    if (signInError) {
      return NextResponse.json({ error: 'Kayıt oldu ama giriş yapılamadı, tekrar deneyin' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Kayıt olurken bir hata oluştu' }, { status: 500 })
  }
}
