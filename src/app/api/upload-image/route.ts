import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Cloudinary signed upload için timestamp ve signature oluştur
    const timestamp = Math.round(Date.now() / 1000)
    const apiSecret = process.env.CLOUDINARY_API_SECRET || ''
    
    // Signature oluştur
    const signatureString = `timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex')

    // Cloudinary'ye yükle
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', file)
    cloudinaryFormData.append('timestamp', timestamp.toString())
    cloudinaryFormData.append('signature', signature)
    cloudinaryFormData.append('api_key', process.env.CLOUDINARY_API_KEY || '')

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Cloudinary error:', error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const data = await response.json()
    
    return NextResponse.json({ 
      url: data.secure_url,
      public_id: data.public_id 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
