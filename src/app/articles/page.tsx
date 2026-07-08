export { generateMetadata } from '@/editable/pages/ArticlePage'
import { ArticleTaskPage } from '@/editable/pages/ArticlePage'

export default function ArticlesPage(props: { searchParams?: Promise<{ category?: string; page?: string }> }) {
  return <ArticleTaskPage {...props} basePath="/articles" />
}

export const revalidate = 3
