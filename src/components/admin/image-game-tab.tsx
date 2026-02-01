'use client'

import { useState, useRef, useEffect } from 'react'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { createImageGame, deleteImageGame, getSubjects, getTopicsBySubject, ImageGame, ImageGameRegion } from '@/lib/supabase'
import { Trash2, Square, Edit3, Pentagon, X } from 'lucide-react'
import { useImageGames, useSubjects } from '@/hooks/use-queries'
import { useQueryClient } from '@tanstack/react-query'

type DrawMode = 'rectangle' | 'freehand' | 'polygon'
type GameMode = 'region' | 'text-cover'

export function ImageGameTab() {
  const queryClient = useQueryClient()
  const { data: games = [], isLoading: gamesLoading } = useImageGames()
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects()
  
  const [gameMode, setGameMode] = useState<GameMode>('region')
  const [allTopics, setAllTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showGames, setShowGames] = useState(false)

  useEffect(() => {
    loadTopics()
  }, [subjects])

  const loadTopics = async () => {
    if (subjects.length === 0) return
    
    try {
      const allTopicsPromises = subjects.map(s => getTopicsBySubject(s.id))
      const allTopicsArrays = await Promise.all(allTopicsPromises)
      const flatTopics = allTopicsArrays.flat()
      setAllTopics(flatTopics)
    } catch (error) {
      console.error('Error loading topics:', error)
    }
  }

  const invalidateCache = () => {
    queryClient.invalidateQueries({ queryKey: ['imageGames'] })
    queryClient.invalidateQueries({ queryKey: ['management', 'full-hierarchy'] })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu oyunu silmek istediğinize emin misiniz?')) return

    try {
      await deleteImageGame(id)
      invalidateCache()
    } catch (error) {
      console.error('Error deleting game:', error)
      alert('Oyun silinemedi')
    }
  }

  const isLoading = gamesLoading || subjectsLoading

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">🖼️ Görsel Eşleştirme Oyunu</h2>
        <p className="text-sm text-muted-foreground">İki farklı oyun modu ile görsel eşleştirme oyunu oluşturun</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setGameMode('region')}
          className={`px-6 py-3 font-medium transition-all border-b-2 ${
            gameMode === 'region'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          📍 Bölge İşaretleme
        </button>
        <button
          onClick={() => setGameMode('text-cover')}
          className={`px-6 py-3 font-medium transition-all border-b-2 ${
            gameMode === 'text-cover'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          📝 Yazı Kapatma
        </button>
      </div>

      {gameMode === 'region' ? (
        <RegionMarkingMode
          subjects={subjects}
          allTopics={allTopics}
          loading={isLoading}
          onReload={invalidateCache}
        />
      ) : (
        <TextCoverMode
          subjects={subjects}
          allTopics={allTopics}
          loading={isLoading}
          onReload={invalidateCache}
        />
      )}

      {/* Games List */}
      <div className="bg-card border rounded-lg">
        <button
          onClick={() => setShowGames(!showGames)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <h3 className="text-lg font-semibold">Mevcut Oyunlar ({games.length})</h3>
          <span className="text-2xl">{showGames ? '▼' : '▶'}</span>
        </button>
        
        {showGames && (
          <div className="p-4 pt-0">
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
        )}
      </div>
    </div>
  )
}


// Region Marking Mode Component (Mevcut sistem)
function RegionMarkingMode({ subjects, allTopics, loading, onReload }: any) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [regions, setRegions] = useState<ImageGameRegion[]>([])
  const [saving, setSaving] = useState(false)
  
  const [drawMode, setDrawMode] = useState<DrawMode>('rectangle')
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentRegion, setCurrentRegion] = useState<any>(null)
  const [polygonPoints, setPolygonPoints] = useState<{x: number, y: number}[]>([])
  const [freehandPoints, setFreehandPoints] = useState<{x: number, y: number}[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Filter topics based on selected subject
  const filteredTopics = selectedSubject 
    ? allTopics.filter((t: any) => t.subject_id === selectedSubject)
    : []

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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

    regions.forEach((region) => {
      const isSelected = selectedRegionId === region.id
      
      if (region.type === 'polygon' && region.points && region.points.length > 0) {
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
        
        ctx.fillStyle = isSelected ? '#ec4899' : '#8b5cf6'
        ctx.font = 'bold 14px sans-serif'
        ctx.fillText(region.label, region.points[0].x + 5, region.points[0].y + 18)
      } else {
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

    if (currentRegion && drawMode === 'rectangle') {
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 3
      ctx.setLineDash([5, 5])
      ctx.strokeRect(currentRegion.x, currentRegion.y, currentRegion.width, currentRegion.height)
      ctx.setLineDash([])
    }

    if (drawMode === 'polygon' && polygonPoints.length > 0) {
      ctx.fillStyle = '#10b981'
      polygonPoints.forEach((point, index) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 12px sans-serif'
        ctx.fillText((index + 1).toString(), point.x - 4, point.y + 4)
        ctx.fillStyle = '#10b981'
      })
      
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
      points: polygonPoints
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

    setSaving(true)
    try {
      await createImageGame({
        subject_id: selectedSubject || undefined,
        topic_id: selectedTopic || undefined,
        title,
        description,
        image_url: imageUrl,
        regions,
        game_type: 'region'
      })

      alert('✅ Görsel oyun oluşturuldu!')
      
      setTitle('')
      setDescription('')
      setSelectedSubject('')
      setSelectedTopic('')
      setImageUrl('')
      setRegions([])
      
      onReload()
    } catch (error: any) {
      console.error('Error creating game:', error)
      alert('❌ Oyun oluşturulamadı: ' + (error?.message || 'Bilinmeyen hata'))
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    drawCanvas()
  }, [regions, currentRegion, polygonPoints, selectedRegionId])

  return (
    <>
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
              {subjects.map((s: any) => (
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
              {filteredTopics.map((t: any) => (
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

      {imageUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-lg p-4 space-y-4">
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

          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Bölgeler ({regions.length})</h3>
              
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
              disabled={saving || !title || !imageUrl || regions.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Oluşturuluyor...' : '✨ Oyunu Kaydet'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}


// Text Cover Mode Component (Yeni sistem - Yazıları kapat)
function TextCoverMode({ subjects, allTopics, loading, onReload }: any) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [textBoxes, setTextBoxes] = useState<ImageGameRegion[]>([])
  const [saving, setSaving] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [currentBox, setCurrentBox] = useState<any>(null)
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Filter topics based on selected subject
  const filteredTopics = selectedSubject 
    ? allTopics.filter((t: any) => t.subject_id === selectedSubject)
    : []

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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

    // Draw white boxes covering text
    textBoxes.forEach((box) => {
      const isSelected = selectedBoxId === box.id
      
      // White cover box
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(box.x, box.y, box.width, box.height)
      
      // Border
      ctx.strokeStyle = isSelected ? '#ec4899' : '#8b5cf6'
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.strokeRect(box.x, box.y, box.width, box.height)
      
      // Label number
      ctx.fillStyle = isSelected ? '#ec4899' : '#8b5cf6'
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText(`${textBoxes.indexOf(box) + 1}`, box.x + 5, box.y + 20)
    })

    // Draw current box being created
    if (currentBox) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.fillRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height)
      
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 3
      ctx.setLineDash([5, 5])
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height)
      ctx.setLineDash([])
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

    setIsDragging(true)
    setDragStart({ x, y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const width = x - dragStart.x
    const height = y - dragStart.y

    setCurrentBox({
      id: Date.now().toString(),
      label: '',
      x: dragStart.x,
      y: dragStart.y,
      width,
      height,
      type: 'rectangle' as const
    })

    drawCanvas()
  }

  const handleMouseUp = () => {
    if (!isDragging || !currentBox) return
    
    setIsDragging(false)
    
    // Only add if box has reasonable size
    if (Math.abs(currentBox.width) > 20 && Math.abs(currentBox.height) > 20) {
      const newBox = {
        ...currentBox,
        label: `Etiket ${textBoxes.length + 1}`,
        // Normalize negative dimensions
        x: currentBox.width < 0 ? currentBox.x + currentBox.width : currentBox.x,
        y: currentBox.height < 0 ? currentBox.y + currentBox.height : currentBox.y,
        width: Math.abs(currentBox.width),
        height: Math.abs(currentBox.height)
      }
      setTextBoxes([...textBoxes, newBox])
      setSelectedBoxId(newBox.id)
    }
    
    setCurrentBox(null)
    drawCanvas()
  }

  const updateBoxLabel = (id: string, label: string) => {
    setTextBoxes(textBoxes.map(b => b.id === id ? { ...b, label } : b))
  }

  const removeBox = (id: string) => {
    setTextBoxes(textBoxes.filter(b => b.id !== id))
    if (selectedBoxId === id) setSelectedBoxId(null)
    setTimeout(drawCanvas, 0)
  }

  const handleSubmit = async () => {
    if (!title || !imageUrl || textBoxes.length === 0) {
      alert('Lütfen tüm alanları doldurun ve en az bir yazı kapatın')
      return
    }

    // Check if all boxes have labels
    const hasEmptyLabels = textBoxes.some(b => !b.label.trim())
    if (hasEmptyLabels) {
      alert('Lütfen tüm kapatılmış alanlara etiket girin')
      return
    }

    setSaving(true)
    try {
      await createImageGame({
        subject_id: selectedSubject || undefined,
        topic_id: selectedTopic || undefined,
        title,
        description,
        image_url: imageUrl,
        regions: textBoxes,
        game_type: 'text-cover'
      })

      alert('✅ Görsel oyun oluşturuldu!')
      
      setTitle('')
      setDescription('')
      setSelectedSubject('')
      setSelectedTopic('')
      setImageUrl('')
      setTextBoxes([])
      
      onReload()
    } catch (error: any) {
      console.error('Error creating game:', error)
      alert('❌ Oyun oluşturulamadı: ' + (error?.message || 'Bilinmeyen hata'))
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    drawCanvas()
  }, [textBoxes, currentBox, selectedBoxId])

  return (
    <>
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Yazı Kapatma Modu:</strong> Görseldeki yazıları beyaz kutucuklarla kapatın. 
            Oyuncular bu kapatılmış alanlara doğru etiketleri sürükleyip bırakacak.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Oyun Başlığı *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-background"
              placeholder="Örn: Göz Anatomisi"
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
              {subjects.map((s: any) => (
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
              {filteredTopics.map((t: any) => (
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

      {imageUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-lg p-4 space-y-4">
              <div className="pb-4 border-b">
                <p className="text-sm text-muted-foreground">
                  🖱️ Görseldeki yazıların üzerine sürükleyerek beyaz kutucuklar çizin
                </p>
              </div>

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

          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-4">
                Kapatılmış Yazılar ({textBoxes.length})
              </h3>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {textBoxes.map((box, index) => (
                  <div
                    key={box.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedBoxId === box.id
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10'
                        : 'border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/5'
                    }`}
                    onClick={() => setSelectedBoxId(box.id)}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-muted-foreground mt-2">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={box.label}
                        onChange={(e) => updateBoxLabel(box.id, e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border rounded bg-background"
                        placeholder="Etiket adı (örn: İris)"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeBox(box.id)
                        }}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {textBoxes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Henüz yazı kapatılmadı.<br/>
                    Görseldeki yazıların üzerine<br/>
                    kutucuk çizin.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving || !title || !imageUrl || textBoxes.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Oluşturuluyor...' : '✨ Oyunu Kaydet'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
