#!/usr/bin/env node
const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const timeoutMs = Number(process.env.ROUTE_CHECK_TIMEOUT_MS || 12000)
const routes = (process.env.ROUTE_CHECK_PATHS || '/,/about,/contact,/api/health,/article,/listing,/classified,/image,/profile,/sbm,/pdf,/articles,/listings,/classifieds,/image-sharing')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean)

async function check(path) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const url = new URL(path, baseUrl).toString()
  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal })
    return { path, url, status: response.status, ok: response.status < 500 }
  } catch (error) {
    return { path, url, status: 'ERR', ok: false, error: error?.message || String(error) }
  } finally {
    clearTimeout(timer)
  }
}

const results = await Promise.all(routes.map(check))
let failed = false
for (const result of results) {
  const marker = result.ok ? 'OK' : 'FAIL'
  console.log(`${marker} ${result.status} ${result.url}${result.error ? ` ${result.error}` : ''}`)
  if (!result.ok) failed = true
}

if (failed) {
  if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
    console.error('\nRoute check needs a running local server. Start one terminal with: pnpm dev')
    console.error('Then run this in another terminal: pnpm check:routes')
    console.error('For deployed sites use: SITE_URL=https://example.com pnpm check:routes\n')
  }
  process.exit(1)
}
