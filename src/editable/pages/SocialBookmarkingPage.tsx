import { EditableTaskArchiveRoute, taskMetadata } from '@/editable/pages/TaskArchivePage'

export const revalidate = 3

export const generateMetadata = () => taskMetadata('sbm', '/sbm')

export async function SocialBookmarkingPageTaskPage({
  searchParams,
  basePath = '/sbm',
}: {
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  return <EditableTaskArchiveRoute task="sbm" searchParams={searchParams} basePath={basePath} />
}

export default SocialBookmarkingPageTaskPage

export const SocialBookmarkingTaskPage = SocialBookmarkingPageTaskPage
