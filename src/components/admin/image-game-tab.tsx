'use client'

import { useState, useRef, useEffect } from 'react'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { createImageGame, getImageGames, deleteImageGame, getSubjects, getTopicsBySubject, ImageGame, ImageGameRegion } from '@/lib/supabase'
import { Trash2, Plus, X } from 'lucide-react'

export function ImageGameTab() {
  const [games, setGames] = useState<ImageGame[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [regions, setRegions] = useState<ImageGameRegion[]>([])
  
  // Drawing states
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentRegion, setCurrentRegion] = useState<ImageGameRegion | null>(null)
  const [newLabel, setNewLabel] = useState('')
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      loadTopics(selectedSubject)
    }
  }, [selectedSubject])

  const loadData = async () => {
    try {
      const [gamesData, subjectsData] = await Promise.all([
        getImageGames(),
        getSubjects()
      ])
      setGames(gamesData)
      setSubjects(subjectsData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const loadTopics = async (subjectId: string) => {
    try {
      const topicsData = await getTopicsBySubject(subjectId)
      setTopics(topicsData)
    } catch (error) {
      console.error('Error loading topics:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const url = await uploadToCloudinary(file)
      setImageUrl(url)
      
      // Load image to canvas
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        if (imageRef.current) {
          imageRef.current.src = url
        }
        drawCanvas()
      }
      img.src = url
    } catch (error) {
      console.error('Upload error:', error)
      alert('Görsel yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    // Draw existing regions
    regions.forEach((region, index) => {
      ctx.strokeStyle = '#8b5cf6'
      ctx.lineWidth = 3
      ctx.strokeRect(region.x, region.y, region.width, region.height)
      
      ctx.fillStyle = 'rgba(139, 92, 246, 0.2)'
      ctx.fillRect(region.x, region.y, region.width, region.height)
      
      ctx.fillStyle = '#8b5cf6'
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText(region.label, region.x + 5, region.y + 20)
    })

    // Draw current region being drawn
    if (currentRegion) {
      ctx.strokeStyle = '#ec4899'
      ctx.lineWidth = 3
      ctx.strokeRect(currentRegion.x, currentRegion.y, currentRegion.width, currentRegion.height)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setStartPos({ x, y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const width = x - startPos.x
    const height = y - startPos.y

    setCurrentRegion({
      id: Date.now().toString(),
      label: '',
      x: startPos.x,
      y: startPos.y,
      width,
      height
    })

    drawCanvas()
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentRegion) return

    setIsDrawing(false)
    
    // Prompt for label
    const label = prompt('Bu bölge için etiket girin:')
    if (label) {
      setRegions([...regions, { ...currentRegion, label }])
    }
    
    setCurrentRegion(null)
    drawCanvas()
  }

  const removeRegion = (id: string) => {
    setRegions(regions.filter(r => r.id !== id))
    setTimeout(drawCanvas, 0)
  }

  const handleSubmit = async () => {
    if (!title || !imageUrl || regions.length === 0) {
      alert('Lütfen tüm alanları doldurun ve en az bir bölge çizin')
      return
    }

    setLoading(true)
    try {
      await createImageGame({
        subject_id: selectedSubject || undefined,
        topic_id: selectedTopic || undefined,
        title,
        description,
        image_url: imageUrl,
        regions
      })

      alert('Görsel oyun oluşturuldu!')
      
      // Reset form
      setTitle('')
      setDescription('')
      setSelectedSubject('')
      setSelectedTopic('')
      setImageUrl('')
      setRegions([])
      
      loadData()
    } catch (error) {
      console.error('Error creating game:', error)
      alert('Oyun oluşturulamadı')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu oyunu silmek istediğinize emin misiniz?')) return

    try {
      await deleteImageGame(id)
      loadData()
    } catch (error) {
      console.error('Error deleting game:', error)
      alert('Oyun silinemedi')
    }
  }

  useEffect(() => {
    drawCanvas()
  }, [regions, currentRegion])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">🖼️ Görsel Eşleştirme Oyunu</h2>
        <p className="text-sm text-muted-foreground">Görsel yükle, bölgeleri işaretle ve etiketle</p>
      </div>

      {/* Create Form */}
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Oyun Başlığı</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="Örn: Beyin Anatomisi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Açıklama (Opsiyonel)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="Kısa açıklama"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ders (Opsiyonel)</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background"
            >
              <option value="">Seçiniz</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Konu (Opsiyonel)</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background"
              disabled={!selectedSubject}
            >
              <option value="">Seçiniz</option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Görsel Yükle</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-3 py-2 border rounded-lg bg-background"
          />
        </div>

        {imageUrl && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted">
              <p className="text-sm font-medium mb-2">Bölgeleri Çiz (Fare ile sürükle)</p>
              <div className="relative inline-block">
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Preview"
                  className="hidden"
                />
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="border cursor-crosshair max-w-full"
                />
              </div>
            </div>

            {regions.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Etiketler ({regions.length})</p>
                <div className="flex flex-wrap gap-2">
                  {regions.map(region => (
                    <div
                      key={region.id}
                      className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded-full text-sm"
                    >
                      <span>{region.label}</span>
                      <button
                        onClick={() => removeRegion(region.id)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !title || !imageUrl || regions.length === 0}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Oluşturuluyor...' : '✨ Oyunu Oluştur'}
        </button>
      </div>

      {/* Games List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Mevcut Oyunlar ({games.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map(game => (
            <div key={game.id} className="bg-card border rounded-lg overflow-hidden">
              <img src={game.image_url} alt={game.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h4 className="font-semibold mb-1">{game.title}</h4>
                <p className="text-xs text-muted-foreground mb-2">{game.regions.length} bölge</p>
                <button
                  onClick={() => handleDelete(game.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
