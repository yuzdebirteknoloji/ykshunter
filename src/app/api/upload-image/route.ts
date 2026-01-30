import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Cloudinary'ye yükle
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', file)
    cloudinaryFormData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default')
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
