import { buildTaskMetadata } from '@/lib/seo'
import { fetchTaskPosts } from '@/lib/task-data'
import { normalizeCategory } from '@/lib/categories'
import { CommunityExploreView } from '@/components/marketing/community-explore-view'

export const revalidate = 3

export const generateMetadata = () => buildTaskMetadata('social')

export default async function CommunityPage({ searchParams }: { searchParams?: { category?: string } }) {
  const posts = await fetchTaskPosts('social', 30)
  const normalizedCategory = searchParams?.category ? normalizeCategory(searchParams.category) : 'all'

  return <CommunityExploreView initialPosts={posts} normalizedCategory={normalizedCategory} />
}
