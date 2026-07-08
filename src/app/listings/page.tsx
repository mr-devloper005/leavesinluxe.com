export { generateMetadata } from '@/editable/pages/BusinessListingPage'
import { BusinessListingTaskPage } from '@/editable/pages/BusinessListingPage'

export default function ListingsPage(props: { searchParams?: Promise<{ category?: string; page?: string }> }) {
  return <BusinessListingTaskPage {...props} basePath="/listings" />
}

export const revalidate = 3
