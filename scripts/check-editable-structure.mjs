#!/usr/bin/env node
import { execSync } from 'node:child_process'

function run(command) {
  try { return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim() } catch { return '' }
}

const files = [
  ...run('git diff --cached --name-only --diff-filter=ACMRTUXB').split('\n'),
  ...run('git diff --name-only --diff-filter=ACMRTUXB').split('\n'),
  ...run('git ls-files --others --exclude-standard').split('\n'),
].filter(Boolean)
const unique = [...new Set(files)]

if (process.env.ALLOW_INFRASTRUCTURE_CHANGES === '1') {
  console.log('Editable structure check bypassed because ALLOW_INFRASTRUCTURE_CHANGES=1 is set. Use this only for base-template infrastructure commits.')
  process.exit(0)
}

const violations = unique.filter((file) => {
  if (file === 'src/editable/theme/brand.config.ts' || file === 'src/editable/theme/visual-system.ts') return false
  if (/brand\.config\.ts$|visual-system\.ts$/.test(file)) return true
  if (file.startsWith('src/components/') && /theme|visual|brand|home|page|card|hero/i.test(file)) return true
  if (file.startsWith('src/design/') && /theme|visual|brand|home|page|card|hero/i.test(file)) return true
  return false
})

if (violations.length) {
  console.error('\nEditable structure check failed. Do not create duplicate theme/UI systems outside src/editable/**:\n')
  for (const file of violations) console.error(`- ${file}`)
  console.error('\nPut UI-only changes in src/editable/pages, src/editable/content, src/editable/theme, or src/editable/components.\n')
  process.exit(1)
}

console.log(`Editable structure check passed. Checked ${unique.length} changed file(s).`)
