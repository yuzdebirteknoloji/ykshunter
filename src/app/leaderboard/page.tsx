'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame } from 'lucide-react'
import { getLeaderboard, type LeaderboardEntry } from '@/lib/supabase'

const PERIODS = [
  { days: 7, label: 'Bu hafta' },
  { days: 30, label: 'Bu ay' },
  { days: 0, label: 'Tüm zamanlar' },
]

const MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const [days, setDays] = useState(7)
  const [rows, setRows] = useState<LeaderboardEntry[]>([])
  const [me, setMe] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d?.user?.id ?? null))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    getLeaderboard(days)
      .then(setRows)
      .catch(() => setError('Liderlik tablosu yüklenemedi'))
      .finally(() => setLoading(false))
  }, [days])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 md:p-10 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-7 h-7 text-yellow-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Liderlik Tablosu</h1>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-lg mb-6">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`py-2 rounded-md text-sm font-medium transition-colors ${
                days === p.days ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-muted-foreground py-10">{error}</p>
        ) : rows.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Henüz kimse oynamamış. İlk sen ol! 🎯</p>
        ) : (
          <div className="space-y-2">
            {rows.map((row, i) => (
              <motion.div
                key={row.user_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border ${
                  row.user_id === me ? 'border-primary bg-primary/5' : 'border-border bg-card'
                }`}
              >
                <div className="w-8 text-center text-lg font-bold text-muted-foreground">
                  {MEDALS[i] ?? i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {row.display_name || row.username}
                    {row.user_id === me && <span className="text-xs text-primary ml-2">(sen)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{row.username} · Level {row.level}
                  </p>
                </div>
                {row.streak_days > 0 && (
                  <div className="flex items-center gap-1 text-orange-500 text-sm">
                    <Flame className="w-4 h-4" />
                    {row.streak_days}
                  </div>
                )}
                <div className="text-right">
                  <p className="font-bold text-foreground">{row.period_xp}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
