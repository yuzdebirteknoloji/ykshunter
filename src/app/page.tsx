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
      <div className="p-4 md:p-10">
        {/* İlerleme */}
        {user && (
          <div className="mb-6 rounded-2xl p-4 md:p-5 text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <p className="text-sm opacity-90 mb-3">
              Merhaba{user.displayName ? `, ${user.displayName}` : ''} 👋
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/15 py-2.5">
                <Star className="w-4 h-4 mx-auto mb-1" />
                <div className="text-lg font-bold leading-none">{user.level || 1}</div>
                <div className="text-[11px] opacity-80 mt-1">Level</div>
              </div>
              <div className="rounded-xl bg-white/15 py-2.5">
                <TrendingUp className="w-4 h-4 mx-auto mb-1" />
                <div className="text-lg font-bold leading-none">{user.totalXp || 0}</div>
                <div className="text-[11px] opacity-80 mt-1">XP</div>
              </div>
              <div className="rounded-xl bg-white/15 py-2.5">
                <Flame className="w-4 h-4 mx-auto mb-1" />
                <div className="text-lg font-bold leading-none">{user.streakDays || 0}</div>
                <div className="text-[11px] opacity-80 mt-1">Günlük seri</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${(user.totalXp || 0) % 100}%` }} />
            </div>
            <p className="text-[11px] opacity-80 mt-1.5">Sonraki level için {100 - ((user.totalXp || 0) % 100)} XP</p>
          </div>
        )}

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
                onClick={() => router.push(`/games?subject=${subject.id}`)}
                className="bg-card rounded-xl p-4 md:p-6 border border-border cursor-pointer group active:scale-[0.99] transition-transform"
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
