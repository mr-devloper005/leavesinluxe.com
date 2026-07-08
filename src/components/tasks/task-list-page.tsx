import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Building2, FileText, Image as ImageIcon, LayoutGrid, Tag, User } from 'lucide-react'
import { NavbarShell } from '@/components/shared/navbar-shell'
import { Footer } from '@/components/shared/footer'
import { TaskListClient } from '@/components/tasks/task-list-client'
import { SchemaJsonLd } from '@/components/seo/schema-jsonld'
import { fetchPaginatedTaskPosts } from '@/lib/task-data'
import { SITE_CONFIG, getTaskConfig, type TaskKey } from '@/lib/site-config'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { taskIntroCopy } from '@/config/site.content'
import {
  isReaderPublicUi,
  readerButtonPrimary,
  readerPageBg,
} from '@/config/reader-public'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { taskPageVoices } from '@/editable/content/task-pages.content'

const taskIcons: Record<TaskKey, any> = {
  listing: Building2,
  article: FileText,
  image: ImageIcon,
  profile: User,
  classified: Tag,
  sbm: LayoutGrid,
  pdf: FileText,
}

const variantShells = {
  'listing-directory': 'bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)]',
  'listing-showcase': 'bg-[linear-gradient(180deg,#ffffff_0%,#f4f9ff_100%)]',
  'article-editorial': 'bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.08),transparent_20%),linear-gradient(180deg,#fff8ef_0%,#ffffff_100%)]',
  'article-journal': 'bg-[linear-gradient(180deg,#fffdf9_0%,#f7f1ea_100%)]',
  'image-masonry': 'bg-[linear-gradient(180deg,#09101d_0%,#111c2f_100%)] text-white',
  'image-portfolio': 'bg-[linear-gradient(180deg,#07111f_0%,#13203a_100%)] text-white',
  'profile-creator': 'bg-[linear-gradient(180deg,#0a1120_0%,#101c34_100%)] text-white',
  'profile-business': 'bg-[linear-gradient(180deg,#f6fbff_0%,#ffffff_100%)]',
  'classified-bulletin': 'bg-[linear-gradient(180deg,#edf3e4_0%,#ffffff_100%)]',
  'classified-market': 'bg-[linear-gradient(180deg,#f4f6ef_0%,#ffffff_100%)]',
  'sbm-curation': 'bg-[linear-gradient(180deg,#fff7ee_0%,#ffffff_100%)]',
  'sbm-library': 'bg-[linear-gradient(180deg,#f7f8fc_0%,#ffffff_100%)]',
} as const

export async function TaskListPage({ task, category, page = 1, basePath }: { task: TaskKey; category?: string; page?: number; basePath?: string }) {
  const taskConfig = getTaskConfig(task)
  if (!taskConfig?.enabled) notFound()
  const listPath = basePath || taskConfig?.route || `/${task}`
  const normalizedCategory = category ? normalizeCategory(category) : 'all'
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, {
    page,
    limit: 24,
    category: normalizedCategory,
  })
  const categoryLabel =
    normalizedCategory === 'all'
      ? 'All topics'
      : CATEGORY_OPTIONS.find((c) => c.slug === normalizedCategory)?.name || normalizedCategory
  const intro = taskIntroCopy[task]
  const voice = taskPageVoices[task]
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/$/, '')
  const schemaItems = posts.slice(0, 10).map((post, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${baseUrl}${taskConfig?.route || '/posts'}/${post.slug}`,
    name: post.title,
  }))
  const { recipe } = getFactoryState()
  const layoutKey = recipe.taskLayouts[task as keyof typeof recipe.taskLayouts] || `${task}-${task === 'listing' ? 'directory' : 'editorial'}`
  const isReader = isReaderPublicUi && (task === 'article' || task === 'profile')
  const shellClass = isReader
    ? readerPageBg
    : variantShells[layoutKey as keyof typeof variantShells] || 'bg-background'
  const Icon = taskIcons[task] || LayoutGrid

  const isDark = ['image-masonry', 'image-portfolio', 'profile-creator'].includes(layoutKey)
  const readerUi = {
    muted: 'text-neutral-600',
    panel: 'rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]',
    soft: 'rounded-2xl border border-black/[0.06] bg-neutral-50',
    input:
      'h-11 rounded-full border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200',
    button: readerButtonPrimary,
  }
  const ui = isReader
    ? readerUi
    : isDark
      ? {
          muted: 'text-slate-300',
          panel: 'border border-white/10 bg-white/6',
          soft: 'border border-white/10 bg-white/5',
          input: 'border-white/10 bg-white/6 text-white',
          button: 'bg-white text-slate-950 hover:bg-slate-200',
        }
      : layoutKey.startsWith('article') || layoutKey.startsWith('sbm')
        ? {
            muted: 'text-[#72594a]',
            panel: 'border border-[#dbc6b6] bg-white/90',
            soft: 'border border-[#dbc6b6] bg-[#fff8ef]',
            input: 'border border-[#dbc6b6] bg-white text-[#2f1d16]',
            button: 'bg-[#2f1d16] text-[#fff4e4] hover:bg-[#452920]',
          }
        : {
            muted: 'text-slate-600',
            panel: 'border border-slate-200 bg-white',
            soft: 'border border-slate-200 bg-slate-50',
            input: 'border border-slate-200 bg-white text-slate-950',
            button: 'bg-slate-950 text-white hover:bg-slate-800',
          }

  return (
    <div className={`min-h-screen ${shellClass}`}>
      <NavbarShell />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {task === 'listing' ? (
          <SchemaJsonLd
            data={[
              {
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: 'Business Directory Listings',
                itemListElement: schemaItems,
              },
              {
                '@context': 'https://schema.org',
                '@type': 'LocalBusiness',
                name: SITE_CONFIG.name,
                url: `${baseUrl}/listings`,
                areaServed: 'Worldwide',
              },
            ]}
          />
        ) : null}
        {task === 'article' || task === 'classified' ? (
          <SchemaJsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: `${taskConfig?.label || task} | ${SITE_CONFIG.name}`,
              url: `${baseUrl}${taskConfig?.route || ''}`,
              hasPart: schemaItems,
            }}
          />
        ) : null}

        {layoutKey === 'listing-directory' || layoutKey === 'listing-showcase' ? (
          <section className="mb-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className={`rounded-[2rem] p-7 shadow-[0_24px_70px_rgba(15,23,42,0.07)] ${ui.panel}`}>
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] opacity-70"><Icon className="h-4 w-4" /> {taskConfig?.label || task}</div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-foreground">{voice.headline}</h1>
              <p className={`mt-4 max-w-2xl text-sm leading-7 ${ui.muted}`}>{voice.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={listPath} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${ui.button}`}>Explore results <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/search" className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${ui.soft}`}>Open search</Link>
              </div>
            </div>
            <form className={`grid gap-3 rounded-[2rem] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ${ui.soft}`} action={listPath}>
              <div>
                <label className={`text-xs uppercase tracking-[0.2em] ${ui.muted}`}>{voice.filterLabel}</label>
                <select name="category" defaultValue={normalizedCategory} className={`mt-2 h-11 w-full rounded-xl px-3 text-sm ${ui.input}`}>
                  <option value="all">All categories</option>
                  {CATEGORY_OPTIONS.map((item) => (
                    <option key={item.slug} value={item.slug}>{item.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className={`h-11 rounded-xl text-sm font-medium ${ui.button}`}>Apply filters</button>
            </form>
          </section>
        ) : null}

        {layoutKey === 'article-editorial' || layoutKey === 'article-journal' ? (
          isReader && task === 'article' ? (
            <section className="mb-10 lg:mb-14">
              <div className={`${ui.panel} p-8 lg:p-10`}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{taskConfig?.label || 'Articles'}</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-extrabold tracking-tight text-[#111] lg:text-5xl">
                  {normalizedCategory === 'all' ? voice.headline : categoryLabel}
                </h1>
                <p className={`mt-4 max-w-2xl text-base leading-relaxed ${ui.muted}`}>
                  {normalizedCategory === 'all'
                    ? voice.description
                    : `Showing articles in ${categoryLabel}. Change the category below to sync the list.`}
                </p>
                <form className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end" method="get" action={listPath}>
                  <div className="min-w-0 flex-1">
                    <label htmlFor="article-category" className="sr-only">
                      Category
                    </label>
                    <select
                      id="article-category"
                      name="category"
                      defaultValue={normalizedCategory}
                      className={`w-full min-w-0 sm:max-w-md ${ui.input}`}
                    >
                      <option value="all">All categories</option>
                      {CATEGORY_OPTIONS.map((item) => (
                        <option key={item.slug} value={item.slug}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className={`shrink-0 ${ui.button}`}>
                    Apply filter
                  </button>
                </form>
              </div>
            </section>
          ) : (
            <section className="mb-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div>
                <p className={`text-xs uppercase tracking-[0.3em] ${ui.muted}`}>{taskConfig?.label || task}</p>
                <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-foreground">{voice.headline}</h1>
                <p className={`mt-5 max-w-2xl text-sm leading-8 ${ui.muted}`}>{voice.description}</p>
              </div>
              <div className={`rounded-[2rem] p-6 ${ui.panel}`}>
                <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${ui.muted}`}>Reading note</p>
                <p className={`mt-4 text-sm leading-7 ${ui.muted}`}>{voice.secondaryNote}</p>
                <form className="mt-5 flex items-center gap-3" action={listPath}>
                  <select name="category" defaultValue={normalizedCategory} className={`h-11 flex-1 rounded-xl px-3 text-sm ${ui.input}`}>
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => (
                      <option key={item.slug} value={item.slug}>{item.name}</option>
                    ))}
                  </select>
                  <button type="submit" className={`h-11 rounded-xl px-4 text-sm font-medium ${ui.button}`}>Apply</button>
                </form>
              </div>
            </section>
          )
        ) : null}

        {layoutKey === 'image-masonry' || layoutKey === 'image-portfolio' ? (
          <section className="mb-12 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${ui.soft}`}>
                <Icon className="h-3.5 w-3.5" /> Visual feed
              </div>
              <h1 className="mt-5 text-5xl font-semibold tracking-[-0.05em]">{voice.headline}</h1>
              <p className={`mt-5 max-w-2xl text-sm leading-8 ${ui.muted}`}>{voice.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`min-h-[220px] rounded-[2rem] ${ui.panel}`} />
              <div className={`min-h-[220px] rounded-[2rem] ${ui.soft}`} />
              <div className={`col-span-2 min-h-[120px] rounded-[2rem] ${ui.panel}`} />
            </div>
          </section>
        ) : null}

        {layoutKey === 'profile-creator' || layoutKey === 'profile-business' ? (
          isReader && task === 'profile' ? (
            <section className="mb-10 lg:mb-14">
              <div className={`${ui.panel} p-8 lg:p-10`}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{taskConfig?.label || 'Profiles'}</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-extrabold tracking-tight text-[#111] lg:text-5xl">
                  {normalizedCategory === 'all' ? voice.headline : `${categoryLabel}`}
                </h1>
                <p className={`mt-4 max-w-2xl text-base leading-relaxed ${ui.muted}`}>
                  {normalizedCategory === 'all'
                    ? voice.description
                    : `Showing profiles tagged with ${categoryLabel}. Adjust the filter to explore other topics.`}
                </p>
                <form className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end" method="get" action={listPath}>
                  <div className="min-w-0 flex-1">
                    <label htmlFor="profile-category" className="sr-only">
                      Category
                    </label>
                    <select
                      id="profile-category"
                      name="category"
                      defaultValue={normalizedCategory}
                      className={`w-full min-w-0 sm:max-w-md ${ui.input}`}
                    >
                      <option value="all">All categories</option>
                      {CATEGORY_OPTIONS.map((item) => (
                        <option key={item.slug} value={item.slug}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className={`shrink-0 ${ui.button}`}>
                    Apply filter
                  </button>
                </form>
              </div>
            </section>
          ) : (
            <section className={`mb-12 rounded-[2.2rem] p-8 shadow-[0_24px_70px_rgba(15,23,42,0.1)] ${ui.panel}`}>
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <div className={`min-h-[240px] rounded-[2rem] ${ui.soft}`} />
                <div>
                  <p className={`text-xs uppercase tracking-[0.3em] ${ui.muted}`}>{taskConfig?.label || task}</p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground">{voice.headline}</h1>
                  <p className={`mt-5 max-w-2xl text-sm leading-8 ${ui.muted}`}>{voice.description}</p>
                </div>
              </div>
            </section>
          )
        ) : null}

        {layoutKey === 'classified-bulletin' || layoutKey === 'classified-market' ? (
          <section className="mb-12 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className={`rounded-[1.8rem] p-6 ${ui.panel}`}>
              <p className={`text-xs uppercase tracking-[0.3em] ${ui.muted}`}>{taskConfig?.label || task}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground">{voice.headline}</h1>
              <p className={`mt-4 text-sm leading-7 ${ui.muted}`}>{voice.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {voice.chips.map((item) => (
                <div key={item} className={`rounded-[1.5rem] p-5 ${ui.soft}`}>
                  <p className="text-sm font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {layoutKey === 'sbm-curation' || layoutKey === 'sbm-library' ? (
          <section className="mb-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <p className={`text-xs uppercase tracking-[0.3em] ${ui.muted}`}>{taskConfig?.label || task}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground">{voice.headline}</h1>
              <p className={`mt-5 max-w-2xl text-sm leading-8 ${ui.muted}`}>{voice.description}</p>
            </div>
            <div className={`rounded-[2rem] p-6 ${ui.panel}`}>
              <p className={`text-xs uppercase tracking-[0.24em] ${ui.muted}`}>{voice.filterLabel}</p>
              <form className="mt-4 flex items-center gap-3" action={listPath}>
                <select name="category" defaultValue={normalizedCategory} className={`h-11 flex-1 rounded-xl px-3 text-sm ${ui.input}`}>
                  <option value="all">All categories</option>
                  {CATEGORY_OPTIONS.map((item) => (
                    <option key={item.slug} value={item.slug}>{item.name}</option>
                  ))}
                </select>
                <button type="submit" className={`h-11 rounded-xl px-4 text-sm font-medium ${ui.button}`}>Apply</button>
              </form>
            </div>
          </section>
        ) : null}

        {task === 'pdf' ? (
          <section className="mb-12 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className={`rounded-[2rem] p-7 shadow-[0_24px_70px_rgba(15,23,42,0.07)] ${ui.panel}`}>
              <p className={`text-xs uppercase tracking-[0.3em] ${ui.muted}`}>{voice.eyebrow}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground">{voice.headline}</h1>
              <p className={`mt-5 max-w-2xl text-sm leading-8 ${ui.muted}`}>{voice.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {voice.chips.map((item) => (
                <div key={item} className={`rounded-[1.5rem] p-5 ${ui.soft}`}>
                  <FileText className="h-5 w-5" />
                  <p className="mt-4 text-sm font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {intro ? (
          <section className={`mb-12 rounded-[2rem] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8 ${ui.panel}`}>
            <h2 className="text-2xl font-semibold text-foreground">{intro.title}</h2>
            {intro.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className={`mt-4 text-sm leading-7 ${ui.muted}`}>{paragraph}</p>
            ))}
            {intro.links.length ? (
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {intro.links.map((link) => (
                  <a key={link.href} href={link.href} className="font-semibold text-foreground hover:underline">{link.label}</a>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <TaskListClient
          task={task}
          initialPosts={posts}
          category={normalizedCategory}
          pagination={pagination}
          basePath={listPath}
        />
      </main>
      <Footer />
    </div>
  )
}
