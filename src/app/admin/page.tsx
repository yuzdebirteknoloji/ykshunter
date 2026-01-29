'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus,
  Edit,
  Trash2,
  Save,
  Upload,
  CheckCircle
} from 'lucide-react'
import { 
  getSubjects, 
  getTopicsBySubject,
  createSubject,
  createTopic,
  createQuestionSet,
  type Subject,
  type Topic,
  type GameMode
} from '@/lib/supabase'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'subjects' | 'topics' | 'questions' | 'bulk-import'>('subjects')

  return (
    <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
  )
}

const AdminDashboard = ({ activeTab, setActiveTab }: any) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 md:p-6 lg:p-10">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">YKS Flow-Learn Admin</h1>
          <p className="text-sm md:text-base text-muted-foreground">NotebookLM → JSON → Oyun</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 md:mb-8 border-b border-border overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'subjects'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            📚 Dersler
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'topics'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            📖 Konular
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'questions'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            🎮 Soru Setleri
          </button>
          <button
            onClick={() => setActiveTab('bulk-import')}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'bulk-import'
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            ⚡ Toplu İçe Aktar
          </button>
        </div>

        {/* Content */}
        {activeTab === 'subjects' && <SubjectsTab />}
        {activeTab === 'topics' && <TopicsTab />}
        {activeTab === 'questions' && <QuestionsTab />}
        {activeTab === 'bulk-import' && <BulkImportTab />}
      </div>
    </div>
  )
}

const SubjectsTab = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSubject, setNewSubject] = useState({ name: '', icon: '' })

  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    const data = await getSubjects()
    setSubjects(data)
  }

  const handleAdd = async () => {
    if (!newSubject.name || !newSubject.icon) return
    await createSubject(newSubject.name, newSubject.icon)
    setNewSubject({ name: '', icon: '' })
    setShowAddForm(false)
    loadSubjects()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">Dersler</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-colors text-sm md:text-base w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Hızlı Ekle
        </motion.button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-lg p-4 md:p-6 border border-border mb-6 shadow-sm"
        >
          <h3 className="text-foreground font-semibold mb-4 text-base md:text-lg">Yeni Ders</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Ders Adı</label>
              <input
                type="text"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                placeholder="Örn: AYT Biyoloji"
                className="w-full bg-muted border border-border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">İkon (Emoji)</label>
              <input
                type="text"
                value={newSubject.icon}
                onChange={(e) => setNewSubject({ ...newSubject, icon: e.target.value })}
                placeholder="🧬"
                className="w-full bg-muted border border-border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAdd}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-colors text-sm md:text-base"
              >
                <Save className="w-4 h-4" />
                Kaydet
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-colors text-sm md:text-base"
              >
                İptal
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {subjects.map((subject) => (
          <motion.div
            key={subject.id}
            whileHover={{ y: -2 }}
            className="bg-card rounded-lg p-4 md:p-6 border border-border shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl md:text-4xl">{subject.icon}</div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">{subject.name}</h3>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-2 md:px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-colors text-xs md:text-sm font-medium">
                <Edit className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Düzenle</span>
              </button>
              <button className="px-2 md:px-3 py-2 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 transition-colors">
                <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const TopicsTab = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [topics, setTopics] = useState<Topic[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTopic, setNewTopic] = useState('')

  useEffect(() => {
    loadSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      loadTopics()
    }
  }, [selectedSubject])

  const loadSubjects = async () => {
    const data = await getSubjects()
    setSubjects(data)
    if (data.length > 0) setSelectedSubject(data[0].id)
  }

  const loadTopics = async () => {
    const data = await getTopicsBySubject(selectedSubject)
    setTopics(data)
  }

  const handleAdd = async () => {
    if (!newTopic || !selectedSubject) return
    await createTopic(selectedSubject, newTopic)
    setNewTopic('')
    setShowAddForm(false)
    loadTopics()
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">Konular</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-colors shadow-sm text-sm md:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Hızlı Ekle
          </motion.button>
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full bg-muted border border-border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
        >
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.icon} {subject.name}
            </option>
          ))}
        </select>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-lg p-4 md:p-6 border border-border mb-6 shadow-sm"
        >
          <h3 className="text-foreground font-semibold mb-4 text-base md:text-lg">Yeni Konu</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Konu Adı</label>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Örn: Sinir Sistemi"
                className="w-full bg-muted border border-border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAdd}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-colors text-sm md:text-base"
              >
                <Save className="w-4 h-4" />
                Kaydet
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-colors text-sm md:text-base"
              >
                İptal
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-2 md:space-y-3">
        {topics.map((topic) => (
          <motion.div
            key={topic.id}
            whileHover={{ x: 2 }}
            className="bg-card rounded-lg p-3 md:p-4 border border-border flex items-center justify-between shadow-sm"
          >
            <div>
              <h3 className="text-foreground font-medium text-sm md:text-base">{topic.name}</h3>
            </div>
            <div className="flex gap-2">
              <button className="px-2 md:px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-colors">
                <Edit className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              <button className="px-2 md:px-3 py-2 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 transition-colors">
                <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const QuestionsTab = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [mode, setMode] = useState<GameMode>('sequence')
  const [isRandom, setIsRandom] = useState(true)
  const [jsonData, setJsonData] = useState('')
  const [validationError, setValidationError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      loadTopics()
    }
  }, [selectedSubject])

  const loadSubjects = async () => {
    const data = await getSubjects()
    setSubjects(data)
    if (data.length > 0) setSelectedSubject(data[0].id)
  }

  const loadTopics = async () => {
    const data = await getTopicsBySubject(selectedSubject)
    setTopics(data)
    if (data.length > 0) setSelectedTopic(data[0].id)
  }

  const validateJSON = () => {
    try {
      const parsed = JSON.parse(jsonData)
      
      if (!Array.isArray(parsed)) {
        setValidationError('JSON bir array olmalı')
        return false
      }

      if (mode === 'sequence') {
        if (!parsed.every(item => typeof item === 'string')) {
          setValidationError('Sequence modu için array elemanları string olmalı')
          return false
        }
      } else if (mode === 'grouping') {
        if (!parsed.every(item => item.item && item.category)) {
          setValidationError('Grouping modu için her eleman {item, category} formatında olmalı')
          return false
        }
      } else if (mode === 'matching') {
        if (!parsed.every(item => item.key && item.value)) {
          setValidationError('Matching modu için her eleman {key, value} formatında olmalı')
          return false
        }
      }

      setValidationError('')
      return true
    } catch (e) {
      setValidationError('Geçersiz JSON formatı')
      return false
    }
  }

  const handleSave = async () => {
    if (!selectedTopic) {
      setValidationError('Lütfen bir konu seçin')
      return
    }

    if (!validateJSON()) return

    try {
      const parsed = JSON.parse(jsonData)
      await createQuestionSet(selectedTopic, mode, isRandom, parsed)
      setSuccess(true)
      setJsonData('')
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setValidationError('Kayıt sırasında hata oluştu')
    }
  }

  const exampleData = {
    sequence: `["DNA'nın ilgili gen bölgesinin açılması", "mRNA sentezi (Transkripsiyon)", "mRNA'nın çekirdekten sitoplazmaya geçmesi", "mRNA'nın ribozomun küçük alt birimine bağlanması"]`,
    grouping: `[{"item": "Kalsitonin", "category": "Tiroit"}, {"item": "İnsülin", "category": "Pankreas"}, {"item": "Kortizol", "category": "Böbrek Üstü"}]`,
    matching: `[{"key": "Mitokondri", "value": "ATP Sentezi"}, {"key": "Ribozom", "value": "Protein Sentezi"}, {"key": "Lizozom", "value": "Hücre İçi Sindirim"}]`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">Soru Setleri - JSON Gateway</h2>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* NotebookLM Guide */}
        <div className="bg-primary/5 rounded-lg p-4 md:p-6 border border-primary/20">
          <h3 className="text-foreground font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
            <Upload className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            NotebookLM Komut Şablonu
          </h3>
          <p className="text-muted-foreground text-xs md:text-sm mb-3">
            NotebookLM'e kaynakları yükledikten sonra bu komutu kullan:
          </p>
          <div className="bg-muted border border-border rounded-lg p-3 md:p-4 font-mono text-xs md:text-sm text-foreground shadow-sm overflow-x-auto">
            "Yüklediğim dokümanlardaki <strong className="text-primary">[KONU ADI]</strong> konusunu analiz et. 
            Bana <strong className="text-primary">{mode}</strong> formatına uygun, sadece saf JSON kodu içeren bir liste hazırla. 
            JSON dışında hiçbir açıklama metni ekleme."
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-card rounded-lg p-4 md:p-6 border border-border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
            <div>
              <label className="block text-xs md:text-sm text-muted-foreground mb-2">Ders</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.icon} {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs md:text-sm text-muted-foreground mb-2">Konu</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 md:px-4 py-2 text-sm md:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              >
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 md:mb-6">
            <label className="block text-xs md:text-sm text-muted-foreground mb-3">Oyun Modu</label>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <button
                onClick={() => setMode('sequence')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  mode === 'sequence'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <div className="text-2xl mb-2">📝</div>
                <div className="font-semibold">Sıralama</div>
                <div className="text-xs mt-1">Sequence</div>
              </button>

              <button
                onClick={() => setMode('grouping')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  mode === 'grouping'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <div className="text-2xl mb-2">🗂️</div>
                <div className="font-semibold">Gruplandırma</div>
                <div className="text-xs mt-1">Grouping</div>
              </button>

              <button
                onClick={() => setMode('matching')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  mode === 'matching'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <div className="text-2xl mb-2">🔗</div>
                <div className="font-semibold">Eşleştirme</div>
                <div className="text-xs mt-1">Matching</div>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={isRandom}
                onChange={(e) => setIsRandom(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Soruları rastgele sırala (Seterra etkisi)</span>
            </label>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-muted-foreground">JSON Verisi</label>
              <button
                onClick={() => setJsonData(exampleData[mode])}
                className="text-xs text-primary hover:opacity-80 font-medium"
              >
                Örnek Yükle
              </button>
            </div>
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className="w-full h-64 bg-muted border border-border rounded-lg px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none shadow-inner"
              placeholder={exampleData[mode]}
            />
          </div>

          {validationError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {validationError}
            </div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Soru seti başarıyla kaydedildi!
            </motion.div>
          )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-colors shadow-sm"
            >
            <Save className="w-4 h-4" />
            Hızlı Kaydet
          </motion.button>
        </div>
      </div>
    </div>
  )
}


const BulkImportTab = () => {
  const [jsonData, setJsonData] = useState('')
  const [validationError, setValidationError] = useState('')
  const [success, setSuccess] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)

  const exampleJSON = `{
  "subject": "AYT Kimya",
  "topic": "Doğada Karbon ve Allotropları",
  "games": [
    {
      "id": "matching_01",
      "title": "Allotrop ve Anahtar Kelime Eşleştirme",
      "mode": "matching",
      "data": [
        { "key": "Elmas", "value": "Bilinen en sert doğal madde" },
        { "key": "Grafit", "value": "Elektriği ileten tek doğal ametal" },
        { "key": "Grafen", "value": "İki boyutlu (2D) bal peteği yapısı" }
      ]
    },
    {
      "id": "grouping_01",
      "title": "Doğal ve Yapay Formlar",
      "mode": "grouping",
      "data": [
        { "item": "Elmas", "category": "Doğal Allotroplar" },
        { "item": "Grafit", "category": "Doğal Allotroplar" },
        { "item": "Fulleren", "category": "Yapay Allotroplar" }
      ]
    },
    {
      "id": "sequence_01",
      "title": "Karbonun 4 Bağ Yapma Süreci",
      "mode": "sequence",
      "data": [
        "Temel hal elektron dizilimi (1s2 2s2 2p2)",
        "Dışarıdan enerji alarak uyarılma",
        "2s orbitalindeki bir elektronun 2p'ye geçmesi"
      ]
    }
  ]
}`

  const validateJSON = () => {
    try {
      const parsed = JSON.parse(jsonData)
      
      if (!parsed.subject || !parsed.topic || !Array.isArray(parsed.games)) {
        setValidationError('JSON formatı hatalı. subject, topic ve games alanları gerekli.')
        return false
      }

      for (const game of parsed.games) {
        if (!game.id || !game.title || !game.mode || !Array.isArray(game.data)) {
          setValidationError(`Oyun formatı hatalı: ${game.id || 'bilinmeyen'}`)
          return false
        }

        if (!['matching', 'grouping', 'sequence'].includes(game.mode)) {
          setValidationError(`Geçersiz oyun modu: ${game.mode}`)
          return false
        }

        // Mode'a göre data validasyonu
        if (game.mode === 'matching') {
          if (!game.data.every((item: any) => item.key && item.value)) {
            setValidationError(`Matching oyunu için key ve value gerekli: ${game.id}`)
            return false
          }
        } else if (game.mode === 'grouping') {
          if (!game.data.every((item: any) => item.item && item.category)) {
            setValidationError(`Grouping oyunu için item ve category gerekli: ${game.id}`)
            return false
          }
        } else if (game.mode === 'sequence') {
          if (!game.data.every((item: any) => typeof item === 'string')) {
            setValidationError(`Sequence oyunu için string array gerekli: ${game.id}`)
            return false
          }
        }
      }

      setValidationError('')
      return true
    } catch (e) {
      setValidationError('Geçersiz JSON formatı')
      return false
    }
  }

  const handleImport = async () => {
    if (!validateJSON()) return

    setImporting(true)
    setImportResult(null)

    try {
      const parsed = JSON.parse(jsonData)
      
      // 1. Ders oluştur veya bul
      let subjects = await getSubjects()
      let subject = subjects.find(s => s.name === parsed.subject)
      
      if (!subject) {
        const subjectIcon = parsed.subject.includes('Biyoloji') ? '🧬' :
                           parsed.subject.includes('Kimya') ? '⚗️' :
                           parsed.subject.includes('Fizik') ? '⚛️' :
                           parsed.subject.includes('Matematik') ? '📐' : '📚'
        await createSubject(parsed.subject, subjectIcon)
        subjects = await getSubjects()
        subject = subjects.find(s => s.name === parsed.subject)
      }

      if (!subject) {
        throw new Error('Ders oluşturulamadı')
      }

      // 2. Konu oluştur veya bul
      let topics = await getTopicsBySubject(subject.id)
      let topic = topics.find(t => t.name === parsed.topic)
      
      if (!topic) {
        await createTopic(subject.id, parsed.topic)
        topics = await getTopicsBySubject(subject.id)
        topic = topics.find(t => t.name === parsed.topic)
      }

      if (!topic) {
        throw new Error('Konu oluşturulamadı')
      }

      // 3. Tüm oyunları oluştur
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
      setTimeout(() => setSuccess(false), 5000)
    } catch (e: any) {
      setValidationError(`İçe aktarma hatası: ${e.message}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">⚡ Toplu İçe Aktar</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Bir konu için tüm oyun modlarını tek seferde ekleyin
        </p>
      </div>

      {/* Guide */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 md:p-6 border border-blue-500/20 mb-4 md:mb-6">
        <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2 text-sm md:text-base">
          <Upload className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
          Nasıl Kullanılır?
        </h3>
        <ol className="text-muted-foreground text-xs md:text-sm space-y-2 list-decimal list-inside">
          <li>NotebookLM'e kaynaklarınızı yükleyin</li>
          <li>Aşağıdaki JSON formatını isteyin</li>
          <li>Gelen JSON'u yapıştırın ve "İçe Aktar" butonuna tıklayın</li>
          <li>Sistem otomatik olarak ders, konu ve tüm oyunları oluşturur</li>
        </ol>
      </div>

      {/* JSON Input */}
      <div className="bg-card rounded-lg p-4 md:p-6 border border-border shadow-sm mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <label className="block text-sm font-medium text-foreground">JSON Verisi</label>
          <button
            onClick={() => setJsonData(exampleJSON)}
            className="text-xs text-primary hover:opacity-80 font-medium px-3 py-1 bg-primary/10 rounded-md w-full sm:w-auto"
          >
            📋 Örnek Yükle
          </button>
        </div>
        <textarea
          value={jsonData}
          onChange={(e) => setJsonData(e.target.value)}
          className="w-full h-64 md:h-96 bg-muted border border-border rounded-lg px-3 md:px-4 py-3 text-foreground font-mono text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none shadow-inner"
          placeholder={exampleJSON}
        />
      </div>

      {/* Validation Error */}
      {validationError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 md:p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs md:text-sm"
        >
          ❌ {validationError}
        </motion.div>
      )}

      {/* Success Message */}
      {success && importResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 md:p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-semibold text-sm md:text-base">Başarıyla içe aktarıldı!</span>
          </div>
          <div className="text-xs md:text-sm space-y-1 ml-6 md:ml-7">
            <p>📚 Ders: {importResult.subject}</p>
            <p>📖 Konu: {importResult.topic}</p>
            <p>🎮 {importResult.gamesCount} oyun oluşturuldu:</p>
            <ul className="ml-4 space-y-1">
              {importResult.games.map((game: any, idx: number) => (
                <li key={idx}>
                  • {game.mode === 'matching' ? '🔗' : game.mode === 'grouping' ? '🗂️' : '📝'} {game.title}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Import Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleImport}
        disabled={importing || !jsonData}
        className="w-full flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
      >
        {importing ? (
          <>
            <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            İçe Aktarılıyor...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 md:w-5 md:h-5" />
            Toplu İçe Aktar
          </>
        )}
      </motion.button>

      {/* JSON Format Guide */}
      <div className="mt-6 md:mt-8 bg-muted rounded-lg p-4 md:p-6 border border-border">
        <h3 className="text-foreground font-semibold mb-3 text-sm md:text-base">📋 JSON Format Şablonu</h3>
        <pre className="bg-background border border-border rounded-lg p-3 md:p-4 text-xs text-foreground overflow-x-auto">
{`{
  "subject": "Ders Adı",
  "topic": "Konu Adı",
  "games": [
    {
      "id": "matching_01",
      "title": "Oyun Başlığı",
      "mode": "matching",
      "data": [
        { "key": "Terim", "value": "Açıklama" }
      ]
    },
    {
      "id": "grouping_01",
      "title": "Oyun Başlığı",
      "mode": "grouping",
      "data": [
        { "item": "Öğe", "category": "Kategori" }
      ]
    },
    {
      "id": "sequence_01",
      "title": "Oyun Başlığı",
      "mode": "sequence",
      "data": ["Adım 1", "Adım 2", "Adım 3"]
    }
  ]
}`}
        </pre>
      </div>
    </div>
  )
}
