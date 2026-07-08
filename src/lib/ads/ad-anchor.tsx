// 🔒 LOCKED — server wrapper for the dismissible bottom anchor bar. Fetches the
// panel-driven ad for the `anchor` slot; renders nothing when none is targeted, so
// it's 100% panel-controlled — drop <AdAnchor /> in the layout once.

import { fetchSiteAds, type SiteAd } from '@/lib/site-connector'
import { skinFor } from '@/editable/ads/ads-theme'
import { AdAnchorClient } from './ad-anchor-client'

export type AdAnchorProps = {
  /** Panel slot key (default "anchor"). */
  slot?: string
  /** Approved size variant (bar | leaderboard). */
  size?: string
}

export default async function AdAnchor({ slot = 'anchor', size }: AdAnchorProps) {
  const ads = await fetchSiteAds(slot)
  if (!ads.length) return null

  const ad: SiteAd = [...ads].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0]

  return <AdAnchorClient ad={ad} size={size} skin={skinFor(slot)} />
}
