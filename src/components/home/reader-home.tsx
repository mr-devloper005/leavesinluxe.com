import { Suspense } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { ContentImage } from '@/components/shared/content-image'
import { SITE_CONFIG } from '@/lib/site-config'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import type { SitePost } from '@/lib/site-connector'
import type { TaskConfig } from '@/lib/site-config'
import { ReaderScrollRow } from '@/components/home/reader-scroll-row'
import { ReaderHeroCtas } from '@/components/home/reader-hero-ctas'
import { ReaderTopicsSearch } from '@/components/home/reader-topics-search'
import { CategoryIconBadge } from '@/lib/category-visuals'

const cream = 'bg-[#FDF1E5]'
const warmBeige = 'bg-[#FFF9F2]'
const lavender = 'bg-[#D1E0FF]'
const pageGray = 'bg-[#F6F6F6]'

function getPostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const contentImage =
    typeof post?.content === 'object' && post?.content && Array.isArray((post.content as { images?: unknown }).images)
      ? (post.content as { images: string[] }).images.find((url: unknown) => typeof url === 'string' && url)
      : null
  const logo =
    typeof post?.content === 'object' && post?.content && typeof (post.content as { logo?: unknown }).logo === 'string'
      ? (post.content as { logo: string }).logo
      : null
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function ReaderHome({
  articlePosts,
  profilePosts,
}: {
  articlePosts: SitePost[]
  profilePosts: SitePost[]
  primaryTask?: TaskConfig
  supportTasks: TaskConfig[]
}) {
  const uniqueArticles = Array.from(
    new Map(articlePosts.map((post) => [post.slug || post.id || post.title, post])).values()
  )
  const trending = uniqueArticles.slice(0, 12)
  const featured = uniqueArticles.slice(12, 20)
  const pathways = uniqueArticles.slice(20, 26)
  const community = profilePosts.length ? profilePosts.slice(0, 4) : uniqueArticles.slice(26, 30)
  const categories = CATEGORY_OPTIONS.slice(0, 8)

  const articleRoute = SITE_CONFIG.tasks.find((t) => t.key === 'article')?.route ?? '/articles'

  return (
    <main className="text-[#111]">
      {/* Hero */}
      <section className={`${cream} relative overflow-hidden`}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
          <div className="absolute -right-[20%] top-[10%] h-[420px] w-[420px] rounded-full bg-[#F4D7C1] blur-3xl" />
          <div className="absolute -left-[10%] bottom-[5%] h-[320px] w-[320px] rounded-full bg-[#f8e0d0] blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
          <div>
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
              Come for the articles. Stay for the connection.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-neutral-800 sm:text-lg">
              Long reads you can sink into — and profiles worth following. Find your next favorite piece, no matter your
              mood.
            </p>
            <ReaderHeroCtas />
          </div>

          <div className="relative min-h-[320px] lg:min-h-[400px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="relative h-[min(100%,380px)] w-[min(100%,420px)] bg-[#FF6600]"
                style={{
                  clipPath:
                    'polygon(8% 12%, 92% 4%, 98% 45%, 88% 88%, 42% 96%, 6% 78%, 2% 38%)',
                }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(145deg,#ff8533_0%,#ff6600_45%,#e65c00_100%)]" />
                <div className="absolute inset-6 flex flex-col justify-end rounded-sm bg-white/10 p-4 text-white backdrop-blur-[2px]">
                  <p className="text-xs font-medium uppercase tracking-widest opacity-90">Featured on {SITE_CONFIG.name}</p>
                  <p className="mt-2 text-lg font-bold leading-snug">Stories, essays, and voices from the community.</p>
                </div>
              </div>
            </div>

            <div className="absolute left-0 top-[6%] z-10 max-w-[260px] rounded-2xl border border-black/5 bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF6600] text-sm font-extrabold text-white shadow-inner">M</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#FF6600]">reader_mina</p>
                  <p className="mt-1 text-sm leading-snug text-neutral-800">
                    This essay went from thoughtful to unforgettable in two scrolls.
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
                    <Heart className="h-3.5 w-3.5 text-[#FF6600]" />
                    <span>128</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[8%] right-0 z-10 max-w-[260px] rounded-2xl border border-black/5 bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111] text-sm font-extrabold text-white shadow-inner">D</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#FF6600]">dev_notes</p>
                  <p className="mt-1 text-sm leading-snug text-neutral-800">What in the feed?! (i love it)</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
                    <Heart className="h-3.5 w-3.5 text-[#FF6600]" />
                    <span>204</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className={`${warmBeige} relative border-t border-black/[0.06]`}>
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-[linear-gradient(to_bottom,transparent,#ffffff)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Trending now</h2>
            <Link href={articleRoute} className="hidden text-sm font-semibold text-[#006d6d] hover:underline sm:inline">
              See all
            </Link>
          </div>
          {trending.length ? (
            <ReaderScrollRow className="mt-8">
              {trending.map((post) => (
                <Link
                  key={post.id}
                  href={`/articles/${post.slug}`}
                  className="w-[140px] shrink-0 snap-start sm:w-[160px]"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-neutral-200 shadow-sm">
                    <ContentImage src={getPostImage(post)} alt={post.title} fill className="object-cover" />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug">{post.title}</p>
                </Link>
              ))}
            </ReaderScrollRow>
          ) : (
            <p className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-6 py-10 text-center text-sm text-neutral-600">
              New articles will appear here as they are published.
            </p>
          )}
        </div>
      </section>

      {/* Featured band */}
      <section className={`${lavender} relative overflow-hidden`}>
        <div className="pointer-events-none absolute -left-20 top-8 h-40 w-40 rounded-full bg-white/40 blur-2xl" />
        <div className="pointer-events-none absolute -right-16 bottom-4 h-48 w-48 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Must-read articles</h2>
          {featured.length ? (
            <ReaderScrollRow className="mt-10">
              {featured.map((post) => (
                <Link
                  key={post.id}
                  href={`/articles/${post.slug}`}
                  className="w-[140px] shrink-0 snap-start sm:w-[160px]"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/50 shadow-md ring-1 ring-black/5">
                    <ContentImage src={getPostImage(post)} alt={post.title} fill className="object-cover" />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug">{post.title}</p>
                </Link>
              ))}
            </ReaderScrollRow>
          ) : null}
        </div>
      </section>


      {/* Reading pathways */}
      <section className="bg-[#FFF9F2]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div className="rounded-[2rem] border border-[#e8d8c9] bg-white p-7 shadow-[0_18px_50px_rgba(47,29,22,0.06)] lg:sticky lg:top-28">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b76e45]">Reading pathways</p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-[#111]">Choose a lane and keep exploring.</h2>
              <p className="mt-4 text-sm leading-8 text-neutral-700">
                A richer homepage needs different rhythms: quick reads, deeper explainers, and posts that feel worth opening next.
              </p>
              <Link href={articleRoute} className="mt-6 inline-flex rounded-full bg-[#2f1d16] px-6 py-3 text-sm font-bold text-[#fff4e4] hover:bg-[#452920]">
                Browse the archive
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {pathways.slice(0, 4).map((post, index) => (
                <Link
                  key={post.id}
                  href={`/articles/${post.slug}`}
                  className={index === 0 ? 'group overflow-hidden rounded-[2rem] border border-[#e8d8c9] bg-[#2f1d16] text-white shadow-[0_24px_70px_rgba(47,29,22,0.18)] md:col-span-2' : 'group overflow-hidden rounded-[2rem] border border-[#e8d8c9] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(47,29,22,0.10)]'}
                >
                  <div className={index === 0 ? 'grid gap-0 md:grid-cols-[1fr_0.9fr]' : ''}>
                    <div className={index === 0 ? 'relative min-h-[300px]' : 'relative h-52'}>
                      <ContentImage src={getPostImage(post)} alt={post.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                      {index === 0 ? <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(47,29,22,0.36))]" /> : null}
                    </div>
                    <div className={index === 0 ? 'p-7 md:flex md:flex-col md:justify-center' : 'p-5'}>
                      <p className={index === 0 ? 'text-xs font-bold uppercase tracking-[0.24em] text-[#e2c884]' : 'text-xs font-bold uppercase tracking-[0.24em] text-[#b76e45]'}>
                        Path {String(index + 1).padStart(2, '0')}
                      </p>
                      <h3 className={index === 0 ? 'mt-3 text-3xl font-extrabold tracking-tight' : 'mt-3 line-clamp-3 text-xl font-bold tracking-tight text-[#111]'}>{post.title}</h3>
                      <p className={index === 0 ? 'mt-4 line-clamp-4 text-sm leading-8 text-white/75' : 'mt-3 line-clamp-3 text-sm leading-7 text-neutral-700'}>{post.summary || 'Open this story to continue browsing the site archive.'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community / profiles */}
      <section className="bg-[#F6F6F6]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#006d6d]">People behind the feed</p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-[#111]">Profiles, voices, and useful corners.</h2>
            </div>
            <Link href="/profile" className="text-sm font-bold text-[#006d6d] hover:underline">Explore profiles</Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {community.map((post, index) => (
              <Link key={post.id} href={profilePosts.length ? `/profile/${post.slug}` : `/articles/${post.slug}`} className="group rounded-[2rem] border border-black/[0.06] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(0,0,0,0.10)]">
                <div className="relative h-44 overflow-hidden rounded-[1.4rem] bg-neutral-100">
                  <ContentImage src={getPostImage(post)} alt={post.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Spotlight {index + 1}</p>
                <h3 className="mt-2 line-clamp-3 text-xl font-extrabold tracking-tight text-[#111]">{post.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-neutral-700">{post.summary || 'A profile or useful post from this site surface.'}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Topics + search vibe */}
      <section className={`${pageGray}`}>
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">All the topics. All the voices.</h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-700">
              Find your next read — browse by category and discover fresh stories faster.
            </p>
            <Suspense fallback={<div className="mt-8 h-14 max-w-md animate-pulse rounded-full bg-black/5" aria-hidden />}>
              <ReaderTopicsSearch />
            </Suspense>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <ReaderScrollRow trackClassName="gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`${articleRoute}?category=${encodeURIComponent(cat.slug)}`}
                className="flex min-w-[220px] shrink-0 snap-start items-center gap-4 rounded-2xl border border-black/[0.06] bg-white px-4 py-3 shadow-sm transition hover:border-black/10 hover:shadow-md"
              >
                <CategoryIconBadge slug={cat.slug} />
                <span className="font-bold text-neutral-900">{cat.name}</span>
              </Link>
            ))}
          </ReaderScrollRow>
        </div>
      </section>

      {/* Closing CTA */}
      <section id="get-app" className="relative scroll-mt-24 overflow-hidden bg-[#F9EBE0]">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-[#F4D7C1] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Where articles meet audience</h2>
            <p className="mt-4 text-lg text-neutral-800">
              Publish ideas, grow your readership, and connect with people who care about what you share.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={articleRoute}
                className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white hover:bg-neutral-900"
              >
                Browse articles
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
