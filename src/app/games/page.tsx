'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Download, Smartphone } from 'lucide-react'
import { getSubjects, getTopicsBySubject, type Subject, type Topic } from '@/lib/supabase'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function TopicsPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    loadData()
    
    // Install prompt'u dinle
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Standalone kontrolü
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true
    
    if (!isStandalone) {
      setShowInstallButton(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        
        if (outcome === 'accepted') {
          setShowInstallButton(false)
        }
        
        setDeferredPrompt(null)
      } catch (error) {
        console.error('Install error:', error)
      }
    } else {
      router.push('/settings')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const subjectsData = await getSubjects()
      setSubjects(subjectsData)
      
      if (subjectsData.length > 0) {
        setSelectedSubject(subjectsData[0])
        const topicsData = await getTopicsBySubject(subjectsData[0].id)
        setTopics(topicsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubjectChange = async (subject: Subject) => {
    setSelectedSubject(subject)
    setLoading(true)
    try {
      const topicsData = await getTopicsBySubject(subject.id)
      setTopics(topicsData)
    } catch (error) {
      console.error('Error loading topics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !selectedSubject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-10">
        {/* Install Button */}
        {showInstallButton && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={handleInstall}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] flex items-center justify-center gap-3"
            >
              <Download className="w-5 h-5" />
              <span>Uygulamayı İndir</span>
              <Smartphone className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 md:mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Geri</span>
          </button>

          <div className="flex items-center gap-3 md:gap-4 mb-4">
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">
              Konular
            </h1>
          </div>

          {/* Subject Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => handleSubjectChange(subject)}
                className={`px-3 md:px-4 py-2 rounded-lg border-2 transition-all whitespace-nowrap text-sm md:text-base ${
                  selectedSubject?.id === subject.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {subject.icon} {subject.name}
              </button>
            ))}
          </div>

          {selectedSubject && (
            <p className="text-base md:text-xl text-muted-foreground mt-4">
              {selectedSubject.icon} {selectedSubject.name} • {topics.length} Konu
            </p>
          )}
        </div>

        {/* Topics Grid */}
        {loading ? (
          <div className="text-center text-muted-foreground py-12">
            Konular yükleniyor...
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              Bu ders için henüz konu eklenmemiş.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors text-sm md:text-base"
            >
              Admin Paneline Git
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/topic/${topic.id}`}>
                  <div className="group bg-card rounded-lg p-4 md:p-6 border border-border hover:border-accent transition-all cursor-pointer h-full">
                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-3 md:mb-4">
                      {topic.name}
                    </h3>

                    {/* Game Modes */}
                    <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs border border-blue-500/20">
                        🔗 Eşleştirme
                      </span>
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs border border-purple-500/20">
                        📊 Sıralama
                      </span>
                      <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs border border-green-500/20">
                        📦 Gruplama
                      </span>
                    </div>

                    {/* Play Button */}
                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                      <Play className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm">Oyun Modunu Seç</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 md:mt-8 bg-card rounded-lg p-4 md:p-6 border border-border"
        >
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-3">
            💡 Nasıl Çalışır?
          </h3>
          <div className="text-xs md:text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">1.</strong> Öğrenmek istediğin konuyu seç
            </p>
            <p>
              <strong className="text-foreground">2.</strong> Oyun modunu seç (Eşleştirme, Sıralama veya Gruplama)
            </p>
            <p>
              <strong className="text-foreground">3.</strong> Aynı konuyu farklı şekillerde öğren!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
