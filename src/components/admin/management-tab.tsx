'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Edit2, ChevronDown, ChevronRight, X, Save } from 'lucide-react'
import { getSubjects, getTopicsBySubject, getQuestionSetsByTopicAndMode, getImageGamesByTopic, createClient } from '@/lib/supabase'
import { toast } from 'sonner'

export function ManagementTab() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingSet, setEditingSet] = useState<any | null>(null)
  const [editData, setEditData] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [editingSubject, setEditingSubject] = useState<any | null>(null)
  const [subjectName, setSubjectName] = useState('')
  const [subjectIcon, setSubjectIcon] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const subjectsData = await getSubjects()
      const subjectsWithTopics = await Promise.all(
        subjectsData.map(async (subject) => {
          const topics = await getTopicsBySubject(subject.id)
          const topicsWithSets = await Promise.all(
            topics.map(async (topic) => {
              const matchingSets = await getQuestionSetsByTopicAndMode(topic.id, 'matching')
              const sequenceSets = await getQuestionSetsByTopicAndMode(topic.id, 'sequence')
              const groupingSets = await getQuestionSetsByTopicAndMode(topic.id, 'grouping')
              const imageGames = await getImageGamesByTopic(topic.id)
              return {
                ...topic,
                questionSets: [...matchingSets, ...sequenceSets, ...groupingSets],
                imageGames: imageGames
              }
            })
          )
          return {
            ...subject,
            topics: topicsWithSets
          }
        })
      )
      setSubjects(subjectsWithTopics)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Veriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const toggleSubject = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects)
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId)
    } else {
      newExpanded.add(subjectId)
    }
    setExpandedSubjects(newExpanded)
  }

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId)
    } else {
      newExpanded.add(topicId)
    }
    setExpandedTopics(newExpanded)
  }

  const deleteSubject = async (subjectId: string, subjectName: string) => {
    if (!confirm(`"${subjectName}" dersini ve tüm konularını silmek istediğinize emin misiniz?`)) {
      return
    }

    setDeleting(subjectId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId)

      if (error) throw error

      toast.success('Ders silindi')
      loadData()
    } catch (error: any) {
      console.error('Error deleting subject:', error)
      toast.error('Silme başarısız: ' + error.message)
    } finally {
      setDeleting(null)
    }
  }

  const deleteTopic = async (topicId: string, topicName: string) => {
    if (!confirm(`"${topicName}" konusunu ve tüm soru setlerini silmek istediğinize emin misiniz?`)) {
      return
    }

    setDeleting(topicId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId)

      if (error) throw error

      toast.success('Konu silindi')
      loadData()
    } catch (error: any) {
      console.error('Error deleting topic:', error)
      toast.error('Silme başarısız: ' + error.message)
    } finally {
      setDeleting(null)
    }
  }

  const deleteQuestionSet = async (setId: string) => {
    if (!confirm('Bu soru setini silmek istediğinize emin misiniz?')) {
      return
    }

    setDeleting(setId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('question_sets')
        .delete()
        .eq('id', setId)

      if (error) throw error

      toast.success('Soru seti silindi')
      loadData()
    } catch (error: any) {
      console.error('Error deleting question set:', error)
      toast.error('Silme başarısız: ' + error.message)
    } finally {
      setDeleting(null)
    }
  }

  const deleteImageGame = async (gameId: string) => {
    if (!confirm('Bu görsel oyunu silmek istediğinize emin misiniz?')) {
      return
    }

    setDeleting(gameId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('image_games')
        .delete()
        .eq('id', gameId)

      if (error) throw error

      toast.success('Görsel oyunu silindi')
      loadData()
    } catch (error: any) {
      console.error('Error deleting image game:', error)
      toast.error('Silme başarısız: ' + error.message)
    } finally {
      setDeleting(null)
    }
  }

  const openEditModal = (set: any) => {
    setEditingSet(set)
    setEditData(JSON.stringify(set.data, null, 2))
  }

  const closeEditModal = () => {
    setEditingSet(null)
    setEditData('')
  }

  const saveQuestionSet = async () => {
    if (!editingSet) return

    try {
      const parsedData = JSON.parse(editData)
      setSaving(true)

      const supabase = createClient()
      const { error } = await supabase
        .from('question_sets')
        .update({ data: parsedData })
        .eq('id', editingSet.id)

      if (error) throw error

      toast.success('Soru seti güncellendi')
      closeEditModal()
      loadData()
    } catch (error: any) {
      console.error('Error saving question set:', error)
      if (error instanceof SyntaxError) {
        toast.error('JSON formatı hatalı')
      } else {
        toast.error('Kaydetme başarısız: ' + error.message)
      }
    } finally {
      setSaving(false)
    }
  }

  const openEditSubject = (subject: any) => {
    setEditingSubject(subject)
    setSubjectName(subject.name)
    setSubjectIcon(subject.icon)
  }

  const closeEditSubject = () => {
    setEditingSubject(null)
    setSubjectName('')
    setSubjectIcon('')
  }

  const saveSubject = async () => {
    if (!editingSubject || !subjectName.trim() || !subjectIcon.trim()) {
      toast.error('Ders adı ve emoji gerekli')
      return
    }

    try {
      setSaving(true)

      const supabase = createClient()
      const { error } = await supabase
        .from('subjects')
        .update({ 
          name: subjectName.trim(),
          icon: subjectIcon.trim()
        })
        .eq('id', editingSubject.id)

      if (error) throw error

      toast.success('Ders güncellendi')
      closeEditSubject()
      loadData()
    } catch (error: any) {
      console.error('Error saving subject:', error)
      toast.error('Kaydetme başarısız: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">🗂️ İçerik Yönetimi</h2>
        <p className="text-sm text-muted-foreground">Dersler, konular ve soru setlerini yönet</p>
      </div>

      <div className="space-y-2">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-card rounded-lg border">
            {/* Subject Header */}
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => toggleSubject(subject.id)}
                className="flex items-center gap-2 flex-1 text-left"
              >
                {expandedSubjects.has(subject.id) ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="text-2xl">{subject.icon}</span>
                <div>
                  <div className="font-semibold text-foreground">{subject.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {subject.topics.length} konu
                  </div>
                </div>
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditSubject(subject)}
                  className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Düzenle"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteSubject(subject.id, subject.name)}
                  disabled={deleting === subject.id}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Topics */}
            {expandedSubjects.has(subject.id) && (
              <div className="px-4 pb-4 space-y-2">
                {subject.topics.map((topic: any) => (
                  <div key={topic.id} className="bg-muted rounded-lg border border-border">
                    {/* Topic Header */}
                    <div className="flex items-center justify-between p-3">
                      <button
                        onClick={() => toggleTopic(topic.id)}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        {expandedTopics.has(topic.id) ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium text-foreground">{topic.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {topic.questionSets.length} soru seti • {topic.imageGames?.length || 0} görsel oyun
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => deleteTopic(topic.id, topic.name)}
                        disabled={deleting === topic.id}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Question Sets */}
                    {expandedTopics.has(topic.id) && (
                      <div className="px-3 pb-3 space-y-1">
                        {topic.questionSets.map((set: any) => (
                          <div
                            key={set.id}
                            className="flex items-center justify-between p-2 bg-background rounded border border-border"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                {set.mode}
                              </span>
                              <span className="text-sm text-foreground">
                                {set.data?.length || 0} soru
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditModal(set)}
                                className="p-1 text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                                title="Düzenle"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteQuestionSet(set.id)}
                                disabled={deleting === set.id}
                                className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                                title="Sil"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {/* Image Games */}
                        {topic.imageGames?.map((game: any) => (
                          <div
                            key={game.id}
                            className="flex items-center justify-between p-2 bg-background rounded border border-border"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-pink-500/10 text-pink-500 rounded">
                                🖼️ görsel
                              </span>
                              <span className="text-sm text-foreground">
                                {game.title}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({game.regions?.length || 0} bölge)
                              </span>
                            </div>
                            <button
                              onClick={() => deleteImageGame(game.id)}
                              disabled={deleting === game.id}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        
                        {topic.questionSets.length === 0 && (!topic.imageGames || topic.imageGames.length === 0) && (
                          <div className="text-xs text-muted-foreground text-center py-2">
                            İçerik yok
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {subject.topics.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Konu yok
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {subjects.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Henüz ders eklenmemiş
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingSet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">Soru Setini Düzenle</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Mod: <span className="font-medium text-primary">{editingSet.mode}</span>
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Soru Verileri (JSON)
                </label>
                <textarea
                  value={editData}
                  onChange={(e) => setEditData(e.target.value)}
                  className="w-full h-96 p-4 bg-muted border border-border rounded-lg font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="JSON formatında soru verilerini girin..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  💡 İpucu: JSON formatına dikkat edin. Hatalı format kaydetmeyi engelleyecektir.
                </p>
              </div>

              {/* Format Examples */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm font-medium text-foreground mb-2">📝 Format Örnekleri:</p>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium text-blue-500">Matching:</span>
                    <code className="block mt-1 p-2 bg-background rounded text-foreground">
                      {`[{"key": "Terim", "value": "Açıklama"}]`}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium text-purple-500">Sequence:</span>
                    <code className="block mt-1 p-2 bg-background rounded text-foreground">
                      {`["İlk adım", "İkinci adım", "Üçüncü adım"]`}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium text-green-500">Grouping:</span>
                    <code className="block mt-1 p-2 bg-background rounded text-foreground">
                      {`[{"item": "Öğe", "category": "Kategori"}]`}
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveQuestionSet}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  onClick={closeEditModal}
                  disabled={saving}
                  className="px-6 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 disabled:opacity-50 transition-all"
                >
                  İptal
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Dersi Düzenle</h3>
              <button
                onClick={closeEditSubject}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Ders Adı
                </label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Örn: Matematik"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Emoji İkon
                </label>
                <input
                  type="text"
                  value={subjectIcon}
                  onChange={(e) => setSubjectIcon(e.target.value)}
                  className="w-full p-3 bg-muted border border-border rounded-lg text-foreground text-2xl text-center focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="📚"
                  maxLength={2}
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  💡 Tek bir emoji girin (Windows: Win + . veya Mac: Cmd + Ctrl + Space)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveSubject}
                  disabled={saving || !subjectName.trim() || !subjectIcon.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  onClick={closeEditSubject}
                  disabled={saving}
                  className="px-6 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 disabled:opacity-50 transition-all"
                >
                  İptal
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
