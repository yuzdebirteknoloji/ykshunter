import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

// Export createClient for API routes
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseKey)
}

// Mock mode check
const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

export type GameMode = 'sequence' | 'grouping' | 'matching'

export interface Subject {
  id: string
  name: string
  icon: string
  created_at: string
  updated_at: string
}

export interface Topic {
  id: string
  subject_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface QuestionSet {
  id: string
  topic_id: string
  mode: GameMode
  is_random: boolean
  data: any // JSON array
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  topic_id: string
  question_set_id: string
  completed_count: number
  total_xp: number
  streak: number
  best_time?: number
  mistakes?: any[]
  last_played: string
  created_at: string
  updated_at: string
}

export interface UserStats {
  id: string
  total_xp: number
  level: number
  current_streak: number
  longest_streak: number
  total_games_played: number
  created_at: string
  updated_at: string
}

// Mock data for development
const mockSubjects: Subject[] = [
  { id: '1', name: 'AYT Biyoloji', icon: '🧬', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'AYT Kimya', icon: '⚗️', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: 'TYT Tarih', icon: '🏛️', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', name: 'Edebiyat', icon: '📚', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const mockTopics: Topic[] = [
  { id: '1', subject_id: '1', name: 'Sinir Sistemi', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', subject_id: '1', name: 'Protein Sentezi', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', subject_id: '2', name: 'Organik Kimya', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const mockQuestionSets: QuestionSet[] = []

// Helper functions
export async function getSubjects() {
  if (isMockMode) {
    return Promise.resolve(mockSubjects)
  }
  
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getTopicsBySubject(subjectId: string) {
  if (isMockMode) {
    return Promise.resolve(mockTopics.filter(t => t.subject_id === subjectId))
  }
  
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getQuestionSetsByTopic(topicId: string) {
  if (isMockMode) {
    return Promise.resolve(mockQuestionSets.filter(q => q.topic_id === topicId))
  }
  
  const { data, error } = await supabase
    .from('question_sets')
    .select('*')
    .eq('topic_id', topicId)
  
  if (error) throw error
  return data
}

export async function getTopicById(topicId: string) {
  if (isMockMode) {
    return Promise.resolve(mockTopics.find(t => t.id === topicId) || null)
  }
  
  const { data, error } = await supabase
    .from('topics')
    .select('*, subjects(*)')
    .eq('id', topicId)
    .single()
  
  if (error) throw error
  return data
}

export async function getQuestionSetsByTopicAndMode(topicId: string, mode: GameMode) {
  if (isMockMode) {
    return Promise.resolve(mockQuestionSets.filter(q => q.topic_id === topicId && q.mode === mode))
  }
  
  const { data, error } = await supabase
    .from('question_sets')
    .select('*')
    .eq('topic_id', topicId)
    .eq('mode', mode)
  
  if (error) throw error
  return data
}

export async function getRandomQuestionSet(topicId: string) {
  const sets = await getQuestionSetsByTopic(topicId)
  if (sets.length === 0) return null
  return sets[Math.floor(Math.random() * sets.length)]
}

export async function createSubject(name: string, icon: string) {
  if (isMockMode) {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name,
      icon,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockSubjects.push(newSubject)
    return Promise.resolve(newSubject)
  }
  
  const { data, error } = await supabase
    .from('subjects')
    .insert({ name, icon })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createTopic(subjectId: string, name: string) {
  if (isMockMode) {
    const newTopic: Topic = {
      id: Date.now().toString(),
      subject_id: subjectId,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockTopics.push(newTopic)
    return Promise.resolve(newTopic)
  }
  
  const { data, error } = await supabase
    .from('topics')
    .insert({ subject_id: subjectId, name })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createQuestionSet(
  topicId: string,
  mode: GameMode,
  isRandom: boolean,
  data: any
) {
  if (isMockMode) {
    const newSet: QuestionSet = {
      id: Date.now().toString(),
      topic_id: topicId,
      mode,
      is_random: isRandom,
      data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockQuestionSets.push(newSet)
    return Promise.resolve(newSet)
  }
  
  const { data: result, error } = await supabase
    .from('question_sets')
    .insert({ topic_id: topicId, mode, is_random: isRandom, data })
    .select()
    .single()
  
  if (error) throw error
  return result
}


// ============================================
// IMAGE GAMES
// ============================================

export interface ImageGameRegion {
  id: string
  label: string
  type: 'rectangle' | 'polygon'
  x: number
  y: number
  width: number
  height: number
  points?: {x: number, y: number}[] // For polygon
}

export interface ImageGame {
  id: string
  subject_id: string | null
  topic_id: string | null
  title: string
  description?: string
  image_url: string
  regions: ImageGameRegion[]
  created_at: string
  updated_at: string
}

export async function createImageGame(data: {
  subject_id?: string
  topic_id?: string
  title: string
  description?: string
  image_url: string
  regions: ImageGameRegion[]
}) {
  const { data: game, error } = await supabase
    .from('image_games')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return game
}

export async function getImageGames() {
  const { data, error } = await supabase
    .from('image_games')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ImageGame[]
}

export async function getImageGameById(id: string) {
  const { data, error } = await supabase
    .from('image_games')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ImageGame
}

export async function getImageGamesByTopic(topicId: string) {
  const { data, error } = await supabase
    .from('image_games')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ImageGame[]
}

export async function updateImageGame(id: string, updates: Partial<ImageGame>) {
  const { data, error } = await supabase
    .from('image_games')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteImageGame(id: string) {
  const { error } = await supabase
    .from('image_games')
    .delete()
    .eq('id', id)

  if (error) throw error
}
