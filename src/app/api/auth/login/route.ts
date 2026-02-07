import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    // Master password kontrolü - .env'den al
    const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'defaultpassword'

    console.log('Login attempt...')
    console.log('Provided password length:', password?.length)
    console.log('Expected password length:', MASTER_PASSWORD?.length)
    console.log('Expected password (first 2 chars):', MASTER_PASSWORD?.substring(0, 2))

    if (password !== MASTER_PASSWORD) {
      console.log('❌ Password mismatch')
      return NextResponse.json(
        { error: 'Şifre yanlış' },
        { status: 401 }
      )
    }

    console.log('✅ Password correct. Connecting to Supabase...')

    // Supabase'den ilk kullanıcıyı al (veya default user)
    const supabase = createClient()
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.error('❌ Supabase Error:', error)
    }

    if (!users) {
      console.error('❌ No user found in database')
    }

    if (error || !users) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı (Veritabanı boş veya bağlantı hatası)' },
        { status: 404 }
      )
    }

    console.log('✅ User found:', users.username)

    // Session oluştur (lib/auth'daki helper'ı kullanarak)
    const { setUserSession } = await import('@/lib/auth')

    await setUserSession({
      id: users.id,
      username: users.username,
      displayName: users.display_name,
      totalXp: users.total_xp || 0,
      level: users.level || 1,
      streakDays: users.streak_days || 0
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
      { error: 'Giriş başarısız: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
