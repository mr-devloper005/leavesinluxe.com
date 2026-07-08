export { generateMetadata } from '@/editable/pages/ImagesPage'
import { ImagesTaskPage } from '@/editable/pages/ImagesPage'

export default function ImagesPage(props: { searchParams?: Promise<{ category?: string; page?: string }> }) {
  return <ImagesTaskPage {...props} basePath="/images" />
}

export const revalidate = 3
