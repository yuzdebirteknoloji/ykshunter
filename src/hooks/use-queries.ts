import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSubjects,
  getTopicsBySubject,
  getQuestionSetsByTopic,
  getTopicById,
  getImageGames,
  getQuestionSetsByTopicAndMode,
  getImageGamesByTopic,
  createSubject,
  createTopic,
  createQuestionSet,
  type GameMode
} from '@/lib/supabase'

// Query keys
export const queryKeys = {
  subjects: ['subjects'] as const,
  topics: (subjectId: string) => ['topics', subjectId] as const,
  topic: (topicId: string) => ['topic', topicId] as const,
  questionSets: (topicId: string) => ['questionSets', topicId] as const,
  questionSetsByMode: (topicId: string, mode: GameMode) => ['questionSets', topicId, mode] as const,
  imageGames: ['imageGames'] as const,
}

// Subjects
export function useSubjects() {
  return useQuery({
    queryKey: queryKeys.subjects,
    queryFn: async () => {
      try {
        return await getSubjects()
      } catch (error) {
        console.error('Failed to fetch subjects:', error)
        return []
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - subjects rarely change
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: false,
  })
}

export function useCreateSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, icon }: { name: string; icon: string }) => createSubject(name, icon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects })
    },
  })
}

// Topics
export function useTopics(subjectId: string) {
  return useQuery({
    queryKey: queryKeys.topics(subjectId),
    queryFn: async () => {
      try {
        return await getTopicsBySubject(subjectId)
      } catch (error) {
        console.error('Failed to fetch topics:', error)
        return []
      }
    },
    enabled: !!subjectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}

export function useTopic(topicId: string) {
  return useQuery({
    queryKey: queryKeys.topic(topicId),
    queryFn: async () => {
      try {
        return await getTopicById(topicId)
      } catch (error) {
        console.error('Failed to fetch topic:', error)
        return null
      }
    },
    enabled: !!topicId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useCreateTopic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ subjectId, name }: { subjectId: string; name: string }) => 
      createTopic(subjectId, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.topics(variables.subjectId) })
    },
  })
}

// Question Sets
export function useQuestionSets(topicId: string) {
  return useQuery({
    queryKey: queryKeys.questionSets(topicId),
    queryFn: () => getQuestionSetsByTopic(topicId),
    enabled: !!topicId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

export function useQuestionSetsByMode(topicId: string, mode: GameMode) {
  return useQuery({
    queryKey: queryKeys.questionSetsByMode(topicId, mode),
    queryFn: () => getQuestionSetsByTopicAndMode(topicId, mode),
    enabled: !!topicId && !!mode,
    staleTime: 3 * 60 * 1000,
  })
}

export function useCreateQuestionSet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ 
      topicId, 
      mode, 
      isRandom, 
      data 
    }: { 
      topicId: string
      mode: GameMode
      isRandom: boolean
      data: any 
    }) => createQuestionSet(topicId, mode, isRandom, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionSets(variables.topicId) })
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.questionSetsByMode(variables.topicId, variables.mode) 
      })
    },
  })
}

// Image Games
export function useImageGames() {
  return useQuery({
    queryKey: queryKeys.imageGames,
    queryFn: getImageGames,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Management - Lazy loading with on-demand data
export function useManagementSubjects() {
  return useQuery({
    queryKey: ['management', 'subjects'],
    queryFn: async () => {
      return await getSubjects()
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function useManagementTopics(subjectId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['management', 'topics', subjectId],
    queryFn: async () => {
      const topics = await getTopicsBySubject(subjectId)
      return topics
    },
    enabled: enabled && !!subjectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function useManagementQuestionSets(topicId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['management', 'question-sets', topicId],
    queryFn: async () => {
      const [matchingSets, sequenceSets, groupingSets, imageGames] = await Promise.all([
        getQuestionSetsByTopicAndMode(topicId, 'matching'),
        getQuestionSetsByTopicAndMode(topicId, 'sequence'),
        getQuestionSetsByTopicAndMode(topicId, 'grouping'),
        getImageGamesByTopic(topicId)
      ])
      
      return {
        questionSets: [...matchingSets, ...sequenceSets, ...groupingSets],
        imageGames
      }
    },
    enabled: enabled && !!topicId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

// Management - Full hierarchy with cache (DEPRECATED - use lazy loading instead)
export function useManagementData() {
  return useQuery({
    queryKey: ['management', 'full-hierarchy'],
    queryFn: async () => {
      const subjects = await getSubjects()
      
      // Load all data in parallel for speed
      const subjectsWithTopics = await Promise.all(
        subjects.map(async (subject) => {
          const topics = await getTopicsBySubject(subject.id)
          
          const topicsWithSets = await Promise.all(
            topics.map(async (topic) => {
              // Load all game types in parallel
              const [matchingSets, sequenceSets, groupingSets, imageGames] = await Promise.all([
                getQuestionSetsByTopicAndMode(topic.id, 'matching'),
                getQuestionSetsByTopicAndMode(topic.id, 'sequence'),
                getQuestionSetsByTopicAndMode(topic.id, 'grouping'),
                getImageGamesByTopic(topic.id)
              ])
              
              return {
                ...topic,
                questionSets: [...matchingSets, ...sequenceSets, ...groupingSets],
                imageGames
              }
            })
          )
          
          return {
            ...subject,
            topics: topicsWithSets
          }
        })
      )
      
      return subjectsWithTopics
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - fresh enough
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnMount: false, // Don't refetch on every mount
    refetchOnWindowFocus: false, // Don't refetch on focus
  })
}

// Prefetch helpers
export function usePrefetchTopics() {
  const queryClient = useQueryClient()
  return (subjectId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.topics(subjectId),
      queryFn: () => getTopicsBySubject(subjectId),
    })
  }
}

export function usePrefetchQuestionSets() {
  const queryClient = useQueryClient()
  return (topicId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.questionSets(topicId),
      queryFn: () => getQuestionSetsByTopic(topicId),
    })
  }
}
