'use client'

import { useState, useRef, useEffect } from 'react'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { createImageGame, getImageGames, deleteImageGame, getSubjects, getTopicsBySubject, ImageGame, ImageGameRegion } from '@/lib/supabase'
import { Trash2, Square, Edit3, Pentagon, Move, X, Plus } from 'lucide-react'

type DrawMode = 'rectangle' | 'freehand' | 'polygon'

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
  const [drawMode, setDrawMode] = useState<DrawMode>('rectangle')
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentRegion, setCurrentRegion] = useState<any>(null)
  const [polygonPoints, setPolygonPoints] = useState<{x: number, y: number}[]>([])
  const [freehandPoints, setFreehandPoints] = useState<{x: number, y: number}[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
  
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
      
      setTimeout(() => {
        const img = imageRef.current
        const canvas = canvasRef.current
        if (img && canvas) {
          img.onload = () => {
            const ctx = canvas.getContext('2d')
            if (ctx) {
              canvas.width = img.naturalWidth
              canvas.height = img.naturalHeight
              ctx.drawImage(img, 0, 0)
            }
          }
          img.src = url
        }
      }, 100)
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
    if (!canvas || !img || !img.complete) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (canvas.width === 0 || canvas.height === 0) {
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)

    // Draw regions with thinner lines
    regions.forEach((region) => {
      const isSelected = selectedRegionId === region.id
      
      if (region.type === 'polygon' && region.points && region.points.length > 0) {
        // Draw polygon with thin lines
        ctx.beginPath()
        ctx.moveTo(region.points[0].x, region.points[0].y)
        for (let i = 1; i < region.points.length; i++) {
          ctx.lineTo(region.points[i].x, region.points[i].y)
        }
        ctx.closePath()
        
        ctx.strokeStyle = isSelected ? '#ec4899' : '#8b5cf6'
        ctx.lineWidth = isSelected ? 2.5 : 2
        ctx.stroke()
        
        ctx.fillStyle = isSelected ? 'rgba(236, 72, 153, 0.15)' : 'rgba(139, 92, 246, 0.15)'
        ctx.fill()
        
        // Draw label
        ctx.fillStyle = isSelected ? '#ec4899' : '#8b5cf6'
        ctx.font = 'bold 14px sans-serif'
        ctx.fillText(region.label, region.points[0].x + 5, region.points[0].y + 18)
      } else {
        // Draw rectangle with thin lines
        ctx.strokeStyle = isSelected ? '#ec4899' : '#8b5cf6'
        ctx.lineWidth = isSelected ? 2.5 : 2
        ctx.strokeRect(region.x, region.y, region.width, region.height)
        
        ctx.fillStyle = isSelected ? 'rgba(236, 72, 153, 0.15)' : 'rgba(139, 92, 246, 0.15)'
        ctx.fillRect(region.x, region.y, region.width, region.height)
        
        ctx.fillStyle = isSelected ? '#ec4899' : '#8b5cf6'
        ctx.font = 'bold 14px sans-serif'
        ctx.fillText(region.label, region.x + 5, region.y + 18)
      }
    })

    // Draw current rectangle
    if (currentRegion && drawMode === 'rectangle') {
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 3
      ctx.setLineDash([5, 5])
      ctx.strokeRect(currentRegion.x, currentRegion.y, currentRegion.width, currentRegion.height)
      ctx.setLineDash([])
    }

    // Draw polygon points and lines
    if (drawMode === 'polygon' && polygonPoints.length > 0) {
      // Draw points
      ctx.fillStyle = '#10b981'
      polygonPoints.forEach((point, index) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2)
        ctx.fill()
        
        // Draw point number
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 12px sans-serif'
        ctx.fillText((index + 1).toString(), point.x - 4, point.y + 4)
        ctx.fillStyle = '#10b981'
      })
      
      // Draw lines between points
      if (polygonPoints.length > 1) {
        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 3
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y)
        for (let i = 1; i < polygonPoints.length; i++) {
          ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y)
        }
        ctx.stroke()
        ctx.setLineDash([])
        
        // Draw closing line preview
        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 2
        ctx.setLineDash([2, 2])
        ctx.beginPath()
        ctx.moveTo(polygonPoints[polygonPoints.length - 1].x, polygonPoints[polygonPoints.length - 1].y)
        ctx.lineTo(polygonPoints[0].x, polygonPoints[0].y)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }
    
    // Draw freehand path
    if (drawMode === 'freehand' && freehandPoints.length > 0) {
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(freehandPoints[0].x, freehandPoints[0].y)
      for (let i = 1; i < freehandPoints.length; i++) {
        ctx.lineTo(freehandPoints[i].x, freehandPoints[i].y)
      }
      ctx.stroke()
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    if (drawMode === 'rectangle') {
      setIsDrawing(true)
      setStartPos({ x, y })
    } else if (drawMode === 'polygon') {
      setPolygonPoints([...polygonPoints, { x, y }])
    } else if (drawMode === 'freehand') {
      setIsDrawing(true)
      setFreehandPoints([{ x, y }])
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    if (drawMode === 'rectangle') {
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
    } else if (drawMode === 'freehand') {
      setFreehandPoints([...freehandPoints, { x, y }])
    }

    drawCanvas()
  }

  const handleMouseUp = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    
    if (drawMode === 'rectangle' && currentRegion) {
      const newRegion = { 
        ...currentRegion, 
        label: `Bölge ${regions.length + 1}`,
        type: 'rectangle' as const
      }
      setRegions([...regions, newRegion])
      setCurrentRegion(null)
      setSelectedRegionId(newRegion.id)
    } else if (drawMode === 'freehand' && freehandPoints.length > 10) {
      // Convert freehand to polygon
      const xs = freehandPoints.map(p => p.x)
      const ys = freehandPoints.map(p => p.y)
      const minX = Math.min(...xs)
      const maxX = Math.max(...xs)
      const minY = Math.min(...ys)
      const maxY = Math.max(...ys)

      const newRegion: ImageGameRegion = {
        id: Date.now().toString(),
        label: `Bölge ${regions.length + 1}`,
        type: 'polygon',
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        points: freehandPoints
      }

      setRegions([...regions, newRegion])
      setFreehandPoints([])
      setSelectedRegionId(newRegion.id)
    } else {
      setFreehandPoints([])
    }
    
    drawCanvas()
  }

  const finishPolygon = () => {
    if (polygonPoints.length < 3) {
      alert('En az 3 nokta seçmelisiniz')
      return
    }

    // Calculate bounding box for storage
    const xs = polygonPoints.map(p => p.x)
    const ys = polygonPoints.map(p => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)

    const newRegion: ImageGameRegion = {
      id: Date.now().toString(),
      label: `Bölge ${regions.length + 1}`,
      type: 'polygon',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      points: polygonPoints // Store actual polygon points
    }

    setRegions([...regions, newRegion])
    setPolygonPoints([])
    setSelectedRegionId(newRegion.id)
    drawCanvas()
  }

  const updateRegionLabel = (id: string, label: string) => {
    setRegions(regions.map(r => r.id === id ? { ...r, label } : r))
  }

  const removeRegion = (id: string) => {
    setRegions(regions.filter(r => r.id !== id))
    if (selectedRegionId === id) setSelectedRegionId(null)
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
  }, [regions, currentRegion, polygonPoints, selectedRegionId])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">🖼️ Görsel Eşleştirme Oyunu</h2>
        <p className="text-sm text-muted-foreground">Görsel yükle, bölgeleri işaretle ve etiketle</p>
      </div>

      {/* Basic Info */}
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Oyun Başlığı *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="Örn: Beyin Anatomisi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Açıklama</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="Kısa açıklama"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ders</label>
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
            <label className="block text-sm font-medium mb-2">Konu</label>
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
          <label className="block text-sm font-medium mb-2">Görsel Yükle *</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-3 py-2 border rounded-lg bg-background"
          />
        </div>
      </div>

      {/* Editor */}
      {imageUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-lg p-4 space-y-4">
              {/* Tools */}
              <div className="flex items-center gap-2 pb-4 border-b">
                <button
                  onClick={() => {
                    setDrawMode('rectangle')
                    setPolygonPoints([])
                    setFreehandPoints([])
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    drawMode === 'rectangle'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Square className="w-4 h-4" />
                  Dikdörtgen
                </button>
                <button
                  onClick={() => {
                    setDrawMode('freehand')
                    setPolygonPoints([])
                    setFreehandPoints([])
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    drawMode === 'freehand'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  Kalem
                </button>
                <button
                  onClick={() => {
                    setDrawMode('polygon')
                    setPolygonPoints([])
                    setFreehandPoints([])
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    drawMode === 'polygon'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Pentagon className="w-4 h-4" />
                  Polygon
                </button>
                {drawMode === 'polygon' && polygonPoints.length > 0 && (
                  <>
                    <button
                      onClick={finishPolygon}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Tamamla ({polygonPoints.length} nokta)
                    </button>
                    <button
                      onClick={() => setPolygonPoints([])}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      İptal
                    </button>
                  </>
                )}
              </div>

              {/* Canvas */}
              <div className="overflow-auto bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4">
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Preview"
                  className="absolute opacity-0 pointer-events-none"
                  crossOrigin="anonymous"
                />
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="cursor-crosshair shadow-lg w-full"
                  style={{ minHeight: '500px' }}
                />
              </div>
            </div>
          </div>

          {/* Regions Sidebar */}
          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center justify-between">
                <span>Bölgeler ({regions.length})</span>
              </h3>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {regions.map((region) => (
                  <div
                    key={region.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedRegionId === region.id
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10'
                        : 'border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/5'
                    }`}
                    onClick={() => setSelectedRegionId(region.id)}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="text"
                        value={region.label}
                        onChange={(e) => updateRegionLabel(region.id, e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border rounded bg-background"
                        placeholder="Etiket adı"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeRegion(region.id)
                        }}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {regions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Henüz bölge eklenmedi.<br/>
                    Görselin üzerine çizim yapın.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !title || !imageUrl || regions.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Oluşturuluyor...' : '✨ Oyunu Kaydet'}
            </button>
          </div>
        </div>
      )}

      {/* Games List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Mevcut Oyunlar ({games.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map(game => (
            <div key={game.id} className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <img src={game.image_url} alt={game.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h4 className="font-semibold mb-1">{game.title}</h4>
                <p className="text-xs text-muted-foreground mb-3">{game.regions.length} bölge</p>
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
