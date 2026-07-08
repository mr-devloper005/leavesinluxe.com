'use client'

// 🔒 LOCKED — dismissible bottom anchor bar (the sticky "Sponsored" strip).
// Sticks to the bottom of every page it's mounted on, panel-driven. The user can
// close it any time via the × ; once closed it stays closed for the session. The ad
// shape is guaranteed by the locked AdFrame; only the skin is themeable.

import { useEffect, useState } from 'react'
import type { SiteAd } from '@/lib/site-connector'
import { AdFrame, type AdSkin } from './ad-frame'

const SESSION_KEY = 'slot4_anchor_dismissed'

export function AdAnchorClient({
  ad,
  size,
  skin,
}: {
  ad: SiteAd
  size?: string
  skin?: AdSkin
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return
    } catch {
      /* ignore */
    }
    setShow(true)
  }, [])

  if (!show) return null

  const dismiss = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* ignore */
    }
    setShow(false)
  }

  const w = typeof ad.width === 'number' && ad.width > 0 ? ad.width : 970
  const boxWidth = `min(${w}px, 96vw)`

  return (
    <div
      role="complementary"
      aria-label="Sponsored"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147482000,
        display: 'flex',
        justifyContent: 'center',
        padding: '8px 12px calc(8px + env(safe-area-inset-bottom))',
        background: 'rgba(255,255,255,0.86)',
        backdropFilter: 'blur(6px)',
        borderTop: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ position: 'relative', width: boxWidth }}>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close ad"
          style={{
            position: 'absolute',
            top: -12,
            right: -10,
            zIndex: 2,
            width: 26,
            height: 26,
            borderRadius: '50%',
            border: 'none',
            background: '#111',
            color: '#fff',
            fontSize: 16,
            lineHeight: '26px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            padding: 0,
          }}
        >
          ×
        </button>
        <AdFrame ad={ad} size={size} skin={skin} eager showLabel label="Sponsored" />
      </div>
    </div>
  )
}
