import { siteIdentity } from '@/config/site.identity'
import { siteTaskDefinitions, siteTaskViews } from '@/config/site.tasks'

export type TaskKey =
  | 'listing'
  | 'classified'
  | 'article'
  | 'image'
  | 'profile'
  | 'pdf'
  | 'sbm'

export type TaskConfig = {
  key: TaskKey
  label: string
  route: string
  description: string
  contentType: string
  enabled: boolean
}

export type SiteConfig = {
  name: string
  tagline: string
  description: string
  domain: string
  baseUrl: string
  defaultOgImage: string
  tasks: TaskConfig[]
  taskViews: Partial<Record<TaskKey, string>>
  seo: {
    title: string
    titleTemplate: string
    description: string
    keywords: string[]
  }
}

const enabledTaskKeys: Set<TaskKey> = new Set(
  siteTaskDefinitions.filter((task) => task.enabled).map((task) => task.key as TaskKey)
)

export const SITE_CONFIG: SiteConfig = {
  name: siteIdentity.name,
  tagline: siteIdentity.tagline,
  description: siteIdentity.description,
  domain: siteIdentity.domain,
  baseUrl: siteIdentity.url,
  defaultOgImage: siteIdentity.ogImage,
  tasks: siteTaskDefinitions.map((task) => ({ ...task })),
  taskViews: Object.fromEntries(
    Object.entries(siteTaskViews).filter(([key]) => enabledTaskKeys.has(key as TaskKey))
  ) as Partial<Record<TaskKey, string>>,
  seo: {
    title: `${siteIdentity.name} - ${siteIdentity.tagline}`,
    titleTemplate: `%s | ${siteIdentity.name}`,
    description: siteIdentity.description,
    keywords: [
      'articles',
      'business listings',
      'classifieds',
      'profiles',
      'image sharing',
      'social bookmarking',
      'pdf library',
      'content discovery',
      'visual stories',
      siteIdentity.name,
    ],
  },
}

export const getTaskConfig = (key: TaskKey) =>
  SITE_CONFIG.tasks.find((task) => task.key === key) || null

export const isTaskEnabled = (key: TaskKey) =>
  SITE_CONFIG.tasks.some((task) => task.key === key && task.enabled)
