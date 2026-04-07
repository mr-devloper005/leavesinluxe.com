import type { SiteFactoryRecipe } from '@/design/factory/types'

export const SITE_FACTORY_RECIPE: SiteFactoryRecipe = {
  brandPack: 'studio-dark',
  navbar: 'floating-bar',
  footer: 'dense-footer',
  homeLayout: 'image-profile-home',
  motionPack: 'studio-stagger',
  primaryTask: 'image',
  enabledTasks: ['image'],
  taskLayouts: {
    image: 'image-portfolio',
  },
}
