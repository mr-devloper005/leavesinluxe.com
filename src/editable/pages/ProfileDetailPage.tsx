import { EditableTaskDetailRoute, generateEditableDetailMetadata } from '@/editable/pages/TaskDetailPage'

export const revalidate = 3

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  return generateEditableDetailMetadata('profile', params)
}

export default async function ProfileDetailPage({ params }: { params: Promise<{ username: string }> }) {
  return <EditableTaskDetailRoute task="profile" params={params} />
}
