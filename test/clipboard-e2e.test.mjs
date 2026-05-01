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

test('audit form paste button reads clipboard text into the job post field', { timeout: 90_000 }, async () => {
  const server = await ensureServer()
  const browser = await chromium.launch()

  try {
    const context = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
      viewport: { width: 390, height: 844 },
    })
    const page = await context.newPage()
    const clipboardText = 'Company: Clipboard QA Labs\nRole: Remote Support Analyst\nWork setup: hybrid - BGC\nContact: email only'

    await page.goto(`${BASE_URL}/audit`, { waitUntil: 'networkidle' })
    await page.evaluate((value) => navigator.clipboard.writeText(value), clipboardText)
    await page.getByRole('button', { name: 'Paste text or screenshot from clipboard' }).click()
    await page.waitForFunction(
      () => document.querySelector('[data-testid="job-input-text"]')?.value.includes('Clipboard QA Labs'),
      null,
      { timeout: 10_000 },
    )

    const value = await page.getByTestId('job-input-text').inputValue()
    assert.match(value, /Clipboard QA Labs/)
    assert.match(value, /Remote Support Analyst/)
    assert.match(await page.getByTestId('job-input-location').inputValue(), /Hybrid - BGC/)

    await page.evaluate(() => navigator.clipboard.writeText('Apply through linkedin.com/jobs/view/clipboard-role before Friday.'))
    await page.getByRole('button', { name: 'Paste job URL from clipboard' }).click()
    await page.waitForFunction(
      () => document.querySelector('[data-testid="job-input-url"]')?.value === 'https://linkedin.com/jobs/view/clipboard-role',
    )
    assert.equal(await page.getByTestId('job-input-url').inputValue(), 'https://linkedin.com/jobs/view/clipboard-role')
  } finally {
    await browser.close()
    server?.kill()
  }
})

test('audit form paste button reads clipboard images into the screenshot preview', { timeout: 90_000 }, async () => {
  const server = await ensureServer()
  const browser = await chromium.launch()

  try {
    const context = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'],
      viewport: { width: 390, height: 844 },
    })
    const page = await context.newPage()

    await page.goto(`${BASE_URL}/audit`, { waitUntil: 'networkidle' })
    await page.evaluate(async () => {
      if (!('ClipboardItem' in window)) throw new Error('ClipboardItem is unavailable')
      const canvas = document.createElement('canvas')
      canvas.width = 2
      canvas.height = 2
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas context is unavailable')
      context.fillStyle = '#10b981'
      context.fillRect(0, 0, 2, 2)
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result)
          else reject(new Error('Canvas PNG export failed'))
        }, 'image/png')
      })
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
    })

    await page.getByRole('button', { name: 'Paste text or screenshot from clipboard' }).click()
    await page.getByAltText('Uploaded screenshot').waitFor({ timeout: 10_000 })
    assert.equal(await page.getByAltText('Uploaded screenshot').isVisible(), true)
  } finally {
    await browser.close()
    server?.kill()
  }
})

test('audit page accepts screenshot files dropped anywhere on the page', { timeout: 90_000 }, async () => {
  const server = await ensureServer()
  const browser = await chromium.launch()

  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    const page = await context.newPage()

    await page.goto(`${BASE_URL}/audit`, { waitUntil: 'networkidle' })
    await page.evaluate(async () => {
      const canvas = document.createElement('canvas')
      canvas.width = 2
      canvas.height = 2
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas context is unavailable')
      context.fillStyle = '#10b981'
      context.fillRect(0, 0, 2, 2)
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result)
          else reject(new Error('Canvas PNG export failed'))
        }, 'image/png')
      })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(new File([blob], 'job-screenshot.png', { type: 'image/png' }))
      document.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer }))
    })

    await page.getByTestId('audit-drop-overlay').waitFor({ timeout: 10_000 })
    await page.evaluate(async () => {
      const canvas = document.createElement('canvas')
      canvas.width = 2
      canvas.height = 2
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas context is unavailable')
      context.fillStyle = '#10b981'
      context.fillRect(0, 0, 2, 2)
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result)
          else reject(new Error('Canvas PNG export failed'))
        }, 'image/png')
      })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(new File([blob], 'job-screenshot.png', { type: 'image/png' }))
      document.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }))
    })
    await page.getByAltText('Uploaded screenshot').waitFor({ timeout: 10_000 })
    assert.equal(await page.getByAltText('Uploaded screenshot').isVisible(), true)
  } finally {
    await browser.close()
    server?.kill()
  }
})
