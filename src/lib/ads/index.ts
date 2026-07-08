// 🔒 LOCKED — public entry point for the ads system.
// Pages import the ad component from here: `import { Ads } from '@/lib/ads'`.
// All logic (fetch, decide, rotation, frame, shape contract) lives in this locked
// folder. The only customizable surface is src/editable/ads/ads-theme.ts.

export { default as Ads, type AdsProps } from './ads'
// Body-level, panel-driven placements (mount once in the layout):
export { default as AdInterstitial, type AdInterstitialProps } from './ad-interstitial'
export { default as AdAnchor, type AdAnchorProps } from './ad-anchor'
export { AD_SLOTS, getAdSlot, getSlotSizes, type AdSlotSpec } from './ad-slots'
export { type AdSkin } from './ad-frame'
