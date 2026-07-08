export const dynamic = 'force-dynamic'
import ListingDetailPage, {
  generateMetadata as generateListingMetadata,
} from '@/editable/pages/ListingDetailPage'

export const revalidate = 3
export const generateMetadata = generateListingMetadata
export default ListingDetailPage
