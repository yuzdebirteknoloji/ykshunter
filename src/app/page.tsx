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
import { getSubjects, type Subject } from '@/lib/supabase'
import { LoadingGrid } from '@/components/loading-card'
import { EmptyState } from '@/components/empty-state'
import { toast } from 'sonner'

const stats = {
  totalXP: 0,
  level: 1,
  streak: 0,
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Kullanıcı bilgisini al
      const userRes = await fetch('/api/auth/me')
      const userData = await userRes.json()
      if (userData.user) {
        setUser(userData.user)
      }

      // Dersleri al
      const subjectsData = await getSubjects()
      setSubjects(subjectsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Veriler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 md:p-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Toplam XP</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalXP}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Aktif Seri</p>
                <p className="text-3xl font-bold text-foreground">{stats.streak} gün</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Seviye</p>
                <p className="text-3xl font-bold text-foreground">{stats.level}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>

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

        {loading ? (
          <LoadingGrid count={6} />
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
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
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

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20"
        >
          <h3 className="text-lg font-semibold text-foreground mb-3">
            🚀 Hızlı Başlangıç
          </h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">1.</strong> Bir ders seç
            </p>
            <p>
              <strong className="text-foreground">2.</strong> Öğrenmek istediğin konuyu seç
            </p>
            <p>
              <strong className="text-foreground">3.</strong> Oyun modunu seç ve öğrenmeye başla!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
