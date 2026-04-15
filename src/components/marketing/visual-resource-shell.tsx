import type { ReactNode } from 'react'
import Link from 'next/link'
import { NavbarShell } from '@/components/shared/navbar-shell'
import { Footer } from '@/components/shared/footer'

type VisualResourceShellProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}

export function VisualResourceShell({ eyebrow, title, description, actions, children }: VisualResourceShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#07101f_0%,#0f1828_42%,#07101f_100%)] text-white">
      <NavbarShell />
      <main>
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">{eyebrow}</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{title}</h1>
                <p className="mt-5 text-base leading-8 text-slate-300">{description}</p>
              </div>
              {actions ? <div className="flex flex-shrink-0 flex-wrap gap-3">{actions}</div> : null}
            </div>
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">{children}</div>
      </main>
      <Footer />
    </div>
  )
}

export function VisualResourceButtonLink({
  href,
  children,
  variant = 'primary',
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'ghost'
}) {
  if (variant === 'ghost') {
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
      >
        {children}
      </Link>
    )
  }
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-[#8df0c8] px-5 py-3 text-sm font-semibold text-[#07111f] transition hover:bg-[#77dfb8]"
    >
      {children}
    </Link>
  )
}
