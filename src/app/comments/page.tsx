import type { Metadata } from 'next'
import CommentsPage from '@/editable/pages/CommentsPage'
import { buildPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/comments',
    title: 'Comments',
    description: 'Review locally saved article comments for this site.',
  })
}

export default CommentsPage
