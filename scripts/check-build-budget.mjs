#!/usr/bin/env node
import fs from 'node:fs'
import { execSync } from 'node:child_process'

const maxMb = Number(process.env.MAX_STANDALONE_BUILD_MB || 120)
const requiredPaths = ['.next/standalone', '.next/static', 'public']

function sizeMb(target) {
  if (!fs.existsSync(target)) return 0
  // du handles hardlinks the same way Docker copy does more closely than naive stat recursion.
  const kb = Number(execSync(`du -sk ${JSON.stringify(target)}`, { encoding: 'utf8' }).trim().split(/\s+/)[0])
  return kb / 1024
}

const missing = requiredPaths.filter((target) => !fs.existsSync(target))
if (missing.length) {
  console.error('Build budget failed. Missing required standalone runtime output:')
  for (const item of missing) console.error(`- ${item}`)
  console.error('Run pnpm build and ensure next.config.mjs has output: "standalone".')
  process.exit(1)
}

const sizes = requiredPaths.map((target) => ({ target, mb: sizeMb(target) }))
const totalMb = sizes.reduce((sum, item) => sum + item.mb, 0)
for (const item of sizes) console.log(`${item.target}: ${item.mb.toFixed(1)}MB`)
console.log(`Standalone runtime payload: ${totalMb.toFixed(1)}MB / budget ${maxMb}MB`)

if (totalMb > maxMb) {
  console.error(`Build runtime payload too large: ${totalMb.toFixed(1)}MB expected <= ${maxMb}MB`)
  process.exit(1)
}
