export const dynamic = 'force-dynamic'
import SocialBookmarkingDetailPage, {
  generateMetadata as generateSbmMetadata,
} from '@/editable/pages/SocialBookmarkingDetailPage'

export const revalidate = 3
export const generateMetadata = generateSbmMetadata
export default SocialBookmarkingDetailPage
