'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ArticleCommentsProps = {
  articleTitle: string
  articleSlug: string
  remoteComments?: LocalComment[]
}

type LocalComment = {
  id: string
  name: string
  email?: string
  comment: string
  createdAt: string
  articleTitle?: string
  articleSlug?: string
}

const COMMENTS_PER_PAGE = 5
const buildStorageKey = (slug: string) => `slot4:article-comments:${slug}`

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return 'Just now'
  }
}

export function ArticleComments({ articleTitle, articleSlug, remoteComments = [] }: ArticleCommentsProps) {
  const storageKey = useMemo(() => buildStorageKey(articleSlug), [articleSlug])
  const [comments, setComments] = useState<LocalComment[]>([])
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey)
      if (!saved) return
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) setComments(parsed)
    } catch {
      setComments([])
    }
  }, [storageKey])

  const combinedComments = useMemo(() => {
    const remote = remoteComments.map((item) => ({ ...item, id: `remote-${item.id}` }))
    return [...comments, ...remote].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [comments, remoteComments])
  const totalPages = Math.max(1, Math.ceil(combinedComments.length / COMMENTS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const visibleComments = combinedComments.slice((currentPage - 1) * COMMENTS_PER_PAGE, currentPage * COMMENTS_PER_PAGE)

  function persist(nextComments: LocalComment[]) {
    window.localStorage.setItem(storageKey, JSON.stringify(nextComments))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim()
    const comment = String(form.get('comment') || '').trim()

    if (!name || comment.length < 10) {
      setStatus('error')
      setMessage('Please add your name and a comment of at least 10 characters.')
      return
    }

    const newComment: LocalComment = {
      id: `local-${Date.now()}`,
      name,
      email: email || undefined,
      comment,
      createdAt: new Date().toISOString(),
      articleTitle,
      articleSlug,
    }

    const nextComments = [newComment, ...comments]
    setComments(nextComments)
    persist(nextComments)
    setPage(1)
    event.currentTarget.reset()
    setStatus('saved')
    setMessage('Comment added.')
  }

  return (
    <section className="mt-10 rounded-[1.5rem] border border-border bg-card/80 p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Discussion</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Comments</h2>
        </div>
        <p className="text-sm text-muted-foreground">{combinedComments.length} comment{combinedComments.length === 1 ? '' : 's'}</p>
      </div>

      {combinedComments.length ? (
        <div className="mt-6 space-y-4">
          {visibleComments.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.comment}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-background/60 p-5 text-sm text-muted-foreground">
          No comments yet. Be the first to add a comment.
        </div>
      )}

      {combinedComments.length > COMMENTS_PER_PAGE ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              Previous
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-2xl border border-border bg-background/60 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input name="name" placeholder="Your name" autoComplete="name" required />
          <Input name="email" type="email" placeholder="Email address (optional)" autoComplete="email" />
        </div>
        <textarea
          name="comment"
          placeholder="Write your comment..."
          required
          minLength={10}
          rows={4}
          className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit">Add comment</Button>
          {message ? (
            <p className={status === 'error' ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}>
              {message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  )
}
