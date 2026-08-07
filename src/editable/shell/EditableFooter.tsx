'use client'

import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled && (task.key === 'classified' || task.key === 'profile'))
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="bg-[var(--slot4-dark-bg)] text-[var(--slot4-dark-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8">
        {/* Main footer grid */}
        <div className="grid gap-10 border-b border-white/10 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-8 w-8 object-contain" />
              <span className="editable-display text-xl font-normal">{SITE_CONFIG.name}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/50">
              {globalContent.footer?.description || SITE_CONFIG.description}
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold text-white/80">Explore</h3>
            <div className="mt-4 grid gap-2.5">
              {taskLinks.map((task) => (
                <Link
                  key={task.key}
                  href={task.route}
                  className="text-sm text-white/40 transition hover:text-white/70"
                >
                  {task.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Site */}
          <div>
            <h3 className="text-sm font-semibold text-white/80">Site</h3>
            <div className="mt-4 grid gap-2.5">
              {[
                ['About', '/about'],
                ['Contact', '/contact'],
                ['Search', '/search'],
                ...(session ? [['Create', '/create']] : [['Login', '/login'], ['Sign up', '/signup']]),
              ].map(([label, href]) => (
                <Link key={href} href={href} className="text-sm text-white/40 transition hover:text-white/70">
                  {label}
                </Link>
              ))}
              {session ? (
                <button
                  type="button"
                  onClick={logout}
                  className="text-left text-sm text-white/40 transition hover:text-white/70"
                >
                  Logout
                </button>
              ) : null}
            </div>
          </div>

          {/* CTA */}
          <div>
            <h3 className="text-sm font-semibold text-white/80">Get started</h3>
            <p className="mt-4 text-sm leading-6 text-white/40">
              Explore posts, share ideas, and connect with the community.
            </p>
            <Link
              href="/signup"
              className="mt-4 inline-flex items-center gap-2 bg-[var(--slot4-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Join now
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/30 sm:flex-row">
          <span>© {year} {SITE_CONFIG.name}. All rights reserved.</span>
          <span>{globalContent.footer?.bottomNote || 'Built for clean discovery.'}</span>
        </div>
      </div>
    </footer>
  )
}
