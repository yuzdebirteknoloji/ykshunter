/**
 * Yerel modda yüklenen görseller (deneme fotoğrafları vb.) sıkıştırılıp
 * data URL olarak IndexedDB'deki kaydın içinde saklanır.
 */
const MAX_SIDE = 1600
const QUALITY = 0.82

function readAsDataURL(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Görsel okunamadı'))
    img.src = src
  })
}

export async function fileToCompressedDataURL(file: File): Promise<string> {
  const original = await readAsDataURL(file)
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return original
  try {
    const img = await loadImage(original)
    const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height))
    const w = Math.round(img.width * scale)
    const h = Math.round(img.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return original
    ctx.fillStyle = '#fff' // şeffaf PNG'ler JPEG'de siyah olmasın
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    const compressed = canvas.toDataURL('image/jpeg', QUALITY)
    return compressed.length < original.length ? compressed : original
  } catch {
    return original
  }
}
