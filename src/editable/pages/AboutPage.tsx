import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main>
        {/* Hero */}
        <section className="border-b border-[var(--editable-border)] bg-[var(--slot4-surface-bg)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <p className="text-sm font-medium text-[var(--slot4-accent)]">{pagesContent.about.badge}</p>
            <h1 className="editable-display mt-3 max-w-2xl text-4xl leading-[1.1] sm:text-5xl">About {SITE_CONFIG.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--slot4-muted-text)]">{pagesContent.about.description}</p>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4 text-base leading-7 text-[var(--slot4-muted-text)]">
              {pagesContent.about.paragraphs.map((p) => <p key={p}>{p}</p>)}
            </div>
            <div className="space-y-4">
              {pagesContent.about.values.map((value) => (
                <div key={value.title} className="border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6">
                  <h2 className="editable-display text-xl">{value.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--slot4-muted-text)]">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
