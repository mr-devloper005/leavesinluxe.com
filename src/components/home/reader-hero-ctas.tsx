import Link from 'next/link'

const btnPrimary =
  'inline-flex items-center justify-center rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-900'
const btnSecondary =
  'inline-flex items-center justify-center rounded-full border border-black/20 bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50'

export function ReaderHeroCtas() {
  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link href="/article" className={btnPrimary}>
          Browse articles
        </Link>
        <Link href="/contact" className={btnSecondary}>
          Contact us
        </Link>
      </div>
      <p className="mt-6 text-sm text-neutral-800">
        Explore live posts from the connected publishing feed.
      </p>
    </>
  )
}
