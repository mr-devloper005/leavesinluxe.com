import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({
    ok: true,
    siteCode: process.env.NEXT_PUBLIC_SITE_CODE || null,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
    gitSha: process.env.APP_GIT_SHA || process.env.NEXT_PUBLIC_GIT_SHA || null,
    builtAt: process.env.APP_BUILT_AT || null,
    nodeEnv: process.env.NODE_ENV || null,
  })
}
