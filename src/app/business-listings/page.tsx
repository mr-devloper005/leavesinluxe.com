export { generateMetadata } from '@/editable/pages/BusinessListingPage'
import { BusinessListingTaskPage } from '@/editable/pages/BusinessListingPage'

export default function BusinessListingsPage(props: { searchParams?: Promise<{ category?: string; page?: string }> }) {
  return <BusinessListingTaskPage {...props} basePath="/business-listings" />
}

export const revalidate = 3
