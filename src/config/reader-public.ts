import { SITE_FACTORY_RECIPE } from '@/config/site.factory'

/** Home + inner pages use the same reader shell when this layout is active */
export const isReaderPublicUi = SITE_FACTORY_RECIPE.homeLayout === 'article-home'

export const readerPageBg = 'bg-[#F6F6F6] text-[#111]'
export const readerHeaderBand = 'border-b border-black/[0.06] bg-white'
export const readerMainPad = 'mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'
export const readerCard =
  'rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
export const readerMuted = 'text-neutral-600'
export const readerInput =
  'h-11 rounded-full border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200'
export const readerButtonPrimary =
  'inline-flex h-11 items-center justify-center rounded-full bg-black px-8 text-sm font-semibold text-white hover:bg-neutral-900'
export const readerButtonGhost =
  'rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50'
