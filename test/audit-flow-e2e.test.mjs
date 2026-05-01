import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { request as httpRequest } from 'node:http'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium } from 'playwright'

const BASE_URL = process.env.HIREPROOF_E2E_URL || 'http://localhost:3002'

function checkServer() {
  return new Promise((resolve) => {
    const req = httpRequest(`${BASE_URL}/audit`, { method: 'GET', timeout: 1500 }, (res) => {
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

test('demo audit path auto-fills URL and location then renders a verdict', { timeout: 90_000 }, async () => {
  const server = await ensureServer()
  const browser = await chromium.launch()

  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    const page = await context.newPage()
    const sample = [
      'Company: Urgent Remote Hiring Team',
      'Role: Frontend Intern',
      'Salary: PHP 80,000 per week',
      'Work setup: hybrid - BGC',
      'Contact: Telegram only',
      'Apply: linkedin.com/jobs/view/full-flow-demo',
    ].join('\n')

    await page.goto(`${BASE_URL}/audit`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Demo fixtures' }).click()
    await page.getByTestId('job-input-text').fill(sample)

    assert.equal(await page.getByTestId('job-input-url').inputValue(), 'https://linkedin.com/jobs/view/full-flow-demo')
    assert.equal(await page.getByTestId('job-input-location').inputValue(), 'Hybrid - BGC')

    await page.getByRole('button', { name: 'Investigate Job Post' }).click()
    await page.getByTestId('audit-result-verdict').waitFor({ timeout: 10_000 })

    const verdictText = await page.getByTestId('audit-result-verdict').innerText()
    assert.match(verdictText, /High-Risk/i)
    assert.match(await page.getByRole('heading', { name: 'Evidence receipts' }).innerText(), /Evidence receipts/)
  } finally {
    await browser.close()
    server?.kill()
  }
})

test('local history card opens the archived browser-stored report', { timeout: 90_000 }, async () => {
  const server = await ensureServer()
  const browser = await chromium.launch()

  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    await context.addInitScript(() => {
      localStorage.setItem('hireproof_audit_history', JSON.stringify([{
        id: 'demo_high-risk_local_history',
        verdict: 'high-risk',
        riskScore: 92,
        confidence: 'Very High',
        summary: 'Local history report.',
        extractedClaims: {
          company: 'Local Archive QA',
          role: 'Remote Fraud Analyst',
          salary: 'PHP 80,000 per week',
          location: 'Hybrid - BGC',
          contactMethod: 'Telegram',
          applicationPath: 'linkedin.com/jobs/view/local-history',
        },
        redFlags: ['Telegram-only contact'],
        greenFlags: [],
        evidence: [{ source: 'Company Verification', snippet: 'No official hiring page found.', type: 'Company Check' }],
        alternatives: [],
        nextSteps: ['Do not send personal documents'],
        timestamp: new Date().toISOString(),
        mode: 'demo',
        credentialMode: 'demo',
        source: 'demo',
      }]))
    })

    const page = await context.newPage()
    await page.goto(`${BASE_URL}/history`, { waitUntil: 'networkidle' })
    await page.getByTestId('history-report-card').click()
    await page.getByTestId('audit-result-verdict').waitFor({ timeout: 10_000 })

    assert.match(page.url(), /\/history\/demo_high-risk_local_history/)
    assert.match(await page.getByTestId('audit-result-verdict').innerText(), /High-Risk/i)
    assert.match(await page.getByText('Local Archive QA').first().innerText(), /Local Archive QA/)
  } finally {
    await browser.close()
    server?.kill()
  }
})
