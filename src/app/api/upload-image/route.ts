import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Cloudinary signed upload için gerekli parametreler
    const timestamp = Math.round(Date.now() / 1000)
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    const apiKey = process.env.CLOUDINARY_API_KEY
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME

    if (!apiSecret || !apiKey || !cloudName) {
      console.error('Cloudinary config missing')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // İmza oluşturma: parametreler alfabetik sıraya göre sıralanmalı
    // Sadece 'timestamp' parametresini kullanıyoruz şu an için basitlik adına
    const signatureString = `timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex')

    // Cloudinary'ye yükle
    const formDataToSend = new FormData()
    formDataToSend.append('file', file)
    formDataToSend.append('api_key', apiKey)
    formDataToSend.append('timestamp', timestamp.toString())
    formDataToSend.append('signature', signature)

    // Upload preset varsa ekle (opsiyonel)
    // formDataToSend.append('upload_preset', 'ml_default')

    console.log('Uploading to Cloudinary:', cloudName)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formDataToSend,
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Cloudinary error details:', data)
      return NextResponse.json({
        error: 'Upload failed',
        details: data.error?.message || 'Unknown error'
      }, { status: 500 })
    }

    return NextResponse.json({
      url: data.secure_url,
      public_id: data.public_id
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error: ' + (error as Error).message }, { status: 500 })
  }
}
