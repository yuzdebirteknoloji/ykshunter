'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Play } from 'lucide-react'
import { useSubjects, useTopics, usePrefetchTopics, usePrefetchQuestionSets } from '@/hooks/use-queries'
import type { Subject } from '@/lib/supabase'
import { TopicCardSkeleton } from '@/components/skeleton-loader'
import { EmptyState } from '@/components/empty-state'

export default function TopicsPage() {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects()
  const { data: topics = [], isLoading: topicsLoading } = useTopics(selectedSubject?.id || '')
  
  const prefetchTopics = usePrefetchTopics()
  const prefetchQuestions = usePrefetchQuestionSets()

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0])
      
      // Prefetch other subjects
      subjects.slice(1, 4).forEach(subject => {
        prefetchTopics(subject.id)
      })
    }
  }, [subjects, selectedSubject, prefetchTopics])

  const handleSubjectChange = (subject: Subject) => {
    setSelectedSubject(subject)
  }
  
  const handleSubjectHover = (subject: Subject) => {
    prefetchTopics(subject.id)
  }
  
  const handleTopicHover = (topicId: string) => {
    prefetchQuestions(topicId)
  }

  if (subjectsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-10">
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
                onMouseEnter={() => handleSubjectHover(subject)}
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
        {topicsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <TopicCardSkeleton key={i} />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              Bu ders için henüz konu eklenmemiş.
            </p>
            <Link
              href="/dashboard"
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
                <Link 
                  href={`/topic/${topic.id}`}
                  onMouseEnter={() => handleTopicHover(topic.id)}
                >
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
      </div>
    </div>
  )
}
