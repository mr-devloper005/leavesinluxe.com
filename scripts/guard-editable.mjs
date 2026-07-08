#!/usr/bin/env node
import { execSync } from 'node:child_process'

if (process.env.ALLOW_INFRASTRUCTURE_CHANGES === '1') {
  console.log('Editable guard bypassed because ALLOW_INFRASTRUCTURE_CHANGES=1 is set. Use this only for base-template infrastructure commits.')
  process.exit(0)
}

const allowedPrefixes = ['src/editable/', 'public/']
const allowedExact = new Set([
  'next-env.d.ts',
  'pnpm-workspace.yaml',
  'src/app/page.tsx',
  'src/app/about/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/login/page.tsx',
  'src/app/signup/page.tsx',
  'src/app/search/page.tsx',
  'src/app/create/page.tsx',
  'src/app/article/page.tsx',
  'src/app/article/[slug]/page.tsx',
  'src/app/listing/page.tsx',
  'src/app/listing/[slug]/page.tsx',
  'src/app/classified/page.tsx',
  'src/app/classified/[slug]/page.tsx',
  'src/app/image/page.tsx',
  'src/app/image/[slug]/page.tsx',
  'src/app/pdf/page.tsx',
  'src/app/pdf/[slug]/page.tsx',
  'src/app/sbm/page.tsx',
  'src/app/sbm/[slug]/page.tsx',
  'src/app/business-listing/page.tsx',
  'src/app/business-listings/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/profiles/page.tsx',
  'src/app/articles/[slug]/page.tsx',
  'src/app/listings/[slug]/page.tsx',
  'src/app/image-sharing/[slug]/page.tsx',
  'src/app/profile/[username]/page.tsx',
])

const alwaysBlockedPrefixes = ['src/lib/', 'src/config/', 'src/app/api/', 'src/components/', 'src/design/', '.github/', 'scripts/']
const alwaysBlockedExact = new Set(['Dockerfile', 'docker-compose.yml', 'docker-compose.vps.yml', 'package.json', 'pnpm-lock.yaml', 'next.config.mjs', 'tsconfig.json'])

function run(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  } catch {
    return ''
  }
}

const files = [
  ...run('git diff --cached --name-only --diff-filter=ACMRTUXB').split('\n'),
  ...run('git diff --name-only --diff-filter=ACMRTUXB').split('\n'),
  ...run('git ls-files --others --exclude-standard').split('\n'),
].filter(Boolean)

const uniqueFiles = [...new Set(files)]
const blocked = uniqueFiles.filter((file) => {
  const allowed = allowedExact.has(file) || allowedPrefixes.some((prefix) => file.startsWith(prefix))
  const blockedByRule = alwaysBlockedExact.has(file) || alwaysBlockedPrefixes.some((prefix) => file.startsWith(prefix))
  return blockedByRule || !allowed
})

if (blocked.length) {
  console.error('\nEditable guard failed. These files are outside the safe UI surface:\n')
  for (const file of blocked) console.error(`- ${file}`)
  console.error('\nThis is expected while setting up the base template infrastructure.')
  console.error('For a one-time base setup commit, run: ALLOW_INFRASTRUCTURE_CHANGES=1 pnpm guard:editable')
  console.error('For normal UI PRs, only change src/editable/**.\n')
  process.exit(1)
}

console.log(`Editable guard passed. Checked ${uniqueFiles.length} changed file(s).`)
