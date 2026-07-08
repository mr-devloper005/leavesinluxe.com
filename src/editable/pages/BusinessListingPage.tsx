import { EditableTaskArchiveRoute, taskMetadata } from '@/editable/pages/TaskArchivePage'

export const revalidate = 3

export const generateMetadata = () => taskMetadata('listing', '/listing')

export async function BusinessListingPageTaskPage({
  searchParams,
  basePath = '/listing',
}: {
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  return <EditableTaskArchiveRoute task="listing" searchParams={searchParams} basePath={basePath} />
}

export default BusinessListingPageTaskPage

export const BusinessListingTaskPage = BusinessListingPageTaskPage
