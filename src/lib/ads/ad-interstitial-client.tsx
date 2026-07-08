'use client'

// 🔒 LOCKED — forced popup (interstitial) behavior.
// Shows a centered, panel-driven ad over a dim backdrop. The ad CANNOT be skipped
// for `countdownMs` (default 3s); only after that does the close (×) appear on the
// side. Shows once per session by default so navigation doesn't re-pop it. The ad
// shape stays guaranteed by the locked AdFrame; only the skin is themeable.

import { useEffect, useState } from 'react'
import type { SiteAd } from '@/lib/site-connector'
import { AdFrame, type AdSkin } from './ad-frame'

const SESSION_KEY = 'slot4_interstitial_seen'

export function AdInterstitialClient({
  ad,
  size,
  skin,
  countdownMs,
  oncePerSession = true,
}: {
  ad: SiteAd
  size?: string
  skin?: AdSkin
  /** Forced-cover time before × appears. If unset, uses the panel ad's durationMs. */
  countdownMs?: number
  oncePerSession?: boolean
}) {
  // Duration is master-panel-controlled: use the ad's panel durationMs, unless an
  // explicit prop overrides it. Bounded 1–30s so a bad panel value can't trap users.
  const panelMs =
    typeof ad.durationMs === 'number' && Number.isFinite(ad.durationMs) ? ad.durationMs : 0
  const effectiveMs = Math.min(
    30000,
    Math.max(1000, (typeof countdownMs === 'number' && countdownMs > 0 ? countdownMs : panelMs) || 3000),
  )

  const [open, setOpen] = useState(false)
  const [remaining, setRemaining] = useState(Math.ceil(effectiveMs / 1000))

  // Decide whether to show (once per session by default).
  useEffect(() => {
    try {
      if (oncePerSession && sessionStorage.getItem(SESSION_KEY)) return
      if (oncePerSession) sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* sessionStorage unavailable — still show */
    }
    setOpen(true)
  }, [oncePerSession])

  // Countdown — the ad runs for countdownMs before it can be closed.
  useEffect(() => {
    if (!open || remaining <= 0) return
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [open, remaining])

  // Lock page scroll while the popup is up.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null
  const closeable = remaining <= 0

  // Fit any creative inside the viewport (width-, vw-, and vh-bounded).
  const w = typeof ad.width === 'number' && ad.width > 0 ? ad.width : 600
  const h = typeof ad.height === 'number' && ad.height > 0 ? ad.height : 500
  const boxWidth = `min(${w}px, 92vw, calc(86vh * ${w} / ${h}))`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sponsored message"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div style={{ position: 'relative', width: boxWidth, maxHeight: '88vh' }}>
        {closeable ? (
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close ad"
            style={badgeStyle}
          >
            ×
          </button>
        ) : (
          <span aria-hidden="true" style={{ ...badgeStyle, cursor: 'default' }}>
            {remaining}
          </span>
        )}
        <AdFrame ad={ad} size={size} skin={skin} eager showLabel label="Sponsored" />
      </div>
    </div>
  )
}

const badgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: -14,
  right: -14,
  zIndex: 2,
  width: 30,
  height: 30,
  borderRadius: '50%',
  border: 'none',
  background: '#111',
  color: '#fff',
  fontSize: 18,
  lineHeight: '30px',
  textAlign: 'center',
  cursor: 'pointer',
  boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
  padding: 0,
}
