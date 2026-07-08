#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const baseUrl = (process.env.SITE_URL || process.argv[2] || 'http://localhost:3000').replace(/\/$/, '')
const outDir = process.env.VISUAL_OUT_DIR || 'visual-smoke-output'
const routes = (process.env.VISUAL_ROUTES || '/,/contact,/articles,/listings,/image-sharing').split(',').map((item) => item.trim()).filter(Boolean)

let chromium
try {
  ;({ chromium } = await import('@playwright/test'))
} catch {
  console.error('Visual smoke requires @playwright/test. Run: pnpm add -D @playwright/test && pnpm exec playwright install chromium')
  process.exit(1)
}

await fs.mkdir(outDir, { recursive: true })
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
const failures = []

for (const route of routes) {
  const url = `${baseUrl}${route}`
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    const status = response?.status() || 0
    const text = (await page.locator('body').innerText({ timeout: 5000 })).trim()
    const filename = route === '/' ? 'home.png' : `${route.replace(/^\//, '').replace(/\//g, '-')}.png`
    await page.screenshot({ path: path.join(outDir, filename), fullPage: true })
    if (status >= 400 || text.length < 20) failures.push(`${route}: status ${status}, body length ${text.length}`)
    else console.log(`OK ${route}: ${status} -> ${path.join(outDir, filename)}`)
  } catch (error) {
    failures.push(`${route}: ${error.message}`)
  }
}

await browser.close()

if (failures.length) {
  console.error('\nVisual smoke failed:\n')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Visual smoke screenshots saved in ${outDir}.`)
