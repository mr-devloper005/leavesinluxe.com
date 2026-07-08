export { generateMetadata } from '@/editable/pages/ClassifiedPage'
import { ClassifiedTaskPage } from '@/editable/pages/ClassifiedPage'

export default function ClassifiedsPage(props: { searchParams?: Promise<{ category?: string; page?: string }> }) {
  return <ClassifiedTaskPage {...props} basePath="/classifieds" />
}

export const revalidate = 3
