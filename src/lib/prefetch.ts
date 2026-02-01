// Intelligent prefetching system inspired by Notion

import { dataCache } from './cache'
import { getSubjects, getTopicsBySubject, getQuestionSetsByTopic } from './supabase'

interface PrefetchQueue {
  priority: number
  action: () => Promise<any>
  key: string
}

class PrefetchManager {
  private queue: PrefetchQueue[] = []
  private processing = false
  private maxConcurrent = 3

  add(key: string, action: () => Promise<any>, priority: number = 1) {
    // Don't prefetch if already cached
    if (dataCache.get(key)) return

    this.queue.push({ key, action, priority })
    this.queue.sort((a, b) => b.priority - a.priority)
    
    if (!this.processing) {
      this.process()
    }
  }

  private async process() {
    if (this.queue.length === 0) {
      this.processing = false
      return
    }

    this.processing = true
    const batch = this.queue.splice(0, this.maxConcurrent)

    await Promise.allSettled(
      batch.map(async ({ key, action }) => {
        try {
          const data = await action()
          dataCache.set(key, data)
        } catch (error) {
          console.error(`Prefetch failed for ${key}:`, error)
        }
      })
    )

    // Continue processing
    this.process()
  }

  clear() {
    this.queue = []
  }
}

export const prefetchManager = new PrefetchManager()

// Smart prefetch strategies
export function prefetchSubjectTopics(subjectId: string) {
  prefetchManager.add(
    `topics:${subjectId}`,
    () => getTopicsBySubject(subjectId),
    2 // High priority
  )
}

export function prefetchTopicQuestions(topicId: string) {
  prefetchManager.add(
    `questions:${topicId}`,
    () => getQuestionSetsByTopic(topicId),
    1 // Medium priority
  )
}

export function prefetchAllSubjects() {
  prefetchManager.add(
    'subjects:all',
    () => getSubjects(),
    3 // Highest priority
  )
}

// Prefetch on hover (like Notion)
export function prefetchOnHover(element: HTMLElement, prefetchFn: () => void) {
  let timeoutId: NodeJS.Timeout

  const handleMouseEnter = () => {
    // Delay prefetch by 100ms to avoid unnecessary requests
    timeoutId = setTimeout(prefetchFn, 100)
  }

  const handleMouseLeave = () => {
    clearTimeout(timeoutId)
  }

  element.addEventListener('mouseenter', handleMouseEnter)
  element.addEventListener('mouseleave', handleMouseLeave)

  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter)
    element.removeEventListener('mouseleave', handleMouseLeave)
    clearTimeout(timeoutId)
  }
}
