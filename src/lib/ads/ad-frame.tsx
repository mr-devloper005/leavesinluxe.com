// 🔒 LOCKED — the unbreakable ad frame. Enforces the slot's aspect ratio + fit
// (from ad-slots.ts) so the creative is ALWAYS shown fully and undistorted,
// regardless of how a page or theme styles the wrapper. The `skin` prop lets the
// editable theme layer control purely cosmetic things (radius, border, shadow,
// background, label) — but it can never affect the locked shape/fit.

import type { CSSProperties } from 'react'
import { getAdSlot } from '@/lib/ads/ad-slots'
import type { SiteAd } from '@/lib/site-connector'

/** Cosmetic-only tokens the theme may set. None of these touch shape/fit. */
export type AdSkin = {
  radius?: string
  border?: string
  shadow?: string
  background?: string
  padding?: string
  /** Tailwind/utility classes for the "Sponsored" label (e.g. brand colors). */
  labelClassName?: string
}

/** Ensure an ad link is an absolute URL so it never resolves against the host site. */
export function normalizeAdHref(url?: string | null): string {
  const u = (url || '').trim()
  if (!u) return '#'
  if (/^https?:\/\//i.test(u)) return u // already absolute
  if (u.startsWith('//')) return `https:${u}` // protocol-relative
  if (u.startsWith('/')) return u // intentional internal path
  if (/^(mailto:|tel:)/i.test(u)) return u
  return `https://${u}` // bare domain like "apcreatiu.com"
}

export function AdFrame({
  ad,
  size,
  skin,
  className,
  showLabel = false,
  label = 'Sponsored',
  eager = false,
}: {
  ad: SiteAd
  size?: string
  skin?: AdSkin
  className?: string
  showLabel?: boolean
  label?: string
  eager?: boolean
}) {
  const spec = getAdSlot(ad.slot, size) // local slot contract (fallback)

  // The Master Panel validates every ad's image against the slot size, so when the
  // panel sends real dimensions we use THOSE — the banner then looks pixel-identical
  // in the panel and on the site (single source of truth = the panel).
  const hasPanelDims =
    typeof ad.width === 'number' && typeof ad.height === 'number' && ad.width > 0 && ad.height > 0
  const aspectRatio = hasPanelDims ? `${ad.width} / ${ad.height}` : spec.aspectRatio
  const maxWidth = hasPanelDims ? (ad.width as number) : spec.maxWidth

  const frameStyle: CSSProperties = {
    position: 'relative',
    display: 'block',
    width: '100%',
    maxWidth, // 🔒 never over-stretches
    borderRadius: skin?.radius,
    border: skin?.border,
    boxShadow: skin?.shadow,
    padding: skin?.padding,
    background: skin?.background,
  }

  const boxStyle: CSSProperties = {
    display: 'block',
    aspectRatio, // 🔒 shape from panel-validated size (or slot contract)
    overflow: 'hidden',
    borderRadius: 'inherit',
    background: skin?.background ?? '#f3f4f6',
  }

  const imgStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: spec.fit, // 🔒 'contain' → never cropped / squashed / stretched
    display: 'block',
  }

  // A link like "apcreatiu.com" (no scheme) is treated as a relative path by the
  // browser → it would open as /apcreatiu.com on the current site. Add https://.
  const href = normalizeAdHref(ad.linkUrl)

  return (
    <a
      href={href}
      target={ad.openInNewTab === false ? undefined : '_blank'}
      rel="sponsored noopener noreferrer"
      data-ad-slot={ad.slot}
      data-ad-id={ad.id}
      aria-label={ad.altText || ad.name}
      className={className}
      style={frameStyle}
    >
      {showLabel ? (
        <span
          className={skin?.labelClassName}
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            zIndex: 10,
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '2px 6px',
            borderRadius: 4,
            // fall back to a neutral chip only when the theme didn't supply one
            ...(skin?.labelClassName ? {} : { background: 'rgba(0,0,0,0.55)', color: '#fff' }),
          }}
        >
          {label}
        </span>
      ) : null}
      <span style={boxStyle}>
        {isVideoAd(ad) ? (
          <video
            src={ad.imageUrl}
            style={imgStyle}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={ad.altText || ad.name}
          />
        ) : (
          <img
            src={ad.imageUrl}
            alt={ad.altText || ad.name}
            style={imgStyle}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
        )}
      </span>
    </a>
  )
}

/** True when the ad creative is a video (panel mediaType, or a video URL). */
function isVideoAd(ad: SiteAd): boolean {
  if (ad.mediaType === 'video') return true
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(ad.imageUrl || '')
}
