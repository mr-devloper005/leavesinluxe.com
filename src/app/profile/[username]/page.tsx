export const dynamic = 'force-dynamic'
import ProfileDetailPage, {
  generateMetadata as generateProfileMetadata,
} from '@/editable/pages/ProfileDetailPage'

export const revalidate = 3
export const generateMetadata = generateProfileMetadata
export default ProfileDetailPage
