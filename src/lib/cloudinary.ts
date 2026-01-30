// Cloudinary yükleme fonksiyonu - API route üzerinden
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Görsel yüklenemedi')
  }

  const data = await response.json()
  return data.url
}
