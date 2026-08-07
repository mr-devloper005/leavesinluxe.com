'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, ImageIcon, Lock, PlusCircle, Send, Sparkles } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  listing: Sparkles,
  classified: PlusCircle,
  image: ImageIcon,
  profile: Sparkles,
  pdf: FileText,
  sbm: ArrowRight,
}

const fieldClass = 'border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-4 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-muted-text)] focus:border-[var(--slot4-accent)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((item) => item.key === task) || enabledTasks[0]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-[var(--slot4-page-bg)] px-4 py-16 text-[var(--slot4-page-text)] sm:px-6 lg:px-8">
          <section className="mx-auto grid max-w-4xl gap-10 border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 md:grid-cols-[0.8fr_1.2fr] md:p-12">
            <div className="flex h-full min-h-56 items-center justify-center bg-[var(--slot4-dark-bg)] text-[var(--slot4-dark-text)]">
              <Lock className="h-16 w-16 opacity-60" />
            </div>
            <div className="self-center">
              <p className="text-sm font-medium text-[var(--slot4-accent)]">{pagesContent.create.locked.badge}</p>
              <h1 className="editable-display mt-3 text-3xl leading-[1.1] sm:text-4xl">{pagesContent.create.locked.title}</h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-[var(--slot4-muted-text)]">{pagesContent.create.locked.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/login" className="inline-flex items-center gap-2 bg-[var(--slot4-dark-bg)] px-5 py-2.5 text-sm font-medium text-[var(--slot4-dark-text)]">Login <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/signup" className="inline-flex items-center gap-2 border border-[var(--editable-border)] px-5 py-2.5 text-sm font-medium">Sign up</Link>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <aside>
              <p className="text-sm font-medium text-[var(--slot4-accent)]">{pagesContent.create.hero.badge}</p>
              <h1 className="editable-display mt-3 text-3xl leading-[1.1] sm:text-4xl">{pagesContent.create.hero.title}</h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-[var(--slot4-muted-text)]">{pagesContent.create.hero.description}</p>
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {enabledTasks.map((item) => {
                  const Icon = taskIcon[item.key] || FileText
                  const active = item.key === task
                  return (
                    <button key={item.key} type="button" onClick={() => setTask(item.key)} className={`border p-4 text-left transition ${active ? 'border-[var(--slot4-accent)] bg-[var(--slot4-accent-soft)]' : 'border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] hover:-translate-y-0.5'}`}>
                      <Icon className={`h-5 w-5 ${active ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-muted-text)]'}`} />
                      <span className="mt-2 block text-sm font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <form onSubmit={submit} className="border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[var(--slot4-accent)]">Create {activeTask?.label || 'post'}</p>
                  <h2 className="editable-display mt-1 text-2xl">{pagesContent.create.formTitle}</h2>
                </div>
                <span className="bg-[var(--slot4-panel-bg)] px-3 py-1.5 text-xs font-medium">{session.name}</span>
              </div>

              <div className="mt-6 grid gap-3">
                <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" required />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={fieldClass} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
                  <input className={fieldClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Website or source URL" />
                </div>
                <input className={fieldClass} value={image} onChange={(e) => setImage(e.target.value)} placeholder="Featured image URL" />
                <textarea className={`${fieldClass} min-h-20`} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short summary" required />
                <textarea className={`${fieldClass} min-h-40`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Main content" required />
              </div>

              {created ? (
                <div className="mt-4 border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <p className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-5 w-5" /> {pagesContent.create.successTitle}</p>
                  <p className="mt-1 text-sm text-emerald-700">{created.title}</p>
                </div>
              ) : null}

              <button type="submit" className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 bg-[var(--slot4-dark-bg)] text-sm font-medium text-[var(--slot4-dark-text)] transition hover:opacity-90">
                <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
              </button>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
