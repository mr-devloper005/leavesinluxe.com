export const dynamic = 'force-dynamic'
import ArticleDetailPage, {
  generateMetadata as generateArticleMetadata,
} from '@/editable/pages/ArticleDetailPage'

export const revalidate = 3
export const generateMetadata = generateArticleMetadata
export default ArticleDetailPage
