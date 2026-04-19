import type { Metadata } from 'next'
import Link from 'next/link'
import { Braces, KeyRound, Terminal, Webhook, Zap } from 'lucide-react'
import { VisualResourceShell, VisualResourceButtonLink } from '@/components/marketing/visual-resource-shell'

export const metadata: Metadata = {
  title: 'Developers',
  description: 'Authentication, REST endpoints, webhooks, and rate limits for partners.',
}

const pillars = [
  {
    title: 'REST + typed SDKs',
    body: 'Resources are grouped by task type—community, media, profiles—so payloads stay predictable. Generate clients from the published OpenAPI bundle.',
    icon: Braces,
  },
  {
    title: 'Scoped API keys',
    body: 'Keys are environment-bound (sandbox vs production) with explicit scopes for read, write, and moderation. Rotate without downtime using overlapping validity windows.',
    icon: KeyRound,
  },
  {
    title: 'Signed webhooks',
    body: 'Every delivery includes an HMAC signature and idempotency key. Replay attacks are blocked at the edge; retries use exponential backoff with jitter.',
    icon: Webhook,
  },
  {
    title: 'Predictable limits',
    body: 'Burst allowances protect shared infrastructure while keeping headroom for seasonal launches. Headers expose remaining credits on every response.',
    icon: Zap,
  },
]

const endpoints = [
  { method: 'GET', path: '/v1/me', note: 'Profile, roles, entitlements' },
  { method: 'POST', path: '/v1/posts', note: 'Create draft or published posts' },
  { method: 'PATCH', path: '/v1/posts/:id', note: 'Partial updates with optimistic locking' },
  { method: 'DELETE', path: '/v1/media/:id', note: 'Soft delete with CDN purge' },
]

const limits = [
  { name: 'Authenticated reads', value: '1,200 / minute / key' },
  { name: 'Writes (posts, media)', value: '180 / minute / key' },
  { name: 'Webhook deliveries', value: '400 / minute / workspace' },
  { name: 'Burst headroom', value: '2× for 20s windows' },
]

export default function DevelopersPage() {
  return (
    <VisualResourceShell
      eyebrow="Developers"
      title="Build on the same mint-accented stack that powers the public experience."
      description="Whether you are syncing CRM data, embedding curated galleries, or automating community prompts, these docs mirror the calm, high-contrast layout you see on the homepage."
      actions={
        <>
          <VisualResourceButtonLink href="/contact">Request sandbox access</VisualResourceButtonLink>
          <VisualResourceButtonLink href="/status" variant="ghost">
            Check platform status
          </VisualResourceButtonLink>
        </>
      }
    >
      <section className="grid gap-6 md:grid-cols-2">
        {pillars.map((pillar) => (
          <article
            key={pillar.title}
            className="rounded-[2rem] border border-white/10 bg-[rgba(11,18,31,0.72)] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#8df0c8]">
              <pillar.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold">{pillar.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{pillar.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-14 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <Terminal className="h-4 w-4 text-[#8df0c8]" />
            Sample surface
          </div>
          <h3 className="mt-3 text-2xl font-semibold">Endpoints you will touch first</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            All routes are versioned. Breaking changes ship behind new <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-[#8df0c8]">v2</code>,{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-[#8df0c8]">v3</code>, and onward prefixes with at least six months of overlap.
          </p>
          <div className="mt-6 space-y-3 font-mono text-sm">
            {endpoints.map((row) => (
              <div key={row.path} className="flex flex-col gap-1 rounded-xl border border-white/10 bg-[rgba(7,16,31,0.65)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-[#8df0c8]">
                  <span className="font-semibold">{row.method}</span> <span className="text-white">{row.path}</span>
                </div>
                <div className="text-xs text-slate-400 sm:text-right">{row.note}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Detailed OpenAPI + Postman collections ship to verified partners. This page stays layout-first; contract files live in your onboarding bundle.
          </p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-[rgba(11,18,31,0.78)] p-8">
          <h3 className="text-lg font-semibold">Rate limits</h3>
          <p className="mt-2 text-sm text-slate-400">Numbers reflect production defaults; enterprise shards can raise ceilings.</p>
          <ul className="mt-6 space-y-4">
            {limits.map((row) => (
              <li key={row.name} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                <span className="text-sm text-slate-300">{row.name}</span>
                <span className="text-sm font-semibold text-white">{row.value}</span>
              </li>
            ))}
          </ul>
          <Link href="/help" className="mt-8 inline-flex text-sm font-semibold text-[#8df0c8] hover:underline">
            Read the API safety checklist
          </Link>
        </div>
      </section>
    </VisualResourceShell>
  )
}
