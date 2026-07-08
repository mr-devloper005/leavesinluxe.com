#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const getArg = (flag, fallback = '') => {
  const index = args.indexOf(flag)
  return index >= 0 ? args[index + 1] || fallback : fallback
}
const hasFlag = (flag) => args.includes(flag)

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/https?:\/\//g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const domainFromUrl = (value) => String(value).replace(/^https?:\/\//, '').replace(/\/$/, '')
const titleFromDomain = (domain) =>
  domain
    .replace(/^www\./, '')
    .split('.')[0]
    .split(/[-_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const siteUrl = getArg('--url', 'https://example.com')
const siteDomain = getArg('--domain', domainFromUrl(siteUrl))
const siteName = getArg('--name', titleFromDomain(siteDomain))
const repoName = getArg('--repo', siteDomain)
const siteCode = getArg('--code', slugify(siteDomain.replace(/\.[a-z]+$/i, '')))
const appPort = getArg('--port', '3020')
const masterApi = getArg('--master-api', 'https://master-site-panel.onrender.com')
const siteTagline = getArg('--tagline', 'All-in-One Publishing Hub')
const siteDescription = getArg(
  '--description',
  `${siteName} is a production-ready public backlink site powered by the Slot 4 template and Master Site Panel.`
)
const shouldApply = hasFlag('--apply')

if (!/^https?:\/\//.test(siteUrl)) {
  console.error('Invalid --url. Example: --url https://collectivebyte.com')
  process.exit(1)
}
if (!Number.isInteger(Number(appPort)) || Number(appPort) < 1024 || Number(appPort) > 65535) {
  console.error('Invalid --port. Use a unique port between 1024 and 65535.')
  process.exit(1)
}

const root = process.cwd()
const outputDir = path.join(root, '.codex-output')
fs.mkdirSync(outputDir, { recursive: true })

const envTemplate = `NEXT_PUBLIC_MASTER_PANEL_URL=${masterApi}
NEXT_PUBLIC_MASTER_API_URL=${masterApi}
NEXT_PUBLIC_SITE_CODE=${siteCode}
NEXT_PUBLIC_FEED_REVALIDATE_SECONDS=300

NEXT_PUBLIC_SITE_NAME=${siteName}
NEXT_PUBLIC_SITE_TAGLINE=${siteTagline}
NEXT_PUBLIC_SITE_DESCRIPTION=${siteDescription}
NEXT_PUBLIC_SITE_DOMAIN=${siteDomain}
NEXT_PUBLIC_SITE_URL=${siteUrl}
NEXT_PUBLIC_SITE_OG_IMAGE=/og-default.png
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY=

APP_PORT=${appPort}
`

const githubSecrets = `# GitHub Secrets for ${repoName}

APP_ENV_PRODUCTION:
\`\`\`env
${envTemplate}\`\`\`

Required deploy secrets:
- VPS_HOST
- VPS_USER
- VPS_PORT
- VPS_SSH_KEY
- GHCR_USERNAME
- GHCR_TOKEN
`

const summary = `# New Site Bootstrap Summary

## Identity
- Site name: ${siteName}
- Site code: ${siteCode}
- Site URL: ${siteUrl}
- Site domain: ${siteDomain}
- Repo name: ${repoName}
- App port: ${appPort}

## Files handled
- .env.example ${shouldApply ? 'updated' : 'preview generated'}
- package.json name ${shouldApply ? 'updated' : 'preview only'}
- docker-compose.vps.yml already reads APP_PORT and NEXT_PUBLIC_SITE_CODE dynamically
- .github/workflows/deploy.yml already uses the GitHub repo name dynamically

## Next steps
1. Create/push repo: ${repoName}
2. Add APP_ENV_PRODUCTION from ${path.join('.codex-output', `${siteCode}.github-secrets.md`)}
3. Add VPS + GHCR secrets
4. Register ${siteCode} in Master Site Panel
5. Push main and verify /api/health, /article, /listing, /contact
`

fs.writeFileSync(path.join(outputDir, `${siteCode}.env.preview`), envTemplate)
fs.writeFileSync(path.join(outputDir, `${siteCode}.github-secrets.md`), githubSecrets)
fs.writeFileSync(path.join(outputDir, `${siteCode}.summary.md`), summary)

if (shouldApply) {
  fs.writeFileSync(path.join(root, '.env.example'), envTemplate)

  const packagePath = path.join(root, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  packageJson.name = slugify(repoName)
  fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
}

console.log(`Generated:
- ${path.join('.codex-output', `${siteCode}.env.preview`)}
- ${path.join('.codex-output', `${siteCode}.github-secrets.md`)}
- ${path.join('.codex-output', `${siteCode}.summary.md`)}`)
if (shouldApply) console.log('\nApplied .env.example and package.json updates.')
else console.log('\nPreview only. Add --apply to update .env.example and package.json.')
