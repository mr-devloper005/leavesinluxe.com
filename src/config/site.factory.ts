import type { SiteFactoryRecipe } from '@/design/factory/types'

export const SITE_FACTORY_RECIPE: SiteFactoryRecipe = {
  brandPack: 'editorial-luxe',
  navbar: 'compact-bar',
  footer: 'editorial-footer',
  homeLayout: 'article-home',
  motionPack: 'editorial-soft',
  primaryTask: 'article',
  enabledTasks: ['article', 'profile'],
  taskLayouts: {
    article: 'article-editorial',
    profile: 'profile-business',
  },
}
