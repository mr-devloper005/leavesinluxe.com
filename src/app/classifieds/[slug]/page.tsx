export const dynamic = 'force-dynamic'
import ClassifiedDetailPage, {
  generateMetadata as generateClassifiedMetadata,
} from '@/editable/pages/ClassifiedDetailPage'

export const revalidate = 3
export const generateMetadata = generateClassifiedMetadata
export default ClassifiedDetailPage
