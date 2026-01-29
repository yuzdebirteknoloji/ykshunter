'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Info, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'update'
  priority: number
  created_at: string
}

export function AnnouncementsDisplay({ open }: { open: boolean }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadAnnouncements()
    // Dismissed duyuruları localStorage'dan yükle
    const stored = localStorage.getItem('dismissed-announcements')
    if (stored) {
      setDismissed(new Set(JSON.parse(stored)))
    }
  }, [])

  const loadAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements')
      const { data } = await response.json()
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error loading announcements:', error)
    }
  }

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissed)
    newDismissed.add(id)
    setDismissed(newDismissed)
    localStorage.setItem('dismissed-announcements', JSON.stringify([...newDismissed]))
  }

  const typeConfig = {
    info: {
      icon: <Info className="w-4 h-4" />,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20'
    },
    success: {
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20'
    },
    update: {
      icon: <Sparkles className="w-4 h-4" />,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    }
  }

  const visibleAnnouncements = announcements.filter(a => !dismissed.has(a.id))

  if (visibleAnnouncements.length === 0) return null

  return (
    <div className="border-t border-border pt-4 mt-4">
      <AnimatePresence>
        {visibleAnnouncements.map((announcement) => {
          const config = typeConfig[announcement.type]
          
          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={`mb-2 rounded-lg border ${config.border} ${config.bg} overflow-hidden`}
            >
              {open ? (
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className={`flex items-center gap-2 ${config.color}`}>
                      {config.icon}
                      <span className="font-semibold text-sm">{announcement.title}</span>
                    </div>
                    <button
                      onClick={() => handleDismiss(announcement.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {announcement.message}
                  </p>
                </div>
              ) : (
                <div className="p-2 flex items-center justify-center">
                  <div className={config.color}>
                    {config.icon}
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
