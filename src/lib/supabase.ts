import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co'

// Create client with fallback
const supabaseClient = isSupabaseConfigured 
  ? createSupabaseClient(supabaseUrl, supabaseKey)
  : createSupabaseClient('https://placeholder.supabase.co', 'placeholder-key')

export const supabase = supabaseClient

// Export createClient for API routes
export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured')
  }
  return createSupabaseClient(supabaseUrl, supabaseKey)
}

// Mock mode check
const isMockMode = !isSupabaseConfigured

if (isMockMode && typeof window !== 'undefined') {
  console.warn('⚠️ Running in MOCK MODE - Supabase not configured')
}

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
  shuffle_sets?: boolean // Set sırası rastgele mi olsun (default: true)
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

// Helper functions with caching
import { dataCache } from './cache'

export async function getSubjects() {
  const cacheKey = 'subjects:all'
  
  // Return cached data immediately if available
  const cached = dataCache.get<Subject[]>(cacheKey)
  if (cached) {
    // Revalidate in background if stale
    if (dataCache.isStale(cacheKey)) {
      fetchSubjects().then(data => dataCache.set(cacheKey, data))
    }
    return cached
  }
  
  // Fetch fresh data
  const data = await fetchSubjects()
  dataCache.set(cacheKey, data)
  return data
}

async function fetchSubjects() {
  if (isMockMode) {
    return mockSubjects
  }
  
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }
  
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getTopicsBySubject(subjectId: string) {
  const cacheKey = `topics:${subjectId}`
  
  const cached = dataCache.get<Topic[]>(cacheKey)
  if (cached) {
    if (dataCache.isStale(cacheKey)) {
      fetchTopicsBySubject(subjectId).then(data => dataCache.set(cacheKey, data))
    }
    return cached
  }
  
  const data = await fetchTopicsBySubject(subjectId)
  dataCache.set(cacheKey, data)
  return data
}

async function fetchTopicsBySubject(subjectId: string) {
  if (isMockMode) {
    return mockTopics.filter(t => t.subject_id === subjectId)
  }
  
  if (!supabase) {
    throw new Error('Supabase client not initialized')
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
  const cacheKey = `questions:${topicId}`
  
  const cached = dataCache.get<QuestionSet[]>(cacheKey)
  if (cached) {
    if (dataCache.isStale(cacheKey)) {
      fetchQuestionSetsByTopic(topicId).then(data => dataCache.set(cacheKey, data))
    }
    return cached
  }
  
  const data = await fetchQuestionSetsByTopic(topicId)
  dataCache.set(cacheKey, data)
  return data
}

async function fetchQuestionSetsByTopic(topicId: string) {
  if (isMockMode) {
    return mockQuestionSets.filter(q => q.topic_id === topicId)
  }
  
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }
  
  const { data, error } = await supabase
    .from('question_sets')
    .select('*')
    .eq('topic_id', topicId)
  
  if (error) throw error
  return data
}

export async function getTopicById(topicId: string) {
  const cacheKey = `topic:${topicId}`
  
  const cached = dataCache.get<any>(cacheKey)
  if (cached) {
    if (dataCache.isStale(cacheKey)) {
      fetchTopicById(topicId).then(data => dataCache.set(cacheKey, data))
    }
    return cached
  }
  
  const data = await fetchTopicById(topicId)
  dataCache.set(cacheKey, data)
  return data
}

async function fetchTopicById(topicId: string) {
  if (isMockMode) {
    return mockTopics.find(t => t.id === topicId) || null
  }
  
  if (!supabase) {
    throw new Error('Supabase client not initialized')
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
  
  if (!supabase) {
    return []
  }
  
  const { data, error } = await supabase
    .from('question_sets')
    .select('*')
    .eq('topic_id', topicId)
    .eq('mode', mode)
  
  if (error) {
    console.error('Error fetching question sets:', error)
    return []
  }
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
  
  if (!supabase) {
    throw new Error('Supabase not configured')
  }
  
  const { data, error } = await supabase
    .from('subjects')
    .insert({ name, icon })
    .select()
    .single()
  
  if (error) throw error
  
  // Invalidate cache
  dataCache.invalidate('subjects')
  
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
  
  if (!supabase) {
    throw new Error('Supabase not configured')
  }
  
  const { data, error } = await supabase
    .from('topics')
    .insert({ subject_id: subjectId, name })
    .select()
    .single()
  
  if (error) throw error
  
  // Invalidate cache
  dataCache.invalidate(`topics:${subjectId}`)
  
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
  
  if (!supabase) {
    throw new Error('Supabase not configured')
  }
  
  const { data: result, error } = await supabase
    .from('question_sets')
    .insert({ topic_id: topicId, mode, is_random: isRandom, data })
    .select()
    .single()
  
  if (error) throw error
  
  // Invalidate cache
  dataCache.invalidate(`questions:${topicId}`)
  
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
  game_type?: 'region' | 'text-cover'
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
  game_type?: 'region' | 'text-cover'
}) {
  // Try with game_type first
  let insertData: any = { ...data }
  
  const { data: game, error } = await supabase
    .from('image_games')
    .insert([insertData])
    .select()
    .single()

  if (error) {
    // If error is about game_type column not existing, try without it
    if (error.message?.includes('game_type') || error.code === '42703') {
      console.warn('game_type column not found, trying without it. Please run migration!')
      const { game_type, ...dataWithoutGameType } = insertData
      
      const { data: gameRetry, error: errorRetry } = await supabase
        .from('image_games')
        .insert([dataWithoutGameType])
        .select()
        .single()
      
      if (errorRetry) {
        console.error('Supabase error:', errorRetry)
        throw errorRetry
      }
      return gameRetry
    }
    
    console.error('Supabase error:', error)
    throw error
  }
  return game
}

export async function getImageGames() {
  const cacheKey = 'image_games:all'
  
  const cached = dataCache.get<ImageGame[]>(cacheKey)
  if (cached) {
    if (dataCache.isStale(cacheKey)) {
      fetchImageGames().then(data => dataCache.set(cacheKey, data))
    }
    return cached
  }
  
  const data = await fetchImageGames()
  dataCache.set(cacheKey, data)
  return data
}

async function fetchImageGames() {
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
