#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const envPath = process.argv[2] || '.env'

function parseEnv(text) {
  const env = {}
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const index = line.indexOf('=')
    if (index === -1) continue
    const key = line.slice(0, index).trim()
    let value = line.slice(index + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

if (!fs.existsSync(envPath)) {
  console.error(`Env contract failed: ${envPath} not found.`)
  console.error('For local testing, create a local .env file. It is gitignored and should not be committed.')
  process.exit(1)
}

const env = parseEnv(fs.readFileSync(envPath, 'utf8'))
const failures = []

function requireKey(key, hint) {
  if (!env[key] || env[key] === 'your_site_code') {
    failures.push({ key, hint, actual: env[key] || '(missing)' })
  }
}

function requireUrl(key, hint) {
  const value = env[key]
  if (!value || !/^https?:\/\//.test(value)) {
    failures.push({ key, hint, actual: value || '(missing)' })
  }
}

requireKey('NEXT_PUBLIC_SITE_CODE', 'Unique site code used by master panel public connector.')
requireUrl('NEXT_PUBLIC_SITE_URL', 'Public site URL, example: https://example.com')
requireKey('APP_PORT', 'Unique VPS localhost port, example: APP_PORT=3020')

const masterUrl = env.NEXT_PUBLIC_MASTER_API_URL || env.NEXT_PUBLIC_MASTER_PANEL_URL
if (!masterUrl || !/^https?:\/\//.test(masterUrl)) {
  failures.push({
    key: 'NEXT_PUBLIC_MASTER_API_URL or NEXT_PUBLIC_MASTER_PANEL_URL',
    actual: masterUrl || '(missing)',
    hint: 'Master panel base URL, example: https://masterpanel.seoparadox.com',
  })
}

const port = Number(env.APP_PORT)
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  failures.push({ key: 'APP_PORT', actual: env.APP_PORT, hint: 'APP_PORT must be an integer between 1024 and 65535.' })
}

if (failures.length) {
  console.error('\nEnv contract failed. Fix these values before deploy/build:\n')
  for (const item of failures) {
    console.error(`- ${item.key}`)
    console.error(`  Actual: ${item.actual}`)
    console.error(`  Hint: ${item.hint}`)
  }
  console.error('\nLocal .env files are allowed, but they are gitignored and must not be committed.\n')
  process.exit(1)
}

console.log(`Env contract passed for ${path.basename(envPath)}.`)
