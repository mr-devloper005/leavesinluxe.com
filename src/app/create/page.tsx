import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import { pagesContent } from '@/editable/content/pages.content'
import CreatePage from '@/editable/pages/CreatePage'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/create',
    title: pagesContent.create.metadata.title,
    description: pagesContent.create.metadata.description,
  })
}

export default CreatePage
