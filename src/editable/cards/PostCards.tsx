import Link from 'next/link'
import { ArrowRight, Clock3 } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

export function getEditableDomain(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const url = typeof content.website === 'string' ? content.website : typeof content.url === 'string' ? content.url : ''
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export function EditorialFeatureCard({ post, href, label = 'Featured' }: { post: SitePost; href: string; label?: string }) {
  return (
    <Link href={href} className="group block min-w-0 overflow-hidden bg-[var(--slot4-dark-bg)] text-[var(--slot4-dark-text)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.1)]">
      <div className="relative min-h-[480px] p-6 sm:p-8 lg:min-h-[560px]">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover opacity-50 transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-end lg:min-h-[500px]">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--slot4-accent)]">{label}</span>
          <h3 className="editable-display mt-3 max-w-3xl text-3xl leading-[1.08] sm:text-4xl lg:text-5xl">{post.title}</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">{getEditableExcerpt(post, 190)}</p>
          <span className="mt-6 inline-flex w-fit items-center gap-2 bg-white px-5 py-3 text-sm font-medium text-[var(--slot4-page-text)]">
            Read more <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group ${dc.layout.minRailCard} block overflow-hidden border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]`}>
      <div className={`${dc.media.frame} ${dc.media.ratio}`}>
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 bg-[var(--slot4-dark-bg)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="p-4">
        <p className="text-xs font-medium text-[var(--slot4-accent)]">{getEditableCategory(post)}</p>
        <h3 className="mt-1.5 line-clamp-3 text-base font-medium leading-snug text-[var(--slot4-page-text)]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 100)}</p>
      </div>
    </Link>
  )
}

export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group block min-w-0 border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--slot4-dark-bg)] text-xs font-medium text-white">{index + 1}</span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-medium text-[var(--slot4-accent)]"><Clock3 className="h-3.5 w-3.5" /> {getEditableCategory(post)}</p>
          <h3 className="mt-1.5 line-clamp-2 text-lg font-medium leading-snug text-[var(--slot4-page-text)]">{post.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 105)}</p>
        </div>
      </div>
    </Link>
  )
}

export function ArticleListCard({ post, href, index: _index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group grid min-w-0 gap-5 overflow-hidden border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] sm:grid-cols-[220px_minmax(0,1fr)]">
      <div className={`${dc.media.frame} aspect-[16/12] sm:aspect-auto sm:min-h-[190px]`}>
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="min-w-0 p-2 sm:py-4 sm:pr-5">
        <p className="text-xs font-medium text-[var(--slot4-accent)]">{getEditableCategory(post)}</p>
        <h2 className="editable-display mt-2 line-clamp-3 text-2xl leading-snug text-[var(--slot4-page-text)] sm:text-3xl">{post.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 180)}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--slot4-page-text)]">Read article <ArrowRight className="h-4 w-4" /></span>
      </div>
    </Link>
  )
}
