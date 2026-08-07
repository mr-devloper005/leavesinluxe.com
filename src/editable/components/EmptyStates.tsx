import Link from 'next/link'
import { ArrowRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  title = 'Nothing published here yet',
  description = 'Fresh posts will appear here automatically once this section has published content.',
  actionLabel = 'Back to home',
  actionHref = '/',
  className,
}: EmptyStateProps) {
  return (
    <section className={cn('border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 text-center', className)}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
        <SearchX className="h-5 w-5" />
      </div>
      <h2 className="editable-display mt-4 text-2xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--slot4-muted-text)]">{description}</p>
      <Link href={actionHref} className="mt-5 inline-flex items-center gap-2 border border-[var(--editable-border)] px-5 py-2.5 text-sm font-medium transition hover:border-[var(--slot4-page-text)]">
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}

export function TaskEmptyState({ taskLabel = 'posts', className }: { taskLabel?: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      title={`No ${taskLabel} available yet`}
      description={`Published ${taskLabel} from the master panel will appear here automatically. The page layout stays ready even when the feed is empty.`}
      actionLabel="Explore the site"
      actionHref="/"
    />
  )
}

export function ContactSuccessState({ className }: { className?: string }) {
  return (
    <EmptyState
      className={className}
      title="Message received"
      description="Thanks for reaching out. Your request has been saved and routed through the contact workflow."
      actionLabel="Return home"
      actionHref="/"
    />
  )
}
