export type BrandPackKey =
  | 'editorial-luxe'
  | 'directory-clean'
  | 'studio-dark'
  | 'market-utility'
  | 'aurora-mystic'
  | 'editorial'
  | 'mediaDistribution'
  | (string & {})
export type NavbarLayoutKey = 'editorial-bar' | 'compact-bar' | 'floating-bar' | 'utility-bar' | 'folio-nav' | (string & {})
export type FooterLayoutKey = 'editorial-footer' | 'columns-footer' | 'dense-footer' | 'minimal-footer'
export type HomeLayoutKey = 'article-home' | 'listing-home' | 'image-profile-home' | 'classified-home' | 'editorial-home' | (string & {})
export type MotionPackKey = 'editorial-soft' | 'minimal' | 'studio-stagger' | 'utility-snappy' | (string & {})

export type TaskKey = 'listing' | 'classified' | 'article' | 'image' | 'profile' | 'pdf' | 'sbm'

export type TaskLayoutKey =
  | 'listing-directory'
  | 'listing-showcase'
  | 'classified-bulletin'
  | 'classified-market'
  | 'classified-grid'
  | 'article-editorial'
  | 'article-journal'
  | 'image-masonry'
  | 'image-portfolio'
  | 'image-gallery'
  | 'profile-creator'
  | 'profile-business'
  | 'pdf-library'
  | 'sbm-curation'
  | 'sbm-library'
  | 'sbm-board'
  | (string & {})

export type BrandPack = {
  key: BrandPackKey
  displayName: string
  bodyClassName: string
  fontClassName: string
  paletteClassName: string
  surfaceClassName: string
  accentClassName: string
}

export type SiteFactoryRecipe = {
  brandPack: BrandPackKey
  navbar: NavbarLayoutKey
  footer: FooterLayoutKey
  homeLayout: HomeLayoutKey
  motionPack: MotionPackKey
  primaryTask: TaskKey
  enabledTasks: TaskKey[]
  taskLayouts: Partial<Record<TaskKey, TaskLayoutKey>>
}
