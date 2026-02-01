import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSubjects,
  getTopicsBySubject,
  getQuestionSetsByTopic,
  getTopicById,
  getImageGames,
  getQuestionSetsByTopicAndMode,
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
    staleTime: 10 * 60 * 1000, // 10 minutes - subjects rarely change
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
    staleTime: 5 * 60 * 1000,
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
