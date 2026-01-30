'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { getImageGameById, ImageGame, ImageGameRegion } from '@/lib/supabase'

export default function PlayImageGamePage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string

  const [game, setGame] = useState<ImageGame | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRegions, setSelectedRegions] = useState<{[key: string]: string}>({}) // {regionId: label}
  const [availableLabels, setAvailableLabels] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    loadGame()
  }, [gameId])

  const loadGame = async () => {
    try {
      const gameData = await getImageGameById(gameId)
      setGame(gameData)
      
      // Shuffle labels
      const labels = gameData.regions.map(r => r.label).sort(() => Math.random() - 0.5)
      setAvailableLabels(labels)
      
      // Load image
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        if (imageRef.current) {
          imageRef.current.src = gameData.image_url
        }
        drawCanvas()
      }
      img.src = gameData.image_url
    } catch (error) {
      console.error('Error loading game:', error)
    } finally {
      setLoading(false)
    }
  }

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || !game) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    // Draw regions
    game.regions.forEach((region) => {
      const isSelected = selectedRegions[region.id]
      
      ctx.strokeStyle = isSelected ? '#10b981' : '#6b7280'
      ctx.lineWidth = 3
      ctx.strokeRect(region.x, region.y, region.width, region.height)
      
      if (isSelected) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)'
        ctx.fillRect(region.x, region.y, region.width, region.height)
        
        ctx.fillStyle = '#10b981'
        ctx.font = 'bold 16px sans-serif'
        ctx.fillText(isSelected, region.x + 5, region.y + 20)
      }
    })
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!game || availableLabels.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find clicked region
    const clickedRegion = game.regions.find(region => 
      x >= region.x && x <= region.x + region.width &&
      y >= region.y && y <= region.y + region.height
    )

    if (clickedRegion && !selectedRegions[clickedRegion.id]) {
      // Assign first available label
      const label = availableLabels[0]
      setSelectedRegions({ ...selectedRegions, [clickedRegion.id]: label })
      setAvailableLabels(availableLabels.slice(1))
    }
  }

  const removeSelection = (regionId: string) => {
    const label = selectedRegions[regionId]
    const newSelections = { ...selectedRegions }
    delete newSelections[regionId]
    setSelectedRegions(newSelections)
    setAvailableLabels([...availableLabels, label])
  }

  const handleSubmit = () => {
    if (!game) return

    let correct = 0
    game.regions.forEach(region => {
      if (selectedRegions[region.id] === region.label) {
        correct++
      }
    })

    setScore(Math.round((correct / game.regions.length) * 100))
    setShowResult(true)
  }

  const handleReset = () => {
    if (!game) return
    
    setSelectedRegions({})
    const labels = game.regions.map(r => r.label).sort(() => Math.random() - 0.5)
    setAvailableLabels(labels)
    setShowResult(false)
    setScore(0)
    drawCanvas()
  }

  useEffect(() => {
    drawCanvas()
  }, [selectedRegions, game])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Yükleniyor...</div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Oyun bulunamadı</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Geri Dön
          </button>
        </div>
      </div>
    )
  }

  const progress = (Object.keys(selectedRegions).length / game.regions.length) * 100

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-10">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri</span>
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">{game.title}</h1>
            {game.description && (
              <p className="text-muted-foreground">{game.description}</p>
            )}
            
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 bg-muted rounded-full h-2 max-w-xs">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Görseldeki bölgelere tıklayarak etiketleri eşleştirin
              </p>
              <div className="relative inline-block">
                <img
                  ref={imageRef}
                  src={game.image_url}
                  alt={game.title}
                  className="hidden"
                />
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="border cursor-pointer max-w-full"
                />
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Etiketler</h3>
              <div className="space-y-2">
                {availableLabels.map((label, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded-lg text-center font-medium"
                  >
                    {label}
                  </div>
                ))}
                {availableLabels.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Tüm etiketler kullanıldı
                  </p>
                )}
              </div>
            </div>

            {/* Selected */}
            {Object.keys(selectedRegions).length > 0 && (
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Seçilenler</h3>
                <div className="space-y-2">
                  {Object.entries(selectedRegions).map(([regionId, label]) => (
                    <div
                      key={regionId}
                      className="flex items-center justify-between px-3 py-2 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-lg text-sm"
                    >
                      <span>{label}</span>
                      <button
                        onClick={() => removeSelection(regionId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedRegions).length !== game.regions.length}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
            >
              Cevabı Gönder
            </button>
          </div>
        </div>

        {/* Result Modal */}
        {showResult && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border rounded-lg p-8 max-w-md w-full"
            >
              <h2 className="text-3xl font-bold text-center mb-6">
                {score === 100 ? '🎉 Mükemmel!' : score >= 70 ? '👍 İyi!' : '💪 Tekrar Dene'}
              </h2>
              
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-primary mb-2">{score}%</div>
                <div className="text-muted-foreground">Doğruluk Oranı</div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700"
                >
                  ↻ Tekrar Oyna
                </button>
                <button
                  onClick={() => router.back()}
                  className="flex-1 bg-neutral-700 text-white py-3 rounded-lg font-semibold hover:bg-neutral-600"
                >
                  ← Geri Dön
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
