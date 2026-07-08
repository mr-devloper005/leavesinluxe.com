#!/usr/bin/env node
import fs from 'node:fs/promises'
import tls from 'node:tls'
import { URL } from 'node:url'

const inventoryPath = process.env.SITE_INVENTORY || 'ops/sites.inventory.json'
const timeoutMs = Number(process.env.HEALTH_TIMEOUT_MS || 8000)
const checkContact = process.env.CHECK_CONTACT === '1' || process.env.CHECK_CONTACT === 'true'

function withTimeout(promise, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)),
  ])
}

async function readInventory() {
  const raw = await fs.readFile(inventoryPath, 'utf8')
  const json = JSON.parse(raw)
  if (!Array.isArray(json.sites)) throw new Error('Inventory must contain a sites array.')
  return json.sites
}

async function checkHttp(site) {
  const response = await withTimeout(fetch(site.url, { redirect: 'manual' }), `GET ${site.url}`)
  return { status: response.status, ok: response.status >= 200 && response.status < 400 }
}

async function checkAppHealth(site) {
  const url = new URL('/api/health', site.url).toString()
  const response = await withTimeout(fetch(url), `GET ${url}`)
  if (!response.ok) return { status: response.status, ok: false, gitSha: null }
  const json = await response.json().catch(() => ({}))
  const expected = site.expectedSha || site.gitSha || null
  const gitSha = json.gitSha || null
  return {
    status: response.status,
    ok: !expected || gitSha === expected || (gitSha && String(expected).startsWith(String(gitSha).slice(0, 7))),
    gitSha,
    expected,
  }
}

async function checkContactApi(site) {
  const url = new URL('/api/contact', site.url).toString()
  const response = await withTimeout(fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ website: 'bot-field', name: 'Health Check', email: 'health@example.com', message: 'honeypot' }),
  }), `POST ${url}`)
  return { status: response.status, ok: response.status >= 200 && response.status < 500 }
}

async function checkSsl(site) {
  const parsed = new URL(site.url)
  if (parsed.protocol !== 'https:') return { ok: false, daysLeft: 0, message: 'not https' }
  return withTimeout(new Promise((resolve) => {
    const socket = tls.connect({ host: parsed.hostname, port: 443, servername: parsed.hostname, rejectUnauthorized: false }, () => {
      const cert = socket.getPeerCertificate()
      socket.end()
      if (!cert?.valid_to) return resolve({ ok: false, daysLeft: 0, message: 'missing cert' })
      const daysLeft = Math.floor((new Date(cert.valid_to).getTime() - Date.now()) / 86400000)
      resolve({ ok: daysLeft > 14, daysLeft, message: `expires in ${daysLeft}d` })
    })
    socket.on('error', (error) => resolve({ ok: false, daysLeft: 0, message: error.message }))
  }), `SSL ${site.url}`)
}

const sites = await readInventory()
const rows = []
for (const site of sites) {
  const row = { domain: site.domain || site.url, ok: true, notes: [] }
  try {
    const http = await checkHttp(site)
    row.http = http.status
    if (!http.ok) row.ok = false
  } catch (error) {
    row.ok = false
    row.http = 'ERR'
    row.notes.push(error.message)
  }

  try {
    const ssl = await checkSsl(site)
    row.ssl = ssl.message
    if (!ssl.ok) row.ok = false
  } catch (error) {
    row.ok = false
    row.ssl = 'ERR'
    row.notes.push(error.message)
  }

  try {
    const app = await checkAppHealth(site)
    row.app = app.gitSha ? `${app.status} ${String(app.gitSha).slice(0, 7)}` : app.status
    if (!app.ok) {
      row.ok = false
      row.notes.push(`expected sha ${app.expected || '(none)'} but live is ${app.gitSha || '(missing)'}`)
    }
  } catch (error) {
    row.ok = false
    row.app = 'ERR'
    row.notes.push(error.message)
  }

  if (checkContact) {
    try {
      const contact = await checkContactApi(site)
      row.contact = contact.status
      if (!contact.ok) row.ok = false
    } catch (error) {
      row.ok = false
      row.contact = 'ERR'
      row.notes.push(error.message)
    }
  }

  rows.push(row)
}

console.table(rows)
const failed = rows.filter((row) => !row.ok)
if (failed.length) {
  console.error(`Health failed for ${failed.length}/${rows.length} sites.`)
  process.exit(1)
}
console.log(`Health passed for ${rows.length}/${rows.length} sites.`)
