export function TopicCardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-4 md:p-6 border border-border animate-pulse">
      <div className="h-6 bg-muted rounded w-3/4 mb-4" />
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 bg-muted rounded w-24" />
        <div className="h-6 bg-muted rounded w-24" />
        <div className="h-6 bg-muted rounded w-24" />
      </div>
      <div className="h-4 bg-muted rounded w-32" />
    </div>
  )
}

export function SubjectCardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-4 md:p-6 border border-border animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-muted rounded-lg" />
        <div className="flex-1">
          <div className="h-5 bg-muted rounded w-32 mb-2" />
          <div className="h-3 bg-muted rounded w-20" />
        </div>
      </div>
      <div className="h-3 bg-muted rounded w-full" />
    </div>
  )
}
