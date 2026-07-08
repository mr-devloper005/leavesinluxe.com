'use client'

import { useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ReaderScrollRow({
  children,
  className,
  trackClassName,
}: {
  children: React.ReactNode
  className?: string
  trackClassName?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className={cn('relative', className)}>
      <div
        ref={ref}
        className={cn(
          'flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 pr-14 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          trackClassName,
        )}
      >
        {children}
      </div>
      <button
        type="button"
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-[#333] shadow-md transition hover:bg-neutral-50"
        onClick={() => ref.current?.scrollBy({ left: 320, behavior: 'smooth' })}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
