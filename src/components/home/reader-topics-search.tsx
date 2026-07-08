'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

export function ReaderTopicsSearch() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const qFromUrl = pathname === '/search' ? (searchParams.get('q') ?? '') : ''

  return (
    <form action="/search" method="get" role="search" className="mt-8 w-full max-w-md">
      <label className="relative flex w-full items-center">
        <span className="sr-only">Search articles and profiles</span>
        <Search className="pointer-events-none absolute left-5 h-5 w-5 shrink-0 text-neutral-400" aria-hidden />
        <input
          key={`topics-search-${pathname}-${qFromUrl}`}
          type="search"
          name="q"
          defaultValue={qFromUrl}
          placeholder="Search articles"
          autoComplete="off"
          className="h-14 w-full rounded-full border border-neutral-200 bg-white py-3 pl-12 pr-5 text-sm text-neutral-900 shadow-[0_8px_30px_rgba(0,0,0,0.08)] outline-none ring-offset-2 transition placeholder:text-neutral-500 hover:border-neutral-300 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
        />
      </label>
      <input type="hidden" name="master" value="1" />
    </form>
  )
}
