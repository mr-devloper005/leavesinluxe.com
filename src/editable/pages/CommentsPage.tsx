'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Search } from 'lucide-react'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

type StoredComment = {
  id: string
  name: string
  email?: string
  comment: string
  createdAt: string
  articleTitle?: string
  articleSlug?: string
}

const COMMENTS_PER_PAGE = 8
const COMMENT_KEY_PREFIX = 'slot4:article-comments:'

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

const readCommentsFromStorage = (): StoredComment[] => {
  const items: StoredComment[] = []
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (!key?.startsWith(COMMENT_KEY_PREFIX)) continue
    const articleSlug = key.replace(COMMENT_KEY_PREFIX, '')
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key) || '[]')
      if (!Array.isArray(parsed)) continue
      for (const item of parsed) {
        if (!item || typeof item !== 'object') continue
        if (typeof item.name !== 'string' || typeof item.comment !== 'string') continue
        items.push({
          id: typeof item.id === 'string' ? item.id : `${articleSlug}-${items.length}`,
          name: item.name,
          email: typeof item.email === 'string' ? item.email : undefined,
          comment: item.comment,
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
          articleTitle: typeof item.articleTitle === 'string' ? item.articleTitle : undefined,
          articleSlug: typeof item.articleSlug === 'string' ? item.articleSlug : articleSlug,
        })
      }
    } catch {
      // Ignore corrupted local comment records.
    }
  }

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export default function CommentsPage() {
  const [comments, setComments] = useState<StoredComment[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setComments(readCommentsFromStorage())
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return comments
    return comments.filter((item) => {
      return [item.name, item.email, item.comment, item.articleTitle, item.articleSlug]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    })
  }, [comments, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / COMMENTS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const visibleComments = filtered.slice((currentPage - 1) * COMMENTS_PER_PAGE, currentPage * COMMENTS_PER_PAGE)

  function refreshComments() {
    setComments(readCommentsFromStorage())
    setPage(1)
  }

  return (
    <EditableSiteShell>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">
                <MessageSquare className="h-4 w-4" /> Local comments
              </p>
              <h1 className="editable-display mt-4 text-4xl sm:text-5xl">Comments</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--slot4-muted-text)]">
                Review comments saved in this browser from article pages.
              </p>
            </div>
            <button type="button" className="border border-[var(--editable-border)] px-4 py-2 text-sm font-medium transition hover:border-[var(--slot4-page-text)]" onClick={refreshComments}>Refresh comments</button>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--slot4-muted-text)]" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                placeholder="Search comments..."
                className="h-11 w-full border border-[var(--editable-border)] bg-white pl-9 pr-3 text-sm outline-none focus:border-[var(--slot4-accent)]"
              />
            </div>
            <p className="text-sm text-[var(--slot4-muted-text)]">
              {filtered.length} comment{filtered.length === 1 ? '' : 's'} found
            </p>
          </div>
        </section>

        {visibleComments.length ? (
          <section className="mt-8 grid gap-4">
            {visibleComments.map((item) => (
              <article key={`${item.articleSlug}-${item.id}`} className="border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-[var(--slot4-page-text)]">{item.name}</p>
                    <p className="mt-1 text-xs text-[var(--slot4-muted-text)]">{formatDate(item.createdAt)}</p>
                  </div>
                  {item.articleSlug ? (
                    <Link href={`/article/${item.articleSlug}`} className="text-sm text-[var(--slot4-accent)] hover:underline">
                      Open article
                    </Link>
                  ) : null}
                </div>
                {item.articleTitle ? <p className="mt-4 text-sm font-medium text-[var(--slot4-page-text)]">{item.articleTitle}</p> : null}
                <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{item.comment}</p>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-8 border border-dashed border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-8 text-center">
            <h2 className="editable-display text-xl">No comments yet</h2>
            <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">Add a comment on any article page and it will appear here.</p>
          </section>
        )}

        {filtered.length > COMMENTS_PER_PAGE ? (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-4 text-sm text-[var(--slot4-muted-text)]">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button type="button" className="border border-[var(--editable-border)] px-4 py-2 font-medium disabled:opacity-40" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
              <button type="button" className="border border-[var(--editable-border)] px-4 py-2 font-medium disabled:opacity-40" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</button>
            </div>
          </div>
        ) : null}
      </main>
    </EditableSiteShell>
  )
}
