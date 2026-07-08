// 🔒 LOCKED — source of truth for ad shape.
// Junior/UI devs must NOT edit this (it lives in the locked src/lib layer and the
// editable-guard blocks changes here). Theme/look is customized in
// src/editable/ads/ads-theme.ts; ONLY the shape is fixed here so an ad can never
// be squashed, stretched, cropped, or distorted no matter how a page styles it.

export type AdSlotSpec = {
  /** CSS aspect-ratio string, e.g. '970 / 90'. Locks the box shape. */
  aspectRatio: string
  /** Upper bound on rendered width (px) so the ad never over-stretches. */
  maxWidth: number
  /** 'contain' guarantees the whole creative is always visible (never cropped). */
  fit: 'contain' | 'cover'
}

// Each slot offers one or more APPROVED size variants. The first one is the default.
// Devs may pick a variant via <Ads slot="header" size="banner" /> — but cannot
// invent arbitrary dimensions.
export const AD_SLOTS: Record<string, Record<string, AdSlotSpec>> = {
  header: {
    leaderboard: { aspectRatio: '970 / 90', maxWidth: 970, fit: 'contain' },
    banner: { aspectRatio: '728 / 90', maxWidth: 728, fit: 'contain' },
  },
  sidebar: {
    mpu: { aspectRatio: '300 / 250', maxWidth: 336, fit: 'contain' },
    skyscraper: { aspectRatio: '160 / 600', maxWidth: 200, fit: 'contain' },
  },
  'in-feed': {
    billboard: { aspectRatio: '970 / 250', maxWidth: 970, fit: 'contain' },
    banner: { aspectRatio: '728 / 90', maxWidth: 728, fit: 'contain' },
  },
  'article-bottom': {
    banner: { aspectRatio: '728 / 90', maxWidth: 728, fit: 'contain' },
  },
  footer: {
    leaderboard: { aspectRatio: '970 / 90', maxWidth: 970, fit: 'contain' },
  },
  popup: {
    square: { aspectRatio: '1 / 1', maxWidth: 400, fit: 'contain' },
  },
  // Tall vertical rail (300×1050) — sticky side rails / portrait creatives.
  rail: {
    portrait: { aspectRatio: '300 / 1050', maxWidth: 300, fit: 'contain' },
  },
  // Large landscape feature (1000×400) — hero strip / section breaks.
  feature: {
    wide: { aspectRatio: '1000 / 400', maxWidth: 1000, fit: 'contain' },
  },
  // Forced popup overlay creative. Panel dims drive the actual shape; these are
  // approved fallback boxes (portrait 300×1050, landscape 1000×400, or square).
  interstitial: {
    portrait: { aspectRatio: '300 / 1050', maxWidth: 300, fit: 'contain' },
    landscape: { aspectRatio: '1000 / 400', maxWidth: 1000, fit: 'contain' },
    square: { aspectRatio: '1 / 1', maxWidth: 600, fit: 'contain' },
  },
  // Dismissible bottom anchor bar (wide, short). Panel dims drive.
  anchor: {
    bar: { aspectRatio: '970 / 120', maxWidth: 970, fit: 'contain' },
    leaderboard: { aspectRatio: '970 / 90', maxWidth: 970, fit: 'contain' },
  },
}

const DEFAULT_SPEC: AdSlotSpec = { aspectRatio: '728 / 90', maxWidth: 728, fit: 'contain' }

/** Resolve a slot (+ optional approved size) to its locked spec. */
export function getAdSlot(slot: string, size?: string): AdSlotSpec {
  const variants = AD_SLOTS[slot]
  if (!variants) return DEFAULT_SPEC
  if (size && variants[size]) return variants[size]
  return Object.values(variants)[0] ?? DEFAULT_SPEC
}

/** Approved size names for a slot (for the admin UI / validation). */
export function getSlotSizes(slot: string): string[] {
  return Object.keys(AD_SLOTS[slot] ?? {})
}
