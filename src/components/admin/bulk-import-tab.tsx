'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, CheckCircle } from 'lucide-react'
import { getSubjects, getTopicsBySubject, createSubject, createTopic, createQuestionSet } from '@/lib/supabase'
import { toast } from 'sonner'

export function BulkImportTab() {
  const [jsonData, setJsonData] = useState('')
  const [validationError, setValidationError] = useState('')
  const [success, setSuccess] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)

  const exampleJSON = `{
  "subject": "AYT Kimya",
  "topic": "Doğada Karbon",
  "games": [
    {
      "id": "matching_01",
      "title": "Allotrop Eşleştirme",
      "mode": "matching",
      "data": [
        { "key": "Elmas", "value": "En sert doğal madde" },
        { "key": "Grafit", "value": "Elektrik iletir" }
      ]
    }
  ]
}`

  const validateJSON = () => {
    try {
      const parsed = JSON.parse(jsonData)
      if (!parsed.subject || !parsed.topic || !Array.isArray(parsed.games)) {
        setValidationError('JSON formatı hatalı')
        return false
      }
      setValidationError('')
      return true
    } catch (e) {
      setValidationError('Geçersiz JSON')
      return false
    }
  }

  const handleImport = async () => {
    if (!validateJSON()) return
    setImporting(true)
    setImportResult(null)

    try {
      const parsed = JSON.parse(jsonData)
      let subjects = await getSubjects()
      let subject = subjects.find(s => s.name === parsed.subject)
      
      if (!subject) {
        await createSubject(parsed.subject, '📚')
        subjects = await getSubjects()
        subject = subjects.find(s => s.name === parsed.subject)
      }

      if (!subject) throw new Error('Ders oluşturulamadı')

      let topics = await getTopicsBySubject(subject.id)
      let topic = topics.find(t => t.name === parsed.topic)
      
      if (!topic) {
        await createTopic(subject.id, parsed.topic)
        topics = await getTopicsBySubject(subject.id)
        topic = topics.find(t => t.name === parsed.topic)
      }

      if (!topic) throw new Error('Konu oluşturulamadı')

      const results = []
      for (const game of parsed.games) {
        await createQuestionSet(topic.id, game.mode, true, game.data)
        results.push({ id: game.id, title: game.title, mode: game.mode })
      }

      setImportResult({
        subject: parsed.subject,
        topic: parsed.topic,
        gamesCount: results.length,
        games: results
      })
      setSuccess(true)
      setJsonData('')
      toast.success('İçerik başarıyla içe aktarıldı!')
      setTimeout(() => setSuccess(false), 5000)
    } catch (e: any) {
      setValidationError(`Hata: ${e.message}`)
      toast.error('İçe aktarma başarısız')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">⚡ Toplu İçe Aktar</h2>
        <p className="text-sm text-muted-foreground">Bir konu için tüm oyunları tek seferde ekle</p>
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20 mb-6">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-500" />
          Nasıl Kullanılır?
        </h3>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>NotebookLM'e kaynaklarını yükle</li>
          <li>JSON formatını iste</li>
          <li>Gelen JSON'u yapıştır</li>
          <li>İçe Aktar butonuna tıkla</li>
        </ol>
      </div>

      <div className="bg-card rounded-lg p-6 border mb-6">
        <div className="flex items-center justify-between mb-4">
          <label className="font-medium">JSON Verisi</label>
          <button
            onClick={() => setJsonData(exampleJSON)}
            className="text-xs text-primary hover:opacity-80 font-medium px-3 py-1 bg-primary/10 rounded-md"
          >
            📋 Örnek Yükle
          </button>
        </div>
        <textarea
          value={jsonData}
          onChange={(e) => setJsonData(e.target.value)}
          className="w-full h-96 bg-muted border rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          placeholder={exampleJSON}
        />
      </div>

      {validationError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
        >
          ❌ {validationError}
        </motion.div>
      )}

      {success && importResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Başarıyla içe aktarıldı!</span>
          </div>
          <div className="text-sm space-y-1 ml-7">
            <p>📚 Ders: {importResult.subject}</p>
            <p>📖 Konu: {importResult.topic}</p>
            <p>🎮 {importResult.gamesCount} oyun oluşturuldu</p>
          </div>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleImport}
        disabled={importing || !jsonData}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {importing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            İçe Aktarılıyor...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Toplu İçe Aktar
          </>
        )}
      </motion.button>
    </div>
  )
}
