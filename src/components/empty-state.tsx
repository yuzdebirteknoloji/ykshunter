import Link from 'next/link'

interface EmptyStateProps {
  icon?: string
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon,
  title = 'İçerik Bulunamadı',
  description = 'Henüz içerik eklenmemiş.',
  actionLabel,
  actionHref,
  action
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      <p className="text-muted-foreground mb-4 text-sm md:text-base">
        {description}
      </p>
      {action ? action : actionLabel && actionHref && (
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
