import { EditableTaskArchiveRoute, taskMetadata } from '@/editable/pages/TaskArchivePage'

export const revalidate = 3

export const generateMetadata = () => taskMetadata('classified', '/classified')

export async function ClassifiedPageTaskPage({
  searchParams,
  basePath = '/classified',
}: {
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  return <EditableTaskArchiveRoute task="classified" searchParams={searchParams} basePath={basePath} />
}

export default ClassifiedPageTaskPage

export const ClassifiedTaskPage = ClassifiedPageTaskPage
