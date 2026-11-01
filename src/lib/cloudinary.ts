import { IS_LOCAL } from './app-mode'

// Cloudinary yükleme fonksiyonu - API route üzerinden
export async function uploadToCloudinary(file: File): Promise<string> {
  // APK'da görseller telefonda saklanır
  if (IS_LOCAL) {
    const { fileToCompressedDataURL } = await import('./local/images')
    return fileToCompressedDataURL(file)
  }
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || errorData.details || 'Cloudinary Yükleme Hatası (V2)')
  }

  const data = await response.json()
  return data.url
}
