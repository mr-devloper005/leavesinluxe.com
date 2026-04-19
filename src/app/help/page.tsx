import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, LifeBuoy, Mail, Shield, Sparkles } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { VisualResourceShell, VisualResourceButtonLink } from '@/components/marketing/visual-resource-shell'

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Guides, safety tips, and answers for publishing, community, and account questions.',
}

const guides = [
  {
    title: 'Start in under five minutes',
    body: 'Create an account, confirm your email, and publish your first gallery or community post. We keep defaults calm so you can iterate without reconfiguring everything.',
    icon: Sparkles,
  },
  {
    title: 'Publishing with intention',
    body: 'Use descriptive titles, add alt text on hero imagery, and pick categories that match how readers search. Strong metadata keeps your work discoverable without keyword stuffing.',
    icon: BookOpen,
  },
  {
    title: 'Staying safe and respectful',
    body: 'Report content that breaks guidelines, mute threads that are off-topic, and use private messages for sensitive coordination. Moderation tooling mirrors what you see on the home experience.',
    icon: Shield,
  },
  {
    title: 'When something breaks',
    body: 'Check the status page for platform incidents first. If the issue is account-specific, send diagnostics from the contact form so support can reproduce quickly.',
    icon: LifeBuoy,
  },
]

const faqs = [
  {
    id: 'faq-account',
    question: 'How do I reset access to my account?',
    answer:
      'Use the forgot-password flow on the sign-in page. If you no longer have access to your email, contact support with proof of ownership and we will walk through a manual recovery.',
  },
  {
    id: 'faq-media',
    question: 'What image formats and sizes work best?',
    answer:
      'Upload JPG, PNG, or WebP under 20MB for hero imagery. We recommend at least 1600px on the long edge for full-bleed galleries so compression stays invisible on retina displays.',
  },
  {
    id: 'faq-community',
    question: 'How are community posts ranked?',
    answer:
      'Recency matters, but thoughtful replies and completed profiles receive a gentle boost. Spam patterns are demoted automatically before they reach the wider feed.',
  },
  {
    id: 'faq-billing',
    question: 'Where can I manage receipts and invoices?',
    answer:
      'Open settings from your avatar menu, then Billing. You can download PDF receipts, update tax details, and pause renewals without losing draft posts.',
  },
  {
    id: 'faq-api',
    question: 'Do you offer an API for partners?',
    answer:
      'Yes. Review the Developers section for authentication patterns, rate limits, and webhook signing. Sandbox keys are issued instantly after email verification.',
  },
]

export default function HelpPage() {
  return (
    <VisualResourceShell
      eyebrow="Help Center"
      title="Guides, guardrails, and quick answers—without leaving the visual lane."
      description="Everything here uses the same deep navy shell, glass panels, and mint actions as the homepage so help feels like part of the product, not a bolted-on wiki."
      actions={
        <>
          <VisualResourceButtonLink href="/contact">
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact support
            </span>
          </VisualResourceButtonLink>
          <VisualResourceButtonLink href="/status" variant="ghost">
            System status
          </VisualResourceButtonLink>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {guides.map((item) => (
          <article
            key={item.title}
            className="rounded-[2rem] border border-white/10 bg-[rgba(11,18,31,0.72)] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition hover:border-white/20"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#8df0c8]">
              <item.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em]">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{item.body}</p>
            <Link href="/contact" className="mt-5 inline-flex text-sm font-semibold text-[#8df0c8] hover:underline">
              Ask a specialist
            </Link>
          </article>
        ))}
      </div>

      <section className="mt-14 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Popular workflows</p>
          <h3 className="mt-3 text-2xl font-semibold">Jump to the moment you are in</h3>
          <ul className="mt-6 space-y-4 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#8df0c8]" />
              Onboarding a editorial team with shared drafts and approvals.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#8df0c8]" />
              Migrating an existing gallery without losing SEO history.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#8df0c8]" />
              Launching a community ritual (weekly prompts, AMAs, critiques).
            </li>
          </ul>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-[rgba(11,18,31,0.78)] p-8">
          <h3 className="text-lg font-semibold">FAQ</h3>
          <Accordion type="single" collapsible className="mt-4 divide-y divide-white/10">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border-0">
                <AccordionTrigger className="py-4 text-left text-sm font-semibold text-white hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-7 text-slate-300">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </VisualResourceShell>
  )
}
