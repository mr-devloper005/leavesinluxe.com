// 🔒 LOCKED — server wrapper for the forced popup. Fetches the panel-driven ad for
// the `interstitial` slot; if none is targeted, renders nothing (so the popup is
// 100% panel-controlled — drop <AdInterstitial /> in the layout and the panel decides
// whether/what shows). Pass props to tune timing; defaults match the spec (3s).

import { fetchSiteAds, type SiteAd } from '@/lib/site-connector'
import { skinFor } from '@/editable/ads/ads-theme'
import { AdInterstitialClient } from './ad-interstitial-client'

export type AdInterstitialProps = {
  /** Panel slot key (default "interstitial"). */
  slot?: string
  /** Approved size variant (portrait | landscape | square). */
  size?: string
  /** Forced view time before the close (×) appears. Default 3000ms. */
  countdownMs?: number
  /** Show only once per browser session (default true). */
  oncePerSession?: boolean
}

export default async function AdInterstitial({
  slot = 'interstitial',
  size,
  countdownMs,
  oncePerSession,
}: AdInterstitialProps) {
  const ads = await fetchSiteAds(slot)
  if (!ads.length) return null

  // Highest-priority ad wins (popup shows one creative).
  const ad: SiteAd = [...ads].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0]

  return (
    <AdInterstitialClient
      ad={ad}
      size={size}
      skin={skinFor(slot)}
      countdownMs={countdownMs}
      oncePerSession={oncePerSession}
    />
  )
}
