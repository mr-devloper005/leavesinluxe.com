export { generateMetadata } from '@/editable/pages/ImagesPage'
import { ImagesTaskPage } from '@/editable/pages/ImagesPage'

export default function ImageSharingPage(props: { searchParams?: Promise<{ category?: string; page?: string }> }) {
  return <ImagesTaskPage {...props} basePath="/image-sharing" />
}

export const revalidate = 3
