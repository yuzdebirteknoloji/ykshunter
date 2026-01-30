'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Play } from 'lucide-react'
import { getTopicById, getQuestionSetsByTopic, getImageGames, type QuestionSet, type ImageGame } from '@/lib/supabase'

export default function TopicDetailPage() {
  const params = useParams()
  const router = useRouter()
  const topicId = params.id as string

  const [topic, setTopic] = useState<any>(null)
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([])
  const [imageGames, setImageGames] = useState<ImageGame[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [topicId])

  const loadData = async () => {
    try {
      const [topicData, setsData, allImageGames] = await Promise.all([
        getTopicById(topicId),
        getQuestionSetsByTopic(topicId),
        getImageGames()
      ])
      
      setTopic(topicData)
      setQuestionSets(setsData)
      
      // Filter image games for this topic
      const topicImageGames = allImageGames.filter(g => g.topic_id === topicId)
      setImageGames(topicImageGames)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Yükleniyor...</div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Konu bulunamadı</h1>
          <button
            onClick={() => router.back()}
            className="text-blue-400 hover:text-blue-300"
          >
            Geri dön
          </button>
        </div>
      </div>
    )
  }

  // Group question sets by mode
  const matchingSets = questionSets.filter(s => s.mode === 'matching')
  const sequenceSets = questionSets.filter(s => s.mode === 'sequence')
  const groupingSets = questionSets.filter(s => s.mode === 'grouping')

  const modes = [
    {
      id: 'matching',
      title: 'Eşleştirme',
      icon: '🔗',
      description: 'Terimleri açıklamalarıyla eşleştir',
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-500/20 hover:border-blue-500/50',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      itemCount: matchingSets.length,
      available: matchingSets.length > 0
    },
    {
      id: 'sequence',
      title: 'Sıralama',
      icon: '📊',
      description: 'Adımları doğru sıraya diz',
      color: 'from-purple-500 to-purple-600',
      borderColor: 'border-purple-500/20 hover:border-purple-500/50',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      itemCount: sequenceSets.length,
      available: sequenceSets.length > 0
    },
    {
      id: 'grouping',
      title: 'Gruplama',
      icon: '📦',
      description: 'Öğeleri kategorilere ayır',
      color: 'from-green-500 to-green-600',
      borderColor: 'border-green-500/20 hover:border-green-500/50',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      itemCount: groupingSets.length,
      available: groupingSets.length > 0
    }
  ]

  // Add image games to modes
  if (imageGames.length > 0) {
    modes.push({
      id: 'image',
      title: 'Görsel Eşleştirme',
      icon: '🖼️',
      description: 'Görseldeki bölgeleri etiketle',
      color: 'from-pink-500 to-rose-600',
      borderColor: 'border-pink-500/20 hover:border-pink-500/50',
      bgColor: 'bg-pink-500/10',
      textColor: 'text-pink-400',
      itemCount: imageGames.length,
      available: true
    } as any)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-10">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 md:mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Konulara Dön</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-3">
              {topic.name}
            </h1>
            {topic.subjects && (
              <p className="text-base md:text-lg text-muted-foreground">
                {topic.subjects.icon} {topic.subjects.name}
              </p>
            )}
          </motion.div>
        </div>

        {/* Mode Selection */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-foreground mb-3 md:mb-4">
            Oyun Modunu Seç
          </h2>
        </div>

        {questionSets.length === 0 && imageGames.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Bu konu için henüz oyun eklenmemiş.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors text-sm md:text-base"
            >
              Admin Paneline Git
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
            {modes.map((mode, index) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  if (!mode.available) return
                  if (mode.id === 'image' && imageGames.length > 0) {
                    // Rastgele bir görsel oyun seç
                    const randomGame = imageGames[Math.floor(Math.random() * imageGames.length)]
                    router.push(`/play-image/${randomGame.id}`)
                  } else {
                    router.push(`/play/${topicId}/${mode.id}`)
                  }
                }}
                className={`group bg-card rounded-lg p-4 md:p-6 border ${mode.borderColor} transition-all ${
                  mode.available 
                    ? 'cursor-pointer hover:shadow-md hover:scale-105' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Icon */}
                <div className="text-4xl md:text-5xl mb-3 md:mb-4">{mode.icon}</div>

                {/* Title */}
                <h3 className={`text-lg md:text-xl font-semibold mb-2 ${mode.textColor}`}>
                  {mode.title}
                </h3>

                {/* Description */}
                <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                  {mode.description}
                </p>

                {/* Item Count */}
                <div className={`inline-flex items-center gap-2 px-2 md:px-3 py-1 ${mode.bgColor} rounded-full text-xs ${mode.textColor}`}>
                  <span>{mode.itemCount} soru seti</span>
                </div>

                {/* Play Button */}
                {mode.available ? (
                  <div className="mt-3 md:mt-4 flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                    <Play className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm font-medium">Başla</span>
                  </div>
                ) : (
                  <div className="mt-3 md:mt-4 text-xs text-muted-foreground">
                    Henüz eklenmedi
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg p-4 md:p-6 border border-border mt-6 md:mt-8"
        >
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-3">
            💡 İpucu
          </h3>
          
          <ul className="mt-3 space-y-2 text-xs md:text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span><strong className="text-foreground">Eşleştirme:</strong> Görsel hafıza ve ilişkilendirme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span><strong className="text-foreground">Sıralama:</strong> Mantıksal düşünme ve süreç anlama</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">•</span>
              <span><strong className="text-foreground">Gruplama:</strong> Sınıflandırma ve kategorizasyon</span>
            </li>
            {imageGames.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-pink-400">•</span>
                <span><strong className="text-foreground">Görsel Eşleştirme:</strong> Görsel tanıma ve etiketleme</span>
              </li>
            )}
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
