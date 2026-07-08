export { generateMetadata } from '@/editable/pages/BusinessListingPage'
import { BusinessListingTaskPage } from '@/editable/pages/BusinessListingPage'

export default function BusinessListingPage(props: { searchParams?: Promise<{ category?: string; page?: string }> }) {
  return <BusinessListingTaskPage {...props} basePath="/business-listing" />
}

export const revalidate = 3
