import Link from 'next/link'
import {
  ArrowRight, Bookmark, Building2, ChevronRight, FileText, Image as ImageIcon,
  Megaphone, Search, UserRound,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: Bookmark,
  pdf: FileText,
  profile: UserRound,
}

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

function categoryOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || ''
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

/* ============================= HERO ============================= */
export function EditableHomeHero({ primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const featured = pool[0]
  const categories = SITE_CONFIG.tasks.filter((t) => t.enabled && (t.key === 'classified' || t.key === 'profile'))

  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`py-16 sm:py-20 lg:py-28 ${container}`}>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: text */}
          <div>
            <h1 className="editable-display text-[2.75rem] leading-[1.08] tracking-[-0.01em] sm:text-[3.5rem] lg:text-[4rem]">
              {pagesContent.home.hero.title?.join(' ') || `Discover ${SITE_CONFIG.name}.`}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-7 text-[var(--slot4-muted-text)]">
              {pagesContent.home.hero.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={primaryRoute}
                className="inline-flex items-center gap-2 bg-[var(--slot4-dark-bg)] px-6 py-3 text-sm font-medium text-[var(--slot4-dark-text)] transition hover:opacity-90"
              >
                Explore Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-[var(--editable-border)] px-6 py-3 text-sm font-medium text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-page-text)]"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right: floating badges like Nominal */}
          <div className="relative hidden min-h-[380px] lg:block">
            {categories.map((task, i) => {
              const Icon = taskIcon[task.key] || FileText
              const positions = [
                'top-0 left-8',
                'top-4 right-0',
                'top-1/3 left-0',
                'bottom-1/3 right-4',
                'bottom-8 left-16',
                'bottom-0 right-12',
              ]
              const colors = [
                'bg-[#e8f8f4] text-[#3ecfb4]',
                'bg-[#fce8f0] text-[#e8567c]',
                'bg-[#fff3d6] text-[#d4a020]',
                'bg-[#e8f0fe] text-[#6b8aed]',
                'bg-[#e8f8f4] text-[#3ecfb4]',
                'bg-[#f3e8fe] text-[#9b6bed]',
              ]
              return (
                <Link
                  key={task.key}
                  href={task.route}
                  className={`absolute ${positions[i] || 'top-0 left-0'} flex items-center gap-2.5 rounded-full border border-[var(--editable-border)] bg-white px-4 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${colors[i]}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-[var(--slot4-page-text)]">{task.label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Mobile category pills */}
        <div className="mt-8 flex flex-wrap gap-2 lg:hidden">
          {categories.map((task) => {
            const Icon = taskIcon[task.key] || FileText
            return (
              <Link
                key={task.key}
                href={task.route}
                className="inline-flex items-center gap-2 border border-[var(--editable-border)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-page-text)]"
              >
                <Icon className="h-3.5 w-3.5 text-[var(--slot4-accent)]" /> {task.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Task progress bar — Nominal-style dashboard preview */}
      {featured ? (
        <div className="border-y border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]">
          <div className={`flex items-center gap-6 overflow-x-auto py-4 ${container}`}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--slot4-dark-bg)]">
              <img src="/favicon.png?v=20260413" alt="" className="h-5 w-5 object-contain brightness-0 invert" />
            </span>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-sm font-medium text-[var(--slot4-page-text)]">{pool.length} Posts Available</span>
              <span className="h-4 w-px bg-[var(--editable-border)]" />
              <span className="text-sm text-[var(--slot4-muted-text)]">{categories.length} Sections</span>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-3">
              <Link href={primaryRoute} className="inline-flex items-center gap-1 text-sm font-medium text-[var(--slot4-accent)] transition hover:opacity-80">
                Browse all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

/* ======================== WHAT WE DO — 3 columns ======================== */
export function EditableStoryRail(_props: HomeSectionProps) {
  const categories = SITE_CONFIG.tasks.filter((t) => t.enabled && (t.key === 'classified' || t.key === 'profile'))
  if (!categories.length) return null

  const groups = [
    {
      title: 'Discover',
      description: 'Everything to explore and find what matters.',
      items: categories.slice(0, 3),
    },
    {
      title: 'Connect',
      description: 'Multi-topic browsing and discovery.',
      items: categories.slice(3, 5),
    },
    {
      title: 'Publish',
      description: 'Share your work across every section.',
      items: categories.slice(5),
    },
  ].filter((g) => g.items.length)

  const colors = ['bg-[#e8f8f4]', 'bg-[#e8f8f4]', 'bg-[#e8f8f4]']

  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`py-16 sm:py-20 ${container}`}>
        <p className="text-sm font-medium text-[var(--slot4-accent)]">What We Do</p>
        <h2 className="editable-display mt-3 max-w-2xl text-4xl leading-[1.1] sm:text-5xl">
          A platform for content, profiles, and resources.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--slot4-muted-text)]">
          Browse posts, explore sections, and find useful content — all in one connected experience.
        </p>

        <div className="mt-12 grid gap-px overflow-hidden border border-[var(--editable-border)] bg-[var(--editable-border)] sm:grid-cols-3">
          {groups.map((group, gi) => (
            <div key={group.title} className="flex flex-col bg-[var(--slot4-surface-bg)] p-8">
              <div className={`flex h-12 w-12 items-center justify-center ${colors[gi]}`}>
                {gi === 0 ? <Search className="h-5 w-5 text-[var(--slot4-accent)]" /> : null}
                {gi === 1 ? <Building2 className="h-5 w-5 text-[var(--slot4-accent)]" /> : null}
                {gi === 2 ? <FileText className="h-5 w-5 text-[var(--slot4-accent)]" /> : null}
              </div>
              <h3 className="editable-display mt-8 text-2xl">{group.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{group.description}</p>
              <div className="mt-6 grid gap-2">
                {group.items.map((task) => (
                  <Link
                    key={task.key}
                    href={task.route}
                    className="flex items-center gap-2 text-sm font-medium text-[var(--slot4-page-text)] transition hover:text-[var(--slot4-accent)]"
                  >
                    <span className="flex h-5 w-5 items-center justify-center text-[var(--slot4-accent)]">▸</span>
                    {task.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ======================== RECENT POSTS — Mixed card grid ======================== */

function FeaturedCard({ post, href }: { post: SitePost; href: string }) {
  const image = getEditablePostImage(post)
  const category = categoryOf(post)
  return (
    <Link href={href} className="group relative block overflow-hidden bg-[var(--slot4-dark-bg)] sm:col-span-2">
      <div className="relative aspect-[16/7] overflow-hidden sm:aspect-[16/8]">
        <img src={image} alt={post.title} className="h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-[1.03]" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          {category ? <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--slot4-accent)]">{category}</span> : null}
          <h3 className="editable-display mt-2 max-w-2xl text-2xl leading-snug text-white sm:text-3xl lg:text-4xl">{post.title}</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">{getExcerpt(post, 160)}</p>
        </div>
      </div>
    </Link>
  )
}

function CompactCard({ post, href }: { post: SitePost; href: string }) {
  const image = getEditablePostImage(post)
  const category = categoryOf(post)
  return (
    <Link href={href} className="group block border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
      </div>
      <div className="p-5">
        {category ? <span className="text-xs font-medium text-[var(--slot4-accent)]">{category}</span> : null}
        <h3 className="mt-1.5 line-clamp-2 text-base font-medium leading-snug text-[var(--slot4-page-text)]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 100)}</p>
      </div>
    </Link>
  )
}

function HorizontalCard({ post, href }: { post: SitePost; href: string }) {
  const image = getEditablePostImage(post)
  const category = categoryOf(post)
  return (
    <Link href={href} className="group grid grid-cols-[120px_1fr] gap-4 border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] sm:grid-cols-[160px_1fr]">
      <div className="aspect-square overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
      </div>
      <div className="flex min-w-0 flex-col justify-center">
        {category ? <span className="text-xs font-medium text-[var(--slot4-accent)]">{category}</span> : null}
        <h3 className="mt-1 line-clamp-2 text-base font-medium leading-snug text-[var(--slot4-page-text)]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 90)}</p>
      </div>
    </Link>
  )
}

function EditorialListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const category = categoryOf(post)
  return (
    <Link href={href} className="group flex items-start gap-5 border-b border-[var(--editable-border)] py-5 transition last:border-b-0 hover:opacity-80">
      <span className="editable-display mt-0.5 text-3xl text-[var(--slot4-accent)]">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0">
        {category ? <span className="text-xs font-medium text-[var(--slot4-muted-text)]">{category}</span> : null}
        <h3 className="mt-0.5 line-clamp-2 text-lg font-medium leading-snug text-[var(--slot4-page-text)]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 110)}</p>
      </div>
    </Link>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const activity = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)]).slice(0, 12)
  if (!activity.length) return null

  const featured = activity[0]
  const compactPosts = activity.slice(1, 4)
  const horizontalPosts = activity.slice(4, 7)
  const editorialPosts = activity.slice(7, 12)

  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`py-16 sm:py-20 ${container}`}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--slot4-accent)]">Recent</p>
            <h2 className="editable-display mt-2 text-3xl sm:text-4xl">Latest posts across the platform.</h2>
          </div>
          <Link href={primaryRoute} className="hidden items-center gap-1 text-sm font-medium text-[var(--slot4-page-text)] transition hover:text-[var(--slot4-accent)] sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Featured + compact grid */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured ? <FeaturedCard post={featured} href={postHref(primaryTask, featured, primaryRoute)} /> : null}
          {compactPosts.map((post) => (
            <CompactCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
          ))}
        </div>

        {/* Horizontal cards */}
        {horizontalPosts.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {horizontalPosts.map((post) => (
              <HorizontalCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
            ))}
          </div>
        ) : null}

        {/* Editorial numbered list */}
        {editorialPosts.length ? (
          <div className="mt-10 grid gap-0 lg:grid-cols-2 lg:gap-x-12">
            {editorialPosts.map((post, i) => (
              <EditorialListCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={i} />
            ))}
          </div>
        ) : null}

        <div className="mt-8 text-center sm:hidden">
          <Link href={primaryRoute} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--slot4-accent)]">
            View all posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ======================== TIME SECTIONS ======================== */
const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'Fresh', title: 'New in the last 7 days' },
  browse: { eyebrow: 'Popular', title: 'Trending this month' },
  index: { eyebrow: 'Archive', title: 'From the collection' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((s) => s.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, index) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to explore' }
        const dark = index === 1
        return (
          <section
            key={section.key}
            className={dark ? 'bg-[var(--slot4-dark-bg)] text-[var(--slot4-dark-text)]' : index % 2 === 0 ? 'bg-[var(--slot4-surface-bg)]' : 'bg-[var(--slot4-page-bg)]'}
          >
            <div className={`py-14 sm:py-16 ${container}`}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className={`text-sm font-medium ${dark ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-accent)]'}`}>{copy.eyebrow}</p>
                  <h2 className="editable-display mt-2 text-2xl sm:text-3xl">{copy.title}</h2>
                </div>
                <Link
                  href={section.href || primaryRoute}
                  className={`hidden items-center gap-1 text-sm font-medium transition sm:inline-flex ${
                    dark ? 'text-[var(--slot4-accent)] hover:opacity-80' : 'text-[var(--slot4-page-text)] hover:text-[var(--slot4-accent)]'
                  }`}
                >
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.posts.slice(0, 8).map((post) => (
                  <Link
                    key={post.id || post.slug}
                    href={postHref(primaryTask, post, primaryRoute)}
                    className={`group block transition hover:-translate-y-0.5 ${
                      dark
                        ? 'border border-white/10 bg-white/5 hover:bg-white/10'
                        : 'border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]'
                    }`}
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
                      <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-sm font-medium leading-snug">{post.title}</h3>
                      <p className={`mt-1.5 line-clamp-2 text-xs leading-5 ${dark ? 'text-white/40' : 'text-[var(--slot4-muted-text)]'}`}>
                        {getExcerpt(post, 80)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

/* ======================== CTA BAND ======================== */
export function EditableHomeCta() {
  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`py-20 sm:py-28 ${container}`}>
        <div className="text-center">
          <h2 className="editable-display mx-auto max-w-3xl text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
            Ready to explore?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--slot4-muted-text)]">
            Share your work, explore posts, and connect with the community — all in one platform.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-[var(--slot4-dark-bg)] px-7 py-3 text-sm font-medium text-[var(--slot4-dark-text)] transition hover:opacity-90"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-[var(--editable-border)] px-7 py-3 text-sm font-medium text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-page-text)]"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
