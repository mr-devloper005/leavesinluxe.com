import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const getSecret = () => process.env.REVALIDATE_SECRET || process.env.NEXT_REVALIDATE_SECRET || ''
const cleanPath = (value: unknown) => {
  if (typeof value !== 'string') return null
  const path = value.trim()
  if (!path || !path.startsWith('/')) return null
  if (path.includes('://')) return null
  return path
}

export async function POST(request: Request) {
  const secret = getSecret()
  if (secret) {
    const provided = request.headers.get('x-revalidate-secret') || ''
    if (provided !== secret) {
      return NextResponse.json({ ok: false, message: 'Invalid revalidate secret.' }, { status: 401 })
    }
  }

  let payload: { paths?: unknown; slug?: unknown } = {}
  try {
    payload = await request.json()
  } catch {
    payload = {}
  }

  const paths = Array.isArray(payload.paths)
    ? payload.paths.map(cleanPath).filter((item): item is string => Boolean(item))
    : []

  if (typeof payload.slug === 'string' && payload.slug.trim()) {
    const slug = payload.slug.trim()
    for (const base of ['/article', '/listing', '/classified', '/image', '/profile', '/sbm', '/pdf']) {
      paths.push(`${base}/${slug}`)
    }
  }

  const uniquePaths = Array.from(new Set([...paths, '/', '/search', '/sitemap.xml']))
  for (const path of uniquePaths) {
    revalidatePath(path)
  }

  return NextResponse.json({ ok: true, revalidated: uniquePaths })
}
