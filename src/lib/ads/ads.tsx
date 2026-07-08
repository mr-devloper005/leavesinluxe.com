import type { ReactNode } from 'react'
import { fetchSiteAds, type SiteAd } from '@/lib/site-connector'
import { AdFrame } from './ad-frame'
import { AdRotator } from './ad-rotator'
import { skinFor } from '@/editable/ads/ads-theme'

export type AdsProps = {
  /** Placement key configured in the Master Panel + locked in ad-slots.ts. */
  slot: string
  /** Approved size variant for the slot (e.g. "leaderboard" | "banner"). */
  size?: string
  /** Placement/margin classes. Shape/fit stay locked — this only positions the slot. */
  className?: string
  /** Pick one fixed ad by position (e.g. one per feed row); disables rotation. */
  index?: number
  /** Rotation is ON by default for multi-ad slots. Set false to pin the first ad. */
  rotate?: boolean
  /** Fallback dwell time (ms) when an ad has no panel-set durationMs. */
  defaultDurationMs?: number
  /** Pause rotation while hovering (default true). */
  pauseOnHover?: boolean
  /** Show the "Sponsored" tag (styled by the theme skin). */
  showLabel?: boolean
  label?: string
  /** Load eagerly — use for above-the-fold slots. */
  eager?: boolean
  /** Rendered when no ad targets this slot. */
  fallback?: ReactNode
}

/**
 * Versatile, panel-driven ad slot.
 *
 * Place it anywhere; style the wrapper freely. The ad's shape, fit, and
 * no-distort guarantee are LOCKED in src/lib/ad-slots.ts, while the look
 * (radius/border/shadow/label) comes from the editable theme in ads-theme.ts.
 *
 *   <Ads slot="header" />                       // themed leaderboard, top of page
 *   <Ads slot="sidebar" className="sticky top-20" />
 *   <Ads slot="header" size="banner" />         // pick an approved size variant
 *   <Ads slot="in-feed" index={i} />            // one fixed ad per feed row
 */
export default async function Ads({
  slot,
  size,
  className,
  index,
  rotate = true,
  defaultDurationMs,
  pauseOnHover = true,
  showLabel = false,
  label,
  eager = false,
  fallback = null,
}: AdsProps) {
  const safeSlot = typeof slot === 'string' ? slot.trim() : ''
  if (!safeSlot) return <>{fallback}</>

  const ads = await fetchSiteAds(safeSlot)
  if (!ads.length) return <>{fallback}</>

  const skin = skinFor(safeSlot)
  const fixed = typeof index === 'number' && Number.isFinite(index)

  if (rotate && !fixed && ads.length > 1) {
    return (
      <AdRotator
        ads={ads}
        size={size}
        skin={skin}
        defaultDurationMs={defaultDurationMs}
        pauseOnHover={pauseOnHover}
        className={className}
        showLabel={showLabel}
        label={label}
      />
    )
  }

  const position = fixed ? Math.abs(Math.floor(index as number)) : 0
  const ad: SiteAd = ads[position % ads.length]

  return (
    <AdFrame
      ad={ad}
      size={size}
      skin={skin}
      className={className}
      showLabel={showLabel}
      label={label}
      eager={eager}
    />
  )
}
// junior breaks logic
