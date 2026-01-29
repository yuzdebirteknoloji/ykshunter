import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase'

const MASTER_PASSWORD = 'ybtpassword'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    // Master password kontrolü
    if (password !== MASTER_PASSWORD) {
      return NextResponse.json(
        { error: 'Şifre yanlış' },
        { status: 401 }
      )
    }

    // Supabase'den ilk kullanıcıyı al (veya default user)
    const supabase = createClient()
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single()

    if (error || !users) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Session cookie oluştur
    const cookieStore = await cookies()
    cookieStore.set('session', JSON.stringify({
      userId: users.id,
      username: users.username,
      loggedIn: true
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 gün
    })

    return NextResponse.json({
      success: true,
      user: {
        id: users.id,
        username: users.username,
        display_name: users.display_name
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Giriş başarısız' },
      { status: 500 }
    )
  }
}
