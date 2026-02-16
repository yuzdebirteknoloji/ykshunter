import Link from 'next/link'

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  title = 'İçerik Bulunamadı',
  description = 'Henüz içerik eklenmemiş.',
  actionLabel,
  actionHref
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4 text-sm md:text-base">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors text-sm md:text-base"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
