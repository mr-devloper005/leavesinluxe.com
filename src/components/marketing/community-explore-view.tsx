import Link from 'next/link'
import { ArrowRight, LayoutGrid, MessageCircle, Users } from 'lucide-react'
import { TaskListClient } from '@/components/tasks/task-list-client'
import { SITE_CONFIG, getTaskConfig } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { VisualResourceShell, VisualResourceButtonLink } from '@/components/marketing/visual-resource-shell'

type Props = {
  initialPosts: SitePost[]
  normalizedCategory: string
}

export function CommunityExploreView({ initialPosts, normalizedCategory }: Props) {
  const taskConfig = getTaskConfig('social')
  const route = taskConfig?.route || '/community'

  return (
    <VisualResourceShell
      eyebrow="Community"
      title="A calmer lane for conversation, groups, and shared discovery."
      description="Browse threads and community posts with the same dark visual rhythm as the homepage—generous spacing, soft panels, and mint accents for primary actions."
      actions={
        <>
          <VisualResourceButtonLink href="/register">Join the community</VisualResourceButtonLink>
          <VisualResourceButtonLink href="/contact" variant="ghost">
            Partner with us
          </VisualResourceButtonLink>
        </>
      }
    >
      <section className="mb-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="rounded-[2rem] border border-white/10 bg-[rgba(11,18,31,0.72)] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <LayoutGrid className="h-4 w-4 text-[#8df0c8]" />
            Live feed
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">What you will find here</h2>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
            <li className="flex gap-3">
              <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#8df0c8]" />
              <span>Topic-led discussions with less noise than a traditional forum grid.</span>
            </li>
            <li className="flex gap-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-[#8df0c8]" />
              <span>Spaces that reward thoughtful replies and recognizable member voices.</span>
            </li>
            <li className="flex gap-3">
              <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-[#8df0c8]" />
              <span>Filters that keep you inside the community lane without jumping layouts.</span>
            </li>
          </ul>
        </div>
        <form
          className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur"
          action={route}
          method="get"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Browse by focus</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">Pick a category to tighten the feed—results update on the same page.</p>
          <label className="mt-6 block text-xs uppercase tracking-[0.18em] text-slate-400" htmlFor="community-category">
            Category
          </label>
          <select
            id="community-category"
            name="category"
            defaultValue={normalizedCategory}
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3 text-sm text-white"
          >
            <option value="all">All categories</option>
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-[#8df0c8] text-sm font-semibold text-[#07111f] hover:bg-[#77dfb8]"
          >
            Apply filters
          </button>
          <Link href="/search" className="mt-4 inline-flex text-sm font-semibold text-[#8df0c8] hover:underline">
            Open global search
          </Link>
        </form>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Community stream</p>
            <h2 className="mt-2 text-2xl font-semibold">Latest posts from {SITE_CONFIG.name}</h2>
          </div>
          <p className="max-w-md text-sm text-slate-400">Cards below inherit the same motion and density as other task feeds—only the framing around them changed.</p>
        </div>
        <TaskListClient task="social" initialPosts={initialPosts} category={normalizedCategory} />
      </section>
    </VisualResourceShell>
  )
}
