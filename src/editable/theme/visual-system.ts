import { slot4BrandConfig } from './brand.config'

export type Slot4VisualPreset =
  | 'editorial-paper'
  | 'luxury-atelier'
  | 'brutalist-index'
  | 'organic-journal'
  | 'tech-directory'
  | 'retro-bulletin'
  | 'visual-gallery'

export const visualPresets = {
  'editorial-paper': {
    label: 'Editorial Paper',
    mood: 'calm magazine authority',
    fontDirection: 'serif headlines with quiet sans body',
    colors: {
      background: '#fafaf8',
      foreground: '#1a1a1a',
      muted: '#6b6b6b',
      primary: '#1a1a1a',
      accent: '#3ecfb4',
      surface: '#ffffff',
    },
    shape: 'clean cards with fine borders, no radius',
  },
  'luxury-atelier': {
    label: 'Luxury Atelier',
    mood: 'premium, restrained, polished',
    fontDirection: 'DM Serif Display headlines with Inter body',
    colors: {
      background: '#0c0e14',
      foreground: '#f2efe8',
      muted: '#97a0b3',
      primary: '#3ecfb4',
      accent: '#3ecfb4',
      surface: '#1a2130',
    },
    shape: 'dark panels, mint accents, editorial spacing',
  },
  'brutalist-index': {
    label: 'Brutalist Index',
    mood: 'bold, raw, memorable',
    fontDirection: 'condensed headings, mono labels, hard rhythm',
    colors: {
      background: '#f2f0e8',
      foreground: '#111111',
      muted: '#55524a',
      primary: '#111111',
      accent: '#3ecfb4',
      surface: '#ffffff',
    },
    shape: 'sharp edges, thick borders, offset blocks',
  },
  'organic-journal': {
    label: 'Organic Journal',
    mood: 'warm, natural, trustworthy',
    fontDirection: 'rounded serif or humanist sans with soft captions',
    colors: {
      background: '#f4efe5',
      foreground: '#263021',
      muted: '#68705a',
      primary: '#415b32',
      accent: '#3ecfb4',
      surface: '#fffaf0',
    },
    shape: 'rounded cards, natural spacing, calm texture',
  },
  'tech-directory': {
    label: 'Tech Directory',
    mood: 'clean, fast, useful',
    fontDirection: 'modern sans with crisp mono data accents',
    colors: {
      background: '#fafaf8',
      foreground: '#1a1a1a',
      muted: '#6b6b6b',
      primary: '#3ecfb4',
      accent: '#3ecfb4',
      surface: '#ffffff',
    },
    shape: 'clean grids, no radius, sharp information hierarchy',
  },
  'retro-bulletin': {
    label: 'Retro Bulletin',
    mood: 'playful, local, energetic',
    fontDirection: 'chunky headings with friendly body type',
    colors: {
      background: '#fff3c4',
      foreground: '#2b1d12',
      muted: '#7b5736',
      primary: '#2b1d12',
      accent: '#3ecfb4',
      surface: '#fff8da',
    },
    shape: 'stickers, tabs, framed modules, playful dividers',
  },
  'visual-gallery': {
    label: 'Visual Gallery',
    mood: 'cinematic, image-led, immersive',
    fontDirection: 'minimal sans with oversized display moments',
    colors: {
      background: '#07101f',
      foreground: '#f8fbff',
      muted: '#a9b6c8',
      primary: '#3ecfb4',
      accent: '#3ecfb4',
      surface: '#101b2d',
    },
    shape: 'dark cards, large media, glass overlays',
  },
} as const

export const visualSystem = {
  productKind: slot4BrandConfig.productKind,
  recommendedPreset: 'editorial-paper',
  radius: {
    sm: '0',
    md: '0',
    lg: '0',
    xl: '0',
  },
  motion: {
    pageLoad: 'animate-in fade-in slide-in-from-bottom-4 duration-700',
    cardHover: 'transition duration-300 hover:-translate-y-0.5 hover:shadow-lg',
    softHover: 'transition duration-300 hover:opacity-85',
    reduceMotionSafe: 'motion-reduce:transform-none motion-reduce:transition-none',
  },
  typography: {
    eyebrow: 'text-xs font-medium uppercase tracking-[0.18em]',
    heroTitle: 'text-5xl font-normal tracking-[-0.01em] sm:text-6xl lg:text-7xl',
    sectionTitle: 'text-3xl font-normal tracking-[-0.01em] sm:text-4xl',
    body: 'text-base leading-7',
    caption: 'text-xs font-medium uppercase tracking-[0.14em]',
  },
  surfaces: {
    glass: 'border border-white/15 bg-white/10 backdrop-blur-xl',
    paper: 'border border-[var(--editable-border)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
    quiet: 'border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)]',
    dark: 'border border-white/10 bg-[var(--slot4-dark-bg)] text-[var(--slot4-dark-text)]',
  },
  layout: {
    page: 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
    sectionY: 'py-12 sm:py-16 lg:py-20',
    cardGrid: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3',
  },
} as const

export function getVisualPreset(name: Slot4VisualPreset = visualSystem.recommendedPreset as Slot4VisualPreset) {
  return visualPresets[name]
}
