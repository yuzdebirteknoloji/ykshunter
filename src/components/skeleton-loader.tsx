// Notion-style skeleton loaders

export function TopicCardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-4 md:p-6 border border-border animate-pulse">
      <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-24 bg-muted rounded"></div>
        <div className="h-6 w-24 bg-muted rounded"></div>
        <div className="h-6 w-24 bg-muted rounded"></div>
      </div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
    </div>
  )
}

export function SubjectCardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-4 border border-border animate-pulse">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-muted rounded"></div>
        <div className="h-5 bg-muted rounded w-32"></div>
      </div>
      <div className="h-3 bg-muted rounded w-20"></div>
    </div>
  )
}

export function GameModeSkeleton() {
  return (
    <div className="bg-card rounded-lg p-4 md:p-6 border border-border animate-pulse">
      <div className="w-12 h-12 bg-muted rounded mb-4"></div>
      <div className="h-6 bg-muted rounded w-32 mb-2"></div>
      <div className="h-4 bg-muted rounded w-full mb-4"></div>
      <div className="h-6 w-24 bg-muted rounded-full"></div>
    </div>
  )
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border animate-pulse">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-muted rounded"></div>
        <div className="flex-1">
          <div className="h-4 bg-muted rounded w-48 mb-2"></div>
          <div className="h-3 bg-muted rounded w-32"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-muted rounded"></div>
        <div className="w-8 h-8 bg-muted rounded"></div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  )
}
