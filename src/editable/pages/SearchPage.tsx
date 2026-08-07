import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Filter, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'

export const revalidate = 3

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? content.images.find((item) => typeof item === 'string') as string | undefined : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const compactRaw = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const summaryOf = (post: SitePost) => post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post'
  const wide = index % 5 === 0

  return (
    <Link href={href} className={`group block overflow-hidden border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] ${wide ? 'md:col-span-2' : ''}`}>
      {image ? (
        <div className={`relative overflow-hidden bg-[var(--slot4-media-bg)] ${wide ? 'aspect-[16/7]' : 'aspect-[16/10]'}`}>
          <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
          <span className="absolute left-3 top-3 bg-[var(--slot4-dark-bg)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-white">{taskLabel}</span>
        </div>
      ) : null}
      <div className="p-5">
        {!image ? <span className="bg-[var(--slot4-dark-bg)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-white">{taskLabel}</span> : null}
        <h2 className="mt-3 line-clamp-2 text-lg font-medium leading-snug text-[var(--slot4-page-text)]">{post.title}</h2>
        {summary ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{summary}</p> : null}
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--slot4-accent)]">View <ArrowUpRight className="h-3.5 w-3.5" /></span>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        {/* Search header */}
        <section className="border-b border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-end">
              <div>
                <p className="text-sm font-medium text-[var(--slot4-accent)]">{pagesContent.search.hero.badge}</p>
                <h1 className="editable-display mt-3 text-3xl leading-[1.1] sm:text-4xl">{pagesContent.search.hero.title}</h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--slot4-muted-text)]">{pagesContent.search.hero.description}</p>
              </div>
              <form action="/search" className="border border-[var(--editable-border)] bg-[var(--slot4-page-bg)] p-4">
                <input type="hidden" name="master" value="1" />
                <label className="flex items-center gap-2.5 border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-3">
                  <Search className="h-4 w-4 text-[var(--slot4-muted-text)]" />
                  <input name="q" defaultValue={query} placeholder={pagesContent.search.hero.placeholder} className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[var(--slot4-muted-text)]" />
                </label>
                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                  <label className="flex items-center gap-2 border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-2.5">
                    <Filter className="h-4 w-4 text-[var(--slot4-muted-text)]" />
                    <input name="category" defaultValue={category} placeholder="Category" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-muted-text)]" />
                  </label>
                  <select name="task" defaultValue={task} className="border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-2.5 text-sm font-medium outline-none">
                    <option value="">All content types</option>
                    {enabledTasks.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                  </select>
                </div>
                <button className="mt-2.5 inline-flex h-10 w-full items-center justify-center bg-[var(--slot4-dark-bg)] text-sm font-medium text-[var(--slot4-dark-text)] transition hover:opacity-90" type="submit">Search</button>
              </form>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--slot4-muted-text)]">{results.length} results</p>
              <h2 className="editable-display mt-1 text-2xl">{query ? `Results for "${query}"` : pagesContent.search.resultsTitle}</h2>
            </div>
            <Link href="/article" className="inline-flex items-center gap-2 border border-[var(--editable-border)] px-4 py-2 text-sm font-medium transition hover:border-[var(--slot4-page-text)]">Browse latest <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {results.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => <SearchResultCard key={post.id || post.slug} post={post} index={index} />)}
            </div>
          ) : (
            <div className="mt-8 border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-10 text-center">
              <p className="editable-display text-xl">No matching posts found.</p>
              <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">Try a different keyword, task type, or category.</p>
            </div>
          )}
        </section>
      </main>
    </EditableSiteShell>
  )
}
