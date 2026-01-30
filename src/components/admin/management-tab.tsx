'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Edit2, ChevronDown, ChevronRight } from 'lucide-react'
import { getSubjects, getTopicsBySubject, getQuestionSetsByTopicAndMode, getImageGamesByTopic, createClient } from '@/lib/supabase'
import { toast } from 'sonner'

export function ManagementTab() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

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
              <button
                onClick={() => deleteSubject(subject.id, subject.name)}
                disabled={deleting === subject.id}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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
                            <button
                              onClick={() => deleteQuestionSet(set.id)}
                              disabled={deleting === set.id}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
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
    </div>
  )
}
