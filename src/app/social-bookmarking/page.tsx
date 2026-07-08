export { generateMetadata } from '@/editable/pages/SocialBookmarkingPage'
import { SocialBookmarkingTaskPage } from '@/editable/pages/SocialBookmarkingPage'

export default function SocialBookmarkingPage(props: { searchParams?: Promise<{ category?: string; page?: string }> }) {
  return <SocialBookmarkingTaskPage {...props} basePath="/social-bookmarking" />
}

export const revalidate = 3
