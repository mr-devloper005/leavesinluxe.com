'use client'

import type { ReactNode } from 'react'
import { NavbarShell } from '@/components/shared/navbar-shell'
import { Footer } from '@/components/shared/footer'
import { isReaderPublicUi, readerHeaderBand, readerMainPad, readerPageBg } from '@/config/reader-public'
import { cn } from '@/lib/utils'

export function PageShell({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className={cn('flex min-h-screen flex-col', isReaderPublicUi ? readerPageBg : 'bg-background')}>
      <NavbarShell />
      <main className="flex-1">
        <section
          className={
            isReaderPublicUi
              ? cn(readerHeaderBand, 'shadow-[0_1px_0_rgba(0,0,0,0.04)]')
              : 'border-b border-border bg-secondary/30'
          }
        >
          <div className={cn(isReaderPublicUi ? 'mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8' : 'mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8')}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1
                  className={
                    isReaderPublicUi
                      ? 'text-3xl font-extrabold tracking-tight text-[#111] sm:text-4xl'
                      : 'text-3xl font-bold text-foreground'
                  }
                >
                  {title}
                </h1>
                {description && (
                  <p
                    className={
                      isReaderPublicUi
                        ? 'mt-2 max-w-2xl text-base text-neutral-600'
                        : 'mt-2 max-w-2xl text-muted-foreground'
                    }
                  >
                    {description}
                  </p>
                )}
              </div>
              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </div>
          </div>
        </section>
        <section className={isReaderPublicUi ? readerMainPad : 'mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8'}>
          {children}
        </section>
      </main>
      <Footer />
    </div>
  )
}
