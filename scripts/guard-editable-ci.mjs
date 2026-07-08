#!/usr/bin/env node
import { execSync } from 'node:child_process'

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
const blockedPrefixes = ['src/lib/', 'src/config/', 'src/app/api/', 'src/components/', 'src/design/', '.github/', 'scripts/']
const blockedExact = new Set(['Dockerfile', 'docker-compose.vps.yml', 'package.json', 'pnpm-lock.yaml', 'next.config.mjs'])

function run(command) {
  return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}

function canResolve(ref) {
  try {
    run(`git rev-parse --verify ${ref}`)
    return true
  } catch {
    return false
  }
}

function diffFiles() {
  const candidates = []
  if (process.env.GITHUB_BASE_REF) candidates.push(`origin/${process.env.GITHUB_BASE_REF}...HEAD`)
  candidates.push('origin/dev...HEAD', 'origin/main...HEAD', 'HEAD~1...HEAD')

  for (const range of candidates) {
    const base = range.split('...')[0]
    if (!canResolve(base)) continue
    try {
      const output = run(`git diff --name-only --diff-filter=ACMRTUXB ${range}`)
      return output.split('\n').filter(Boolean)
    } catch {
      // try next candidate
    }
  }

  const working = [
    ...safeRun('git diff --cached --name-only --diff-filter=ACMRTUXB').split('\n'),
    ...safeRun('git diff --name-only --diff-filter=ACMRTUXB').split('\n'),
    ...safeRun('git ls-files --others --exclude-standard').split('\n'),
  ].filter(Boolean)

  if (working.length) return [...new Set(working)]

  console.log('No comparable git base found and no working-tree changes detected. Skipping editable guard.')
  return []
}

function safeRun(command) {
  try {
    return run(command)
  } catch {
    return ''
  }
}

const files = diffFiles()
const blocked = files.filter((file) => {
  const allowed = allowedExact.has(file) || allowedPrefixes.some((prefix) => file.startsWith(prefix))
  const blockedByRule = blockedExact.has(file) || blockedPrefixes.some((prefix) => file.startsWith(prefix))
  return blockedByRule || !allowed
})

if (blocked.length) {
  console.error('Logic lock failed. Non-editable files changed:')
  for (const file of blocked) console.error(`- ${file}`)
  process.exit(1)
}

console.log(`Logic lock passed. Checked ${files.length} changed file(s).`)
