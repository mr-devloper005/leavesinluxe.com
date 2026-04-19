import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, Clock3, Cpu, Database, Radio, Server } from 'lucide-react'
import { VisualResourceShell, VisualResourceButtonLink } from '@/components/marketing/visual-resource-shell'

export const metadata: Metadata = {
  title: 'System Status',
  description: 'Live health for core services, ingestion pipelines, and historical incidents.',
}

const services = [
  {
    name: 'Edge application',
    detail: 'SSR, routing, auth sessions',
    status: 'Operational' as const,
    uptime: 99.99,
    icon: Server,
  },
  {
    name: 'Media pipeline',
    detail: 'Uploads, derivatives, CDN fan-out',
    status: 'Operational' as const,
    uptime: 99.97,
    icon: Radio,
  },
  {
    name: 'Search & indexing',
    detail: 'Community and article discovery',
    status: 'Operational' as const,
    uptime: 99.95,
    icon: Database,
  },
  {
    name: 'Realtime & notifications',
    detail: 'Bell, email digests, webhooks',
    status: 'Degraded' as const,
    uptime: 99.12,
    icon: Activity,
  },
  {
    name: 'Background workers',
    detail: 'Thumbnails, imports, billing sync',
    status: 'Operational' as const,
    uptime: 99.9,
    icon: Cpu,
  },
]

const incidents = [
  {
    window: 'Apr 10 · 06:40–09:12 UTC',
    title: 'Notification fan-out latency',
    impact: 'Email digests delayed up to 25 minutes. Push was unaffected.',
    state: 'Resolved',
  },
  {
    window: 'Mar 12 · 14:05–15:40 UTC',
    title: 'Delayed inbox badges',
    impact: 'Community counters refreshed slowly across mobile web.',
    state: 'Resolved',
  },
  {
    window: 'Feb 22 · 09:10–11:58 UTC',
    title: 'Search indexing lag',
    impact: 'New posts took up to 40 minutes to appear in global search.',
    state: 'Resolved',
  },
]

function statusStyles(status: (typeof services)[number]['status']) {
  if (status === 'Operational') return 'bg-[#8df0c8]/15 text-[#8df0c8] border-[#8df0c8]/30'
  if (status === 'Degraded') return 'bg-amber-400/15 text-amber-200 border-amber-300/30'
  return 'bg-rose-400/15 text-rose-100 border-rose-300/30'
}

export default function StatusPage() {
  return (
    <VisualResourceShell
      eyebrow="Status"
      title="Transparent uptime with the same calm, high-contrast shell as home."
      description="We publish live component health, rolling uptime, and incident narratives here. Subscribe to updates from the Developers page if you need webhook-driven alerts."
      actions={
        <>
          <VisualResourceButtonLink href="/developers">Integration guide</VisualResourceButtonLink>
          <VisualResourceButtonLink href="/contact" variant="ghost">
            Report an issue
          </VisualResourceButtonLink>
        </>
      }
    >
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.name}
            className="rounded-[1.8rem] border border-white/10 bg-[rgba(11,18,31,0.72)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.32)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#8df0c8]">
                  <service.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{service.name}</h2>
                  <p className="text-xs text-slate-400">{service.detail}</p>
                </div>
              </div>
              <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusStyles(service.status)}`}>
                {service.status}
              </span>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
                <span>30-day uptime</span>
                <span>{service.uptime.toFixed(2)}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#8df0c8]"
                  style={{ width: `${Math.min(100, service.uptime)}%` }}
                />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-14 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <Clock3 className="h-4 w-4 text-[#8df0c8]" />
            Incident history
          </div>
          <h3 className="mt-3 text-2xl font-semibold">Narratives, not vague green checks</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            When something wobbles, we post timelines, customer impact, and mitigations. Resolved items stay visible for ninety days so you can audit what changed in your integration.
          </p>
          <div className="mt-8 space-y-4">
            {incidents.map((incident) => (
              <div key={incident.title} className="rounded-2xl border border-white/10 bg-[rgba(7,16,31,0.65)] px-5 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{incident.window}</div>
                <div className="mt-2 text-base font-semibold">{incident.title}</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">{incident.impact}</p>
                <div className="mt-3 inline-flex rounded-full border border-[#8df0c8]/40 bg-[#8df0c8]/10 px-3 py-1 text-xs font-semibold text-[#8df0c8]">
                  {incident.state}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-dashed border-white/15 bg-[rgba(11,18,31,0.55)] p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Subscribe</p>
            <h4 className="mt-3 text-xl font-semibold">Need proactive pings?</h4>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Wire a status webhook from the developer console to Slack, Microsoft Teams, or PagerDuty. Payloads mirror the public page so auditors see the same numbers you do.
            </p>
            <Link href="/developers" className="mt-5 inline-flex text-sm font-semibold text-[#8df0c8] hover:underline">
              Read the webhook contract
            </Link>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Latency snapshot</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex justify-between border-b border-white/5 pb-3">
                <span>Global edge p50</span>
                <span className="font-semibold text-white">118 ms</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-3">
                <span>API p95</span>
                <span className="font-semibold text-white">420 ms</span>
              </li>
              <li className="flex justify-between">
                <span>Media upload p99</span>
                <span className="font-semibold text-white">1.9 s</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </VisualResourceShell>
  )
}
