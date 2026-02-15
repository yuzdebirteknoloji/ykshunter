'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Edit2, ChevronDown, ChevronRight, X, Save, Plus } from 'lucide-react'
import { createClient, createSubject } from '@/lib/supabase'
import { toast } from 'sonner'
import { useManagementSubjects, useManagementTopics, useManagementQuestionSets } from '@/hooks/use-queries'
import { useQueryClient } from '@tanstack/react-query'

export function ManagementTab() {
  const { data: subjects = [], isLoading: loading } = useManagementSubjects()
  const queryClient = useQueryClient()
  
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingSet, setEditingSet] = useState<any | null>(null)
  const [editData, setEditData] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [editingSubject, setEditingSubject] = useState<any | null>(null)
  const [subjectName, setSubjectName] = useState('')
  const [subjectIcon, setSubjectIcon] = useState('')
  const [editingTopic, setEditingTopic] = useState<any | null>(null)
  const [topicName, setTopicName] = useState('')
  const [topicShuffleSets, setTopicShuffleSets] = useState(true)

  // Add Subject State
  const [isAddingSubject, setIsAddingSubject] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectIcon, setNewSubjectIcon] = useState('📚')
  const [creatingSubject, setCreatingSubject] = useState(false)

  const subjectIcons = ['📚', '📐', '🧪', '🌍', '📖', '🔢', '🧬', '🎨', '💻', '📝', '🏛️', '⚗️', '🧮', '🌿', '🔬']

  const invalidateCache = () => {
    // Invalidate all management caches
    queryClient.invalidateQueries({ queryKey: ['management'] })
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
      invalidateCache()
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
      invalidateCache()
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
      invalidateCache()
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
      invalidateCache()
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
      invalidateCache()
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
      invalidateCache()
    } catch (error: any) {
      console.error('Error saving subject:', error)
      toast.error('Kaydetme başarısız: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const openEditTopic = (topic: any) => {
    setEditingTopic(topic)
    setTopicName(topic.name)
    setTopicShuffleSets(topic.shuffle_sets !== false) // Default true
  }

  const closeEditTopic = () => {
    setEditingTopic(null)
    setTopicName('')
    setTopicShuffleSets(true)
  }

  const saveTopic = async () => {
    if (!editingTopic || !topicName.trim()) {
      toast.error('Konu adı gerekli')
      return
    }

    try {
      setSaving(true)

      const supabase = createClient()
      const { error } = await supabase
        .from('topics')
        .update({ 
          name: topicName.trim(),
          shuffle_sets: topicShuffleSets
        })
        .eq('id', editingTopic.id)

      if (error) throw error

      toast.success('Konu güncellendi')
      closeEditTopic()
      invalidateCache()
    } catch (error: any) {
      console.error('Error saving topic:', error)
      toast.error('Kaydetme başarısız: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error('Ders adı gerekli')
      return
    }

    try {
      setCreatingSubject(true)
      await createSubject(newSubjectName.trim(), newSubjectIcon)
      toast.success('Ders başarıyla oluşturuldu')
      setIsAddingSubject(false)
      setNewSubjectName('')
      setNewSubjectIcon('📚')
      invalidateCache()
    } catch (error: any) {
      console.error('Error creating subject:', error)
      toast.error('Oluşturma başarısız: ' + error.message)
    } finally {
      setCreatingSubject(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded" />
              <div className="flex-1">
                <div className="h-5 bg-muted rounded w-32 mb-2" />
                <div className="h-3 bg-muted rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">🗂️ İçerik Yönetimi</h2>
          <p className="text-sm text-muted-foreground">Dersler, konular ve soru setlerini yönet</p>
        </div>
        {!isAddingSubject && (
          <button
            onClick={() => setIsAddingSubject(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-medium shadow-lg hover:shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Yeni Ders Ekle
          </button>
        )}
      </div>

      {isAddingSubject && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-muted/50 border border-primary/20 rounded-xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Yeni Ders Oluştur</h3>
            <button
              onClick={() => setIsAddingSubject(false)}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ders Adı</label>
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Örn: Biyoloji"
                className="w-full p-2 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">İkon Seçin</label>
              <div className="flex gap-1 flex-wrap">
                {subjectIcons.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setNewSubjectIcon(icon)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-lg transition-all ${
                      newSubjectIcon === icon
                        ? 'bg-primary/20 ring-2 ring-primary scale-110'
                        : 'hover:bg-muted/80'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsAddingSubject(false)}
              className="px-4 py-2 text-sm hover:bg-muted rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleAddSubject}
              disabled={creatingSubject || !newSubjectName.trim()}
              className="px-6 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
            >
              {creatingSubject ? 'Oluşturuluyor...' : 'Ders Ekle'}
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {subjects.map((subject) => (
          <SubjectItem
            key={subject.id}
            subject={subject}
            isExpanded={expandedSubjects.has(subject.id)}
            onToggle={() => toggleSubject(subject.id)}
            onEdit={openEditSubject}
            onDelete={deleteSubject}
            deleting={deleting}
            expandedTopics={expandedTopics}
            onToggleTopic={toggleTopic}
            onEditTopic={openEditTopic}
            onDeleteTopic={deleteTopic}
            onEditSet={openEditModal}
            onDeleteSet={deleteQuestionSet}
            onDeleteImageGame={deleteImageGame}
          />
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

      {/* Edit Topic Modal */}
      {editingTopic && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Konuyu Düzenle</h3>
              <button
                onClick={closeEditTopic}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Konu Adı
                </label>
                <input
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full p-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Örn: Sinir Sistemi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Set Sırası
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 bg-muted rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-colors">
                    <input
                      type="radio"
                      checked={topicShuffleSets}
                      onChange={() => setTopicShuffleSets(true)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">🎲 Rastgele Sıra</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Setler her oyunda farklı sırada gelir (varsayılan)
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-3 bg-muted rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-colors">
                    <input
                      type="radio"
                      checked={!topicShuffleSets}
                      onChange={() => setTopicShuffleSets(false)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">📋 Sabit Sıra</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Setler her zaman aynı sırada gelir (oluşturulma sırasına göre)
                      </div>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Not: Setlerin içindeki sorular her türlü karıştırılır, sadece set sırası etkilenir
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveTopic}
                  disabled={saving || !topicName.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  onClick={closeEditTopic}
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

// Subject Item Component with lazy loading
function SubjectItem({ 
  subject, 
  isExpanded, 
  onToggle, 
  onEdit, 
  onDelete, 
  deleting,
  expandedTopics,
  onToggleTopic,
  onEditTopic,
  onDeleteTopic,
  onEditSet,
  onDeleteSet,
  onDeleteImageGame
}: any) {
  const { data: topics = [], isLoading } = useManagementTopics(subject.id, isExpanded)
  
  return (
    <div className="bg-card rounded-lg border">
      {/* Subject Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 flex-1 text-left"
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
          <span className="text-2xl">{subject.icon}</span>
          <div>
            <div className="font-semibold text-foreground">{subject.name}</div>
            <div className="text-xs text-muted-foreground">
              {isExpanded ? `${topics.length} konu` : 'Yükleniyor...'}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(subject)}
            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Düzenle"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(subject.id, subject.name)}
            disabled={deleting === subject.id}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Topics */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Yükleniyor...
            </div>
          ) : topics.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Konu yok
            </div>
          ) : (
            topics.map((topic: any) => (
              <TopicItem
                key={topic.id}
                topic={topic}
                isExpanded={expandedTopics.has(topic.id)}
                onToggle={() => onToggleTopic(topic.id)}
                onEdit={onEditTopic}
                onDelete={onDeleteTopic}
                onEditSet={onEditSet}
                onDeleteSet={onDeleteSet}
                onDeleteImageGame={onDeleteImageGame}
                deleting={deleting}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// Topic Item Component with lazy loading
function TopicItem({
  topic,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onEditSet,
  onDeleteSet,
  onDeleteImageGame,
  deleting
}: any) {
  const { data, isLoading } = useManagementQuestionSets(topic.id, isExpanded)
  const questionSets = data?.questionSets || []
  const imageGames = data?.imageGames || []
  
  return (
    <div className="bg-muted rounded-lg border border-border">
      {/* Topic Header */}
      <div className="flex items-center justify-between p-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 flex-1 text-left"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <div>
            <div className="font-medium text-foreground">{topic.name}</div>
            <div className="text-xs text-muted-foreground">
              {isExpanded 
                ? `${questionSets.length} soru seti • ${imageGames.length} görsel oyun`
                : 'Tıkla'}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(topic)}
            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Düzenle"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(topic.id, topic.name)}
            disabled={deleting === topic.id}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Sets */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-1">
          {isLoading ? (
            <div className="text-xs text-muted-foreground text-center py-2">
              Yükleniyor...
            </div>
          ) : (
            <>
              {questionSets.map((set: any) => (
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
                      onClick={() => onEditSet(set)}
                      className="p-1 text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteSet(set.id)}
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
              {imageGames.map((game: any) => (
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
                    onClick={() => onDeleteImageGame(game.id)}
                    disabled={deleting === game.id}
                    className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {questionSets.length === 0 && imageGames.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  İçerik yok
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
