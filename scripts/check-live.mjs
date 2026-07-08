#!/usr/bin/env node
const baseUrl = (process.env.SITE_URL || process.argv[2] || '').replace(/\/$/, '')
const timeoutMs = Number(process.env.LIVE_CHECK_TIMEOUT_MS || 10000)

if (!baseUrl || !/^https?:\/\//.test(baseUrl)) {
  console.error('Live check failed: provide SITE_URL=https://site.com pnpm check:live')
  process.exit(1)
}

const controller = () => (typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(timeoutMs) : undefined)
const checks = [
  { label: 'home', path: '/', expect: [200] },
  { label: 'contact page', path: '/contact', expect: [200] },
  { label: 'articles archive', path: '/articles', expect: [200, 404] },
  { label: 'listings archive', path: '/listings', expect: [200, 404] },
  { label: 'image archive', path: '/image-sharing', expect: [200, 404] },
]

const failures = []
for (const check of checks) {
  const url = `${baseUrl}${check.path}`
  try {
    const response = await fetch(url, { signal: controller(), redirect: 'manual' })
    if (!check.expect.includes(response.status)) {
      failures.push(`${check.label}: expected ${check.expect.join('/')} got ${response.status} (${url})`)
    } else {
      console.log(`OK ${check.label}: ${response.status}`)
    }
  } catch (error) {
    failures.push(`${check.label}: ${error.message} (${url})`)
  }
}

try {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company: 'health-check-bot', name: 'Health Check', email: 'health@example.com', message: 'Honeypot smoke test' }),
    signal: controller(),
  })
  if (response.status !== 200) {
    failures.push(`contact api honeypot: expected 200 got ${response.status}`)
  } else {
    console.log('OK contact api honeypot: 200')
  }
} catch (error) {
  failures.push(`contact api honeypot: ${error.message}`)
}

if (failures.length) {
  console.error('\nLive connector health failed:\n')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Live connector health passed for ${baseUrl}.`)
