import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { requireAuth, authErrorResponse } from '@/lib/auth'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Dosya 10 MB\'dan büyük olamaz' }, { status: 413 })
    }
    if (file.type && !ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Sadece görsel dosyaları yüklenebilir' }, { status: 415 })
    }

    const apiSecret = process.env.CLOUDINARY_API_SECRET
    const apiKey = process.env.CLOUDINARY_API_KEY
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    if (!apiSecret || !apiKey || !cloudName) {
      console.error('Cloudinary config missing')
      return NextResponse.json({ error: 'Sunucu yapılandırma hatası' }, { status: 500 })
    }

    // Her kullanıcının görselleri kendi klasörüne gider.
    const folder = `ykshunter/${user.role === 'admin' ? 'content' : `users/${user.id}`}`
    const timestamp = Math.round(Date.now() / 1000)
    const signature = crypto
      .createHash('sha1')
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex')

    const body = new FormData()
    body.append('file', file)
    body.append('api_key', apiKey)
    body.append('timestamp', String(timestamp))
    body.append('folder', folder)
    body.append('signature', signature)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body,
    })
    const data = await response.json()

    if (!response.ok) {
      console.error('Cloudinary error:', data?.error?.message)
      return NextResponse.json({ error: 'Yükleme başarısız' }, { status: 502 })
    }

    return NextResponse.json({ url: data.secure_url, public_id: data.public_id })
  } catch (error) {
    const authResponse = authErrorResponse(error)
    if (authResponse) return authResponse
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Yükleme sırasında hata oluştu' }, { status: 500 })
  }
}
