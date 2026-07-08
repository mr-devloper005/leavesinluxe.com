import { EditableTaskDetailRoute, generateEditableDetailMetadata } from '@/editable/pages/TaskDetailPage'

export const revalidate = 3

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return generateEditableDetailMetadata('article', params)
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <EditableTaskDetailRoute task="article" params={params} />
}
