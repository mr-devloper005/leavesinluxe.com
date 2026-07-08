export { generateMetadata } from '@/editable/pages/ProfilePage'
import { ProfileTaskPage } from '@/editable/pages/ProfilePage'

export default function ProfilesPage(props: { searchParams?: Promise<{ category?: string; page?: string }> }) {
  return <ProfileTaskPage {...props} basePath="/profiles" />
}

export const revalidate = 3
