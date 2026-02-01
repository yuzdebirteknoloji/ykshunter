'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { getImageGameById, ImageGame, ImageGameRegion, getImageGamesByTopic } from '@/lib/supabase'

export default function PlayImageGamePage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string

  const [game, setGame] = useState<ImageGame | null>(null)
  const [allGames, setAllGames] = useState<ImageGame[]>([])
  const [currentGameIndex, setCurrentGameIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedRegions, setSelectedRegions] = useState<{[key: string]: string}>({})
  const [availableLabels, setAvailableLabels] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false)
  const [score, setScore] = useState(0)
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  
  // Renk paleti
  const colors = [
    { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.25)', text: '#dc2626' },
    { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.25)', text: '#d97706' },
    { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.25)', text: '#059669' },
    { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.25)', text: '#2563eb' },
    { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.25)', text: '#7c3aed' },
    { stroke: '#ec4899', fill: 'rgba(236, 72, 153, 0.25)', text: '#db2777' },
    { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.25)', text: '#0891b2' },
    { stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.25)', text: '#ea580c' },
  ]
  
  const getRegionColor = (regionId: string) => {
    const index = Object.keys(selectedRegions).indexOf(regionId)
    return colors[index % colors.length]
  }

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    loadGame()
  }, [gameId])

  const loadGame = async () => {
    try {
      const gameData = await getImageGameById(gameId)
      
      // Load all games from same topic if available
      let allGamesData: ImageGame[] = [gameData]
      if (gameData.topic_id) {
        try {
          const topicGames = await getImageGamesByTopic(gameData.topic_id)
          if (topicGames.length > 1) {
            // Shuffle games
            allGamesData = topicGames.sort(() => Math.random() - 0.5)
          }
        } catch (err) {
          console.log('Could not load topic games:', err)
        }
      }
      
      setGame(gameData)
      setAllGames(allGamesData)
      setCurrentGameIndex(allGamesData.findIndex(g => g.id === gameId))
      
      const labels = gameData.regions.map(r => r.label).sort(() => Math.random() - 0.5)
      setAvailableLabels(labels)
      
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

  const handleNextGame = () => {
    const nextIndex = (currentGameIndex + 1) % allGames.length
    setCurrentGameIndex(nextIndex)
    const nextGame = allGames[nextIndex]
    setGame(nextGame)
    setSelectedRegions({})
    const labels = nextGame.regions.map(r => r.label).sort(() => Math.random() - 0.5)
    setAvailableLabels(labels)
    setShowResult(false)
    setShowCorrectAnswers(false)
    setScore(0)
    setSelectedLabel(null)
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (imageRef.current) {
        imageRef.current.src = nextGame.image_url
      }
      drawCanvas()
    }
    img.src = nextGame.image_url
  }

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || !game) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Use natural image size for canvas
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    
    // No scaling needed - 1:1 ratio
    const scaleX = 1
    const scaleY = 1
    
    // Draw image at full size
    ctx.drawImage(img, 0, 0)

    // Check if this is text-cover mode
    const isTextCoverMode = game.game_type === 'text-cover'

    game.regions.forEach((region) => {
      const isSelected = !!selectedRegions[region.id]
      const isHovered = hoveredRegion === region.id
      const isCorrect = showCorrectAnswers && selectedRegions[region.id] === region.label
      const isWrong = showCorrectAnswers && selectedRegions[region.id] && selectedRegions[region.id] !== region.label
      const color = isSelected ? getRegionColor(region.id) : null
      
      if (region.type === 'polygon' && region.points && region.points.length > 0) {
        ctx.beginPath()
        ctx.moveTo(region.points[0].x, region.points[0].y)
        for (let i = 1; i < region.points.length; i++) {
          ctx.lineTo(region.points[i].x, region.points[i].y)
        }
        ctx.closePath()
        
        // For text-cover mode, draw opaque white background to cover text completely
        if (isTextCoverMode && !showCorrectAnswers) {
          // Use source-over to ensure complete coverage
          ctx.globalCompositeOperation = 'source-over'
          ctx.fillStyle = '#ffffff'
          ctx.fill()
          // Add multiple layers for better coverage
          ctx.fill()
          // Add a subtle border
          ctx.strokeStyle = '#d1d5db'
          ctx.lineWidth = 1
          ctx.stroke()
        }
        
        if (showCorrectAnswers) {
          if (isCorrect) {
            ctx.strokeStyle = '#10b981'
            ctx.lineWidth = 4
            ctx.stroke()
            ctx.fillStyle = 'rgba(16, 185, 129, 0.25)'
            ctx.fill()
          } else if (isWrong) {
            ctx.strokeStyle = '#ef4444'
            ctx.lineWidth = 4
            ctx.stroke()
            ctx.fillStyle = 'rgba(239, 68, 68, 0.25)'
            ctx.fill()
          } else {
            ctx.strokeStyle = '#10b981'
            ctx.lineWidth = 3
            ctx.setLineDash([5, 5])
            ctx.stroke()
            ctx.setLineDash([])
          }
          
          ctx.fillStyle = isCorrect ? '#10b981' : '#ef4444'
          ctx.font = 'bold 16px sans-serif'
          ctx.fillText(region.label, region.points[0].x + 5, region.points[0].y + 20)
        } else if (isSelected && color) {
          ctx.strokeStyle = color.stroke
          ctx.lineWidth = 4
          ctx.stroke()
          if (!isTextCoverMode) {
            ctx.fillStyle = color.fill
            ctx.fill()
          }
          
          ctx.fillStyle = color.text
          ctx.font = 'bold 16px sans-serif'
          ctx.fillText(selectedRegions[region.id], region.points[0].x + 5, region.points[0].y + 20)
        } else if (isHovered) {
          ctx.strokeStyle = '#fbbf24'
          ctx.lineWidth = 4
          ctx.stroke()
          if (!isTextCoverMode) {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.3)'
            ctx.fill()
          }
        } else {
          ctx.strokeStyle = '#9ca3af'
          ctx.lineWidth = 3
          ctx.stroke()
        }
      } else {
        // For text-cover mode, draw opaque white background to cover text completely
        if (isTextCoverMode && !showCorrectAnswers) {
          // Use source-over to ensure complete coverage
          ctx.globalCompositeOperation = 'source-over'
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(region.x, region.y, region.width, region.height)
          // Add multiple layers for better coverage
          ctx.fillRect(region.x, region.y, region.width, region.height)
          // Add a subtle border
          ctx.strokeStyle = '#d1d5db'
          ctx.lineWidth = 1
          ctx.strokeRect(region.x, region.y, region.width, region.height)
        }
        
        if (showCorrectAnswers) {
          if (isCorrect) {
            ctx.strokeStyle = '#10b981'
            ctx.lineWidth = 4
            ctx.strokeRect(region.x, region.y, region.width, region.height)
            ctx.fillStyle = 'rgba(16, 185, 129, 0.25)'
            ctx.fillRect(region.x, region.y, region.width, region.height)
          } else if (isWrong) {
            ctx.strokeStyle = '#ef4444'
            ctx.lineWidth = 4
            ctx.strokeRect(region.x, region.y, region.width, region.height)
            ctx.fillStyle = 'rgba(239, 68, 68, 0.25)'
            ctx.fillRect(region.x, region.y, region.width, region.height)
          } else {
            ctx.strokeStyle = '#10b981'
            ctx.lineWidth = 3
            ctx.setLineDash([5, 5])
            ctx.strokeRect(region.x, region.y, region.width, region.height)
            ctx.setLineDash([])
          }
          
          ctx.fillStyle = isCorrect ? '#10b981' : '#ef4444'
          ctx.font = 'bold 16px sans-serif'
          ctx.fillText(region.label, region.x + 5, region.y + 20)
        } else if (isSelected && color) {
          ctx.strokeStyle = color.stroke
          ctx.lineWidth = 4
          ctx.strokeRect(region.x, region.y, region.width, region.height)
          if (!isTextCoverMode) {
            ctx.fillStyle = color.fill
            ctx.fillRect(region.x, region.y, region.width, region.height)
          }
          
          ctx.fillStyle = color.text
          ctx.font = 'bold 16px sans-serif'
          ctx.fillText(selectedRegions[region.id], region.x + 5, region.y + 20)
        } else if (isHovered) {
          ctx.strokeStyle = '#fbbf24'
          ctx.lineWidth = 4
          ctx.strokeRect(region.x, region.y, region.width, region.height)
          if (!isTextCoverMode) {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.3)'
            ctx.fillRect(region.x, region.y, region.width, region.height)
          }
        } else {
          ctx.strokeStyle = '#9ca3af'
          ctx.lineWidth = 3
          ctx.strokeRect(region.x, region.y, region.width, region.height)
        }
      }
    })
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!game) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const region = game.regions.find(r => {
      if (r.type === 'polygon' && r.points && r.points.length > 0) {
        let inside = false
        for (let i = 0, j = r.points.length - 1; i < r.points.length; j = i++) {
          const xi = r.points[i].x
          const yi = r.points[i].y
          const xj = r.points[j].x
          const yj = r.points[j].y
          const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
          if (intersect) inside = !inside
        }
        return inside
      } else {
        return x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height
      }
    })

    if (region?.id !== hoveredRegion) {
      setHoveredRegion(region?.id || null)
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!game || !selectedLabel) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Find which region was clicked
    const region = game.regions.find(r => {
      if (r.type === 'polygon' && r.points && r.points.length > 0) {
        let inside = false
        for (let i = 0, j = r.points.length - 1; i < r.points.length; j = i++) {
          const xi = r.points[i].x
          const yi = r.points[i].y
          const xj = r.points[j].x
          const yj = r.points[j].y
          const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
          if (intersect) inside = !inside
        }
        return inside
      } else {
        return x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height
      }
    })

    if (region && !selectedRegions[region.id]) {
      setSelectedRegions({ ...selectedRegions, [region.id]: selectedLabel })
      setAvailableLabels(availableLabels.filter(l => l !== selectedLabel))
      setSelectedLabel(null)
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
    setShowCorrectAnswers(false)
    setScore(0)
    setSelectedLabel(null)
    drawCanvas()
  }

  useEffect(() => {
    drawCanvas()
  }, [selectedRegions, game, showCorrectAnswers, hoveredRegion])

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
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-10">
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri</span>
          </button>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{game.title}</h1>
              
              {/* Sonraki Oyun Butonu */}
              {allGames.length > 1 && (
                <button
                  onClick={handleNextGame}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 transition-all shadow-md text-xs md:text-sm whitespace-nowrap"
                  title="Oyunu bitirmeden sonraki oyuna geç"
                >
                  <span className="hidden sm:inline">🖼️ Sonraki Oyun</span>
                  <span className="sm:hidden">🖼️</span>
                  <span className="text-xs opacity-80">
                    {currentGameIndex + 1}/{allGames.length}
                  </span>
                </button>
              )}
            </div>
            
            {game.description && <p className="text-muted-foreground">{game.description}</p>}
            
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-card border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-4">
                💡 {selectedLabel ? `"${selectedLabel}" etiketini yerleştirmek için görseldeki bölgeye tıklayın` : 'Önce bir etiket seçin, sonra görseldeki bölgeye tıklayın'}
              </p>
              <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4">
                <img ref={imageRef} src={game.image_url} alt={game.title} className="hidden" crossOrigin="anonymous" />
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={() => setHoveredRegion(null)}
                  className="shadow-lg cursor-pointer"
                  style={{ 
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Etiketler ({availableLabels.length})</h3>
              <div className="space-y-2">
                {availableLabels.map((label, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedLabel(label)}
                    className={`w-full px-4 py-3 rounded-lg text-center font-medium cursor-pointer hover:shadow-md transition-all border-2 ${
                      selectedLabel === label
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-600 scale-105'
                        : 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-500/20 dark:to-pink-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {availableLabels.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Tüm etiketler yerleştirildi ✓
                  </p>
                )}
              </div>
            </div>

            {Object.keys(selectedRegions).length > 0 && (
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Yerleştirilenler</h3>
                <div className="space-y-2">
                  {Object.entries(selectedRegions).map(([regionId, label]) => {
                    const color = getRegionColor(regionId)
                    return (
                      <div
                        key={regionId}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm border-2 transition-all"
                        style={{
                          backgroundColor: color.fill,
                          borderColor: color.stroke,
                          color: color.text
                        }}
                      >
                        <span className="font-medium">{label}</span>
                        <button
                          onClick={() => removeSelection(regionId)}
                          className="hover:scale-110 transition-transform font-bold"
                          style={{ color: color.stroke }}
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedRegions).length !== game.regions.length}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cevabı Gönder
            </button>
          </div>
        </div>

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

              <div className="flex flex-col gap-3">
                {score < 100 && !showCorrectAnswers && (
                  <button
                    onClick={() => {
                      setShowResult(false)
                      setShowCorrectAnswers(true)
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700"
                  >
                    👁️ Doğru Cevapları Göster
                  </button>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleReset}
                    className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700"
                  >
                    ↻ Tekrar Oyna
                  </button>
                  <button
                    onClick={() => router.back()}
                    className="bg-neutral-700 text-white py-3 rounded-lg font-semibold hover:bg-neutral-600"
                  >
                    ← Geri Dön
                  </button>
                </div>
                
                {allGames.length > 1 && (
                  <button
                    onClick={handleNextGame}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700"
                  >
                    ➡️ Sonraki Oyun ({currentGameIndex + 1}/{allGames.length})
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
