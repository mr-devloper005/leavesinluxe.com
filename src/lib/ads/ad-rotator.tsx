'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { SiteAd } from '@/lib/site-connector'
import { AdFrame, type AdSkin } from './ad-frame'

const MIN_DURATION_MS = 1500
const FALLBACK_DURATION_MS = 7000
const PAUSED_RECHECK_MS = 500
const MAX_WEIGHT = 12

/**
 * Build the rotation order from panel data:
 * - sort by `priority` (higher first)
 * - expand by `weight` and interleave so heavier ads appear more often but stay spread out
 */
function buildSequence(ads: SiteAd[]): SiteAd[] {
  const sorted = [...ads].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
  const remaining = sorted.map((ad) =>
    Math.min(Math.max(Math.floor(ad.weight ?? 1), 1), MAX_WEIGHT),
  )
  const seq: SiteAd[] = []
  let total = remaining.reduce((sum, w) => sum + w, 0)
  while (total > 0) {
    for (let i = 0; i < sorted.length; i += 1) {
      if (remaining[i] > 0) {
        seq.push(sorted[i])
        remaining[i] -= 1
        total -= 1
      }
    }
  }
  return seq.length ? seq : sorted
}

/**
 * Smart, panel-driven rotator. Each ad stays for its own `durationMs`; ordering and
 * frequency come from `priority`/`weight`. Rotation pauses while the tab is hidden
 * (no wasted impressions) and, by default, while the user hovers (so they can click).
 * Rendering is delegated to the locked AdFrame, so shape/fit stay guaranteed.
 */
export function AdRotator({
  ads,
  size,
  skin,
  defaultDurationMs = FALLBACK_DURATION_MS,
  pauseOnHover = true,
  className,
  showLabel,
  label,
}: {
  ads: SiteAd[]
  size?: string
  skin?: AdSkin
  defaultDurationMs?: number
  pauseOnHover?: boolean
  className?: string
  showLabel?: boolean
  label?: string
}) {
  const sequence = useMemo(() => buildSequence(ads), [ads])
  const [step, setStep] = useState(0)
  const pausedRef = useRef(false)

  const fallback =
    Number.isFinite(defaultDurationMs) && defaultDurationMs > 0
      ? defaultDurationMs
      : FALLBACK_DURATION_MS

  useEffect(() => {
    if (sequence.length <= 1) return

    let timer: ReturnType<typeof setTimeout>

    const current = sequence[step % sequence.length]
    const duration = Math.max(
      MIN_DURATION_MS,
      typeof current?.durationMs === 'number' && Number.isFinite(current.durationMs)
        ? (current.durationMs as number)
        : fallback,
    )

    const tick = () => {
      const hidden = typeof document !== 'undefined' && document.hidden
      if (pausedRef.current || hidden) {
        timer = setTimeout(tick, PAUSED_RECHECK_MS)
        return
      }
      setStep((prev) => (prev + 1) % sequence.length)
    }

    timer = setTimeout(tick, duration)
    return () => clearTimeout(timer)
  }, [step, sequence, fallback])

  const current = sequence[step % sequence.length]
  if (!current) return null

  return (
    <div
      className={className}
      onMouseEnter={pauseOnHover ? () => { pausedRef.current = true } : undefined}
      onMouseLeave={pauseOnHover ? () => { pausedRef.current = false } : undefined}
    >
      <AdFrame ad={current} size={size} skin={skin} showLabel={showLabel} label={label} />
    </div>
  )
}
