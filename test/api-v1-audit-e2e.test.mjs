import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { request as httpRequest } from 'node:http'
import { setTimeout as delay } from 'node:timers/promises'

const BASE_URL = process.env.HIREPROOF_E2E_URL || 'http://localhost:3002'

async function readAgentApiKey() {
  try {
    const env = await fs.readFile(new URL('../.env.local', import.meta.url), 'utf8')
    const line = env.split(/\r?\n/).find((item) => item.startsWith('AGENT_API_KEY='))
    return line ? line.replace(/^AGENT_API_KEY=/, '').trim() : 'hireproof_agent_demo_key'
  } catch {
    return 'hireproof_agent_demo_key'
  }
}

function checkServer() {
  return new Promise((resolve) => {
    const req = httpRequest(`${BASE_URL}/api/health`, { method: 'GET', timeout: 1500 }, (res) => {
      res.resume()
      resolve(Boolean(res.statusCode && res.statusCode < 500))
    })
    req.on('error', () => resolve(false))
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
    req.end()
  })
}

async function ensureServer() {
  if (await checkServer()) return null

  const child = spawn('npm', ['run', 'dev'], {
    cwd: new URL('..', import.meta.url),
    shell: true,
    stdio: 'ignore',
  })

  for (let attempt = 0; attempt < 60; attempt += 1) {
    await delay(1000)
    if (await checkServer()) return child
  }

  child.kill()
  throw new Error(`Timed out waiting for ${BASE_URL}`)
}

async function postAudit(body) {
  const apiKey = await readAgentApiKey()
  const response = await fetch(`${BASE_URL}/api/v1/audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(body),
  })
  const payload = await response.json()
  return { response, payload }
}

test('/api/v1/audit returns an explicit demo report for mode=demo', { timeout: 90_000 }, async () => {
  const server = await ensureServer()

  try {
    const { response, payload } = await postAudit({
      text: 'Remote frontend intern. PHP 80,000/week. No interview. Message us on Telegram.',
      mode: 'demo',
    })

    assert.equal(response.status, 200)
    assert.equal(payload.mode, 'demo')
    assert.equal(payload.credentialMode, 'demo')
    assert.equal(payload.verdict, 'high-risk')
    assert.ok(Number(payload.riskScore) >= 80)
  } finally {
    server?.kill()
  }
})

test('/api/v1/audit keeps live mode credential-backed with clear missing-key errors', { timeout: 120_000 }, async () => {
  const server = await ensureServer()

  try {
    const { response, payload } = await postAudit({
      text: 'Remote frontend intern at Apex Hiring. PHP 80,000/week. No interview required. Apply by Telegram only.',
      location: 'Philippines',
      mode: 'live',
    })

    if (response.status === 503) {
      assert.match(payload.error, /Live audit credentials not configured/)
      assert.ok(Array.isArray(payload.missing))
      assert.match(payload.recovery, /mode=demo/)
      return
    }

    assert.equal(response.status, 200)
    assert.equal(payload.mode, 'live')
    assert.notEqual(payload.credentialMode, 'demo')
    assert.equal(payload.verdict, 'high-risk')
    assert.ok(Number(payload.riskScore) >= 80)
  } finally {
    server?.kill()
  }
})
