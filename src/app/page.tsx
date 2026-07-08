import HomePage, { generateMetadata as generateHomeMetadata } from '@/editable/pages/HomePage'

export const revalidate = 300
export const generateMetadata = generateHomeMetadata
export default HomePage
