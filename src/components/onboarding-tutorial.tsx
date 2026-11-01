'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Copy, X } from 'lucide-react'
import { toast } from 'sonner'
import { IS_LOCAL } from '@/lib/app-mode'
import { GAME_TEMPLATES, buildPrompt, copyText } from '@/lib/notebooklm-prompts'

const STORAGE_KEY = 'ykshunter:onboarding-done'
export const SHOW_TUTORIAL_EVENT = 'ykshunter:show-tutorial'

interface Step {
  emoji: string
  title: string
  body: React.ReactNode
}

function PromptButtons() {
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {GAME_TEMPLATES.map((t) => (
        <button
          key={t.mode}
          onClick={async () => {
            const ok = await copyText(buildPrompt(t))
            ok ? toast.success(`${t.label} promptu kopyalandı`) : toast.error('Kopyalanamadı')
          }}
          className="flex flex-col items-center gap-1 rounded-xl border border-border py-2.5 text-xs font-medium active:bg-accent"
        >
          <span className="text-lg">{t.emoji}</span>
          {t.label}
          <Copy className="w-3 h-3 text-muted-foreground" />
        </button>
      ))}
    </div>
  )
}

const STEPS: Step[] = [
  {
    emoji: '🎯',
    title: "YKS Hunter'a hoş geldin!",
    body: (
      <>
        Konuları oyunlarla çalışırsın: <b>eşleştirme</b>, <b>sıralama</b> ve <b>gruplama</b>. Her oyunda XP kazanır,
        her gün oynayarak serini büyütürsün.
        {IS_LOCAL && (
          <span className="block mt-2">
            Tüm verilerin <b>sadece bu telefonda</b> saklanır, internet gerekmez.
          </span>
        )}
      </>
    ),
  },
  {
    emoji: '📚',
    title: '1. Kaynaklarını NotebookLM’e yükle',
    body: (
      <>
        <b>notebooklm.google.com</b> adresinde yeni bir not defteri aç ve çalışacağın konunun kaynaklarını (PDF,
        ders notu, YouTube videosu) ekle.
      </>
    ),
  },
  {
    emoji: '📋',
    title: '2. Hazır promptu kopyala',
    body: (
      <>
        Hangi oyunu istiyorsan onun promptunu kopyala, NotebookLM sohbetine yapıştır ve en alttaki
        <b> “Konu:”</b> kısmına konuyu yaz. NotebookLM sana uygulamanın anladığı formatta bir JSON verecek.
        <PromptButtons />
        <span className="block mt-2 text-xs">
          Bu butonlar her zaman <b>Admin Paneli → Toplu İçe Aktar</b> sayfasında da var.
        </span>
      </>
    ),
  },
  {
    emoji: '⚡',
    title: '3. JSON’u uygulamaya ekle',
    body: (
      <>
        NotebookLM’in cevabını kopyala. Menüden <b>Admin Paneli → Toplu İçe Aktar</b>’a git, kutuya yapıştır ve
        <b> İçe Aktar</b>’a bas. Ders ve konu yoksa otomatik oluşturulur.
      </>
    ),
  },
  {
    emoji: '🎮',
    title: '4. Oyna!',
    body: (
      <>
        Alt menüden <b>Oyunlar</b>’a gir → dersi seç → konuyu seç → oyun türünü seç. Ayrıca{' '}
        <b>Deneme</b> sekmesine yanlış yaptığın soruların fotoğrafını ve notunu ekleyebilirsin.
        {IS_LOCAL && (
          <span className="block mt-2">
            💾 Ara sıra <b>Ayarlar → Verilerim → Yedek al</b> yapmayı unutma.
          </span>
        )}
      </>
    ),
  },
]

export function OnboardingTutorial() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true)
    } catch {}
    const show = () => {
      setStep(0)
      setOpen(true)
    }
    window.addEventListener(SHOW_TUTORIAL_EVENT, show)
    return () => window.removeEventListener(SHOW_TUTORIAL_EVENT, show)
  }, [])

  const close = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {}
    setOpen(false)
  }

  const isLast = step === STEPS.length - 1
  const s = STEPS[step]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] bg-black/60 flex items-end md:items-center justify-center p-0 md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="relative w-full md:max-w-md bg-background rounded-t-3xl md:rounded-2xl shadow-2xl p-6 pb-safe"
          >
            <button
              onClick={close}
              aria-label="Kapat"
              className="absolute right-3 top-3 h-10 w-10 flex items-center justify-center rounded-full text-muted-foreground active:bg-accent"
            >
              <X className="w-5 h-5" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="min-h-[260px]"
              >
                <div className="text-5xl mb-4">{s.emoji}</div>
                <h2 className="text-xl font-bold mb-2 pr-8">{s.title}</h2>
                <div className="text-[15px] text-muted-foreground leading-relaxed">{s.body}</div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-1.5 my-5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  aria-label={`${i + 1}. adım`}
                  onClick={() => setStep(i)}
                  className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'}`}
                />
              ))}
            </div>

            <div className="flex gap-2 pb-2">
              {step > 0 ? (
                <button onClick={() => setStep(step - 1)} className="flex-1 py-3 rounded-xl border border-border font-medium">
                  Geri
                </button>
              ) : (
                <button onClick={close} className="flex-1 py-3 rounded-xl text-muted-foreground font-medium">
                  Atla
                </button>
              )}
              {isLast ? (
                <button
                  onClick={() => {
                    close()
                    router.push('/dashboard')
                  }}
                  className="flex-[2] py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
                >
                  İlk oyununu ekle
                </button>
              ) : (
                <button onClick={() => setStep(step + 1)} className="flex-[2] py-3 rounded-xl bg-primary text-primary-foreground font-semibold">
                  İleri
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
