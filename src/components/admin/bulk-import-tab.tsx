'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle, Copy, ChevronDown, ClipboardPaste, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { getSubjects, getTopicsBySubject, createSubject, createTopic, createQuestionSet } from '@/lib/supabase'
import { notifyContentChanged } from '@/lib/content-events'
import {
  GAME_TEMPLATES,
  buildPrompt,
  exampleJson,
  copyText,
  parseImportText,
  type ImportPackage,
} from '@/lib/notebooklm-prompts'

const MODE_LABEL: Record<string, string> = { sequence: 'Sıralama', matching: 'Eşleştirme', grouping: 'Gruplama' }
const same = (a: string, b: string) => a.trim().toLocaleLowerCase('tr') === b.trim().toLocaleLowerCase('tr')

interface ImportedTopic {
  subject: string
  topic: string
  topicId: string
  games: { title: string; mode: string }[]
}

export function BulkImportTab() {
  const queryClient = useQueryClient()
  const [jsonData, setJsonData] = useState('')
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportedTopic[] | null>(null)
  const [openExample, setOpenExample] = useState<string | null>(null)

  const handleCopyPrompt = async (mode: string) => {
    const t = GAME_TEMPLATES.find((x) => x.mode === mode)!
    const ok = await copyText(buildPrompt(t))
    if (ok) toast.success(`${t.label} promptu kopyalandı. NotebookLM sohbetine yapıştır.`)
    else toast.error('Kopyalanamadı. Örneği açıp elle seçebilirsin.')
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setJsonData(text)
      else toast.info('Panoda metin yok')
    } catch {
      toast.info('Kutuya uzun basıp "Yapıştır"ı seç')
    }
  }

  const importPackage = async (pkg: ImportPackage): Promise<ImportedTopic> => {
    let subject = (await getSubjects()).find((s) => same(s.name, pkg.subject))
    if (!subject) subject = await createSubject(pkg.subject, '📚')
    if (!subject) throw new Error('Ders oluşturulamadı')

    let topic = (await getTopicsBySubject(subject.id)).find((t) => same(t.name, pkg.topic))
    if (!topic) topic = await createTopic(subject.id, pkg.topic)
    if (!topic) throw new Error('Konu oluşturulamadı')

    for (const game of pkg.games) {
      await createQuestionSet(topic.id, game.mode, true, game.data)
    }
    return {
      subject: subject.name,
      topic: topic.name,
      topicId: topic.id,
      games: pkg.games.map((g) => ({ title: g.title || MODE_LABEL[g.mode], mode: g.mode })),
    }
  }

  const handleImport = async () => {
    setError('')
    setResult(null)
    let packages: ImportPackage[]
    try {
      packages = parseImportText(jsonData)
    } catch (e: any) {
      setError(e.message)
      return
    }

    setImporting(true)
    try {
      const imported: ImportedTopic[] = []
      for (const pkg of packages) imported.push(await importPackage(pkg))
      setResult(imported)
      setJsonData('')
      notifyContentChanged()
      queryClient.invalidateQueries()
      const total = imported.reduce((n, r) => n + r.games.length, 0)
      toast.success(`${total} oyun eklendi!`)
    } catch (e: any) {
      setError(`İçe aktarma sırasında hata: ${e.message}`)
      toast.error('İçe aktarma başarısız')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-1">⚡ Toplu İçe Aktar</h2>
        <p className="text-sm text-muted-foreground">NotebookLM ile hazırladığın oyunları tek seferde ekle</p>
      </div>

      {/* Adımlar */}
      <div className="rounded-xl p-4 border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <h3 className="font-semibold mb-2">Nasıl yapılır?</h3>
        <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal pl-5">
          <li>NotebookLM'de not defteri aç, ders kaynaklarını (PDF, not, video) yükle.</li>
          <li>Aşağıdan istediğin oyun türünün <b>promptunu kopyala</b>.</li>
          <li>NotebookLM sohbetine yapıştır, en alttaki <b>Konu:</b> kısmına konuyu yaz, gönder.</li>
          <li>Gelen cevabı (JSON) kopyala, aşağıdaki kutuya yapıştır ve <b>İçe Aktar</b>'a bas.</li>
          <li>Oyunlar sekmesinde ders → konu → oyun türünü seçip oyna.</li>
        </ol>
      </div>

      {/* Şablonlar */}
      <div className="grid gap-3 md:grid-cols-3">
        {GAME_TEMPLATES.map((t) => (
          <div key={t.mode} className="rounded-xl border border-border bg-card p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{t.emoji}</span>
              <span className="font-semibold">{t.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{t.description}</p>
            <button
              onClick={() => handleCopyPrompt(t.mode)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium active:opacity-80"
            >
              <Copy className="w-4 h-4" />
              Promptu kopyala
            </button>
            <button
              onClick={() => setOpenExample(openExample === t.mode ? null : t.mode)}
              className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground py-1.5"
            >
              Örnek JSON
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openExample === t.mode ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {openExample === t.mode && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <pre className="mt-1 max-h-64 overflow-auto rounded-lg bg-muted p-3 text-[11px] leading-relaxed whitespace-pre-wrap break-words">
                    {exampleJson(t)}
                  </pre>
                  <button
                    onClick={() => {
                      setJsonData(exampleJson(t))
                      toast.info('Örnek kutuya yazıldı. İçe Aktar ile deneyebilirsin.')
                    }}
                    className="mt-2 w-full text-xs py-2 rounded-lg border border-border active:bg-accent"
                  >
                    Bu örneği kutuya koy
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Yapıştırma alanı */}
      <div className="bg-card rounded-xl p-4 border">
        <div className="flex items-center justify-between mb-3 gap-2">
          <label className="font-medium">NotebookLM'den gelen JSON</label>
          <button onClick={handlePaste} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-primary/10 text-primary">
            <ClipboardPaste className="w-3.5 h-3.5" />
            Yapıştır
          </button>
        </div>
        <textarea
          value={jsonData}
          onChange={(e) => setJsonData(e.target.value)}
          className="w-full h-64 md:h-80 bg-muted border rounded-lg px-3 py-3 font-mono text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
          placeholder={'{\n  "subject": "AYT Biyoloji",\n  "topic": "…",\n  "games": [ … ]\n}'}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Birden fazla JSON'u art arda yapıştırabilirsin; ```json işaretleri otomatik temizlenir.
        </p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
          ❌ {error}
        </motion.div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3 text-green-700 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Başarıyla içe aktarıldı!</span>
          </div>
          <div className="space-y-3">
            {result.map((r) => (
              <div key={r.topicId} className="text-sm">
                <p className="font-medium">
                  📚 {r.subject} → 📖 {r.topic}
                </p>
                <ul className="text-muted-foreground ml-6 list-disc">
                  {r.games.map((g, i) => (
                    <li key={i}>
                      {g.title} <span className="text-xs">({MODE_LABEL[g.mode]})</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/topic?id=${r.topicId}`}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium"
                >
                  Hemen oyna <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <button
        onClick={handleImport}
        disabled={importing || !jsonData.trim()}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
      >
        {importing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            İçe aktarılıyor...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            İçe Aktar
          </>
        )}
      </button>
    </div>
  )
}
