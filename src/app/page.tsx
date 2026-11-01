'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Flame,
  Star,
  TrendingUp,
  Play,
  ChevronRight
} from 'lucide-react'
import { useSubjects, usePrefetchTopics } from '@/hooks/use-queries'
import type { Subject } from '@/lib/supabase'
import { SubjectCardSkeleton } from '@/components/skeleton-loader'
import { EmptyState } from '@/components/empty-state'
import { toast } from 'sonner'
import { fetchMe } from '@/lib/api-client'

const stats = {
  totalXP: 0,
  level: 1,
  streak: 0,
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  
  const { data: subjects = [], isLoading } = useSubjects()
  const prefetchTopics = usePrefetchTopics()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Kullanıcı bilgisini al
    fetchMe().then((u) => u && setUser(u))
  }, [mounted])
  
  useEffect(() => {
    // Prefetch first 3 subjects
    if (subjects.length > 0) {
      subjects.slice(0, 3).forEach(subject => {
        prefetchTopics(subject.id)
      })
    }
  }, [subjects, prefetchTopics])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 md:p-10">
        {/* Dersler */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Derslerim</h2>
            <Link
              href="/games"
              className="flex items-center gap-1 text-primary hover:opacity-80 transition-colors text-sm font-medium"
            >
              Tümünü Gör
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <SubjectCardSkeleton key={i} />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Henüz ders eklenmemiş"
            description="İlk dersini ekleyerek öğrenme yolculuğuna başla!"
            action={
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-medium"
              >
                Admin Paneline Git
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.slice(0, 6).map((subject: Subject, index: number) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                onMouseEnter={() => prefetchTopics(subject.id)}
                onClick={() => router.push('/games')}
                className="bg-card rounded-lg p-6 border border-border cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{subject.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-blue-500 transition-colors">
                        {subject.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Play Button */}
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Konulara Git</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
