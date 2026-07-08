#!/usr/bin/env node
import { execSync } from 'node:child_process'

function run(command) {
  try { return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim() } catch { return '' }
}

const base = process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}...HEAD` : 'origin/dev...HEAD'
const files = run(`git diff --name-only --diff-filter=ACMRTUXB ${base}`).split('\n').filter(Boolean)
const editable = files.filter((file) => file.startsWith('src/editable/'))
const logic = files.filter((file) => !file.startsWith('src/editable/') && !file.startsWith('public/'))

const lines = [
  '## Slot 4 AI Edit Report',
  '',
  `Changed files: **${files.length}**`,
  `Editable files: **${editable.length}**`,
  `Non-editable/logic files: **${logic.length}**`,
  '',
  '### Editable Changes',
  editable.length ? editable.map((file) => `- \`${file}\``).join('\n') : '- None',
  '',
  '### Logic / Infrastructure Changes',
  logic.length ? logic.map((file) => `- \`${file}\``).join('\n') : '- None',
  '',
  logic.length ? '> Logic files changed. Guard should block this unless it is an approved base-template infrastructure PR.' : '> Safe UI-only change surface detected.',
]

console.log(lines.join('\n'))
