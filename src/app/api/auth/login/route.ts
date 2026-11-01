import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { normalizeUsername, usernameToEmail, USERNAME_REGEX } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    const name = normalizeUsername(username)

    if (!USERNAME_REGEX.test(name) || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 400 })
    }

    const supabase = await createServerSupabase()
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(name),
      password,
    })

    if (error) {
      return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Giriş yapılamadı' }, { status: 500 })
  }
}
