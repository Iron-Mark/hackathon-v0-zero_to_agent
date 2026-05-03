import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const cliPath = fileURLToPath(new URL('../packages/hireproof-cli/bin/hireproof.mjs', import.meta.url))
const ansiPattern = /\u001b\[[0-9;]*m/

function sampleReport(overrides = {}) {
  return {
    id: 'report_test',
    mode: 'demo',
    verdict: 'high-risk',
    riskScore: 92,
    confidence: 'high',
    summary: 'High-risk offer.',
    extractedClaims: {
      company: 'Unknown',
      role: 'Remote job',
      salary: 'Huge pay',
      location: 'Remote',
      contactMethod: 'Telegram',
      applicationPath: 'Direct message',
    },
    redFlags: ['Telegram-only contact'],
    greenFlags: ['Official-looking company name'],
    evidence: [
      { source: 'Demo', snippet: 'No interview.', type: 'Pattern', url: 'https://example.test/one' },
      { source: 'Search', snippet: 'Telegram scam pattern.', type: 'Reputation', url: 'https://example.test/two' },
      { source: 'Jobs', snippet: 'Comparable internship pays far less.', type: 'Comparable Jobs', url: 'https://example.test/three' },
      { source: 'Local', snippet: 'No local footprint found.', type: 'Local Presence', url: 'https://example.test/four' },
    ],
    alternatives: [],
    nextSteps: ['Do not send money.'],
    ...overrides,
  }
}

function runCli(args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      cwd: repoRoot,
      env: {
        ...process.env,
        HIREPROOF_CONFIG_HOME: options.configHome || '',
        ...options.env,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => { stdout += chunk })
    child.stderr.on('data', chunk => { stderr += chunk })
    child.on('close', code => resolve({ code, stdout, stderr }))
  })
}

async function withMockHireProofApi(handler, fn) {
  const server = createServer(async (request, response) => {
    const chunks = []
    for await (const chunk of request) chunks.push(chunk)
    const body = Buffer.concat(chunks).toString('utf8')
    await handler(request, response, body)
  })

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  try {
    await fn(`http://127.0.0.1:${port}`)
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
}

test('HireProof CLI prints command help', async () => {
  const result = await runCli(['--help'])

  assert.equal(result.code, 0)
  assert.match(result.stdout, /hireproof audit/)
  assert.match(result.stdout, /hireproof health/)
  assert.match(result.stdout, /hireproof config/)
})

test('HireProof CLI checks API health', async () => {
  await withMockHireProofApi((request, response) => {
    assert.equal(request.method, 'GET')
    assert.equal(request.url, '/api/health')
    response.setHeader('content-type', 'application/json')
    response.end(JSON.stringify({ status: 'ok', liveSearch: true, model: true }))
  }, async (baseUrl) => {
    const result = await runCli(['health', '--base-url', baseUrl])

    assert.equal(result.code, 0)
    assert.match(result.stdout, /HireProof API: ok/)
    assert.match(result.stdout, /Live search\s+ready/)
    assert.match(result.stdout, /Model\s+ready/)
  })
})

test('HireProof CLI audits inline text and can print JSON', async () => {
  await withMockHireProofApi((request, response, body) => {
    assert.equal(request.method, 'POST')
    assert.equal(request.url, '/api/v1/audit')
    assert.equal(request.headers['x-api-key'], 'test_key')
    const payload = JSON.parse(body)
    assert.equal(payload.text, 'Remote job. Huge pay. Telegram only.')
    assert.equal(payload.mode, 'demo')

    response.setHeader('content-type', 'application/json')
    response.end(JSON.stringify(sampleReport()))
  }, async (baseUrl) => {
    const result = await runCli([
      'audit',
      '--text',
      'Remote job. Huge pay. Telegram only.',
      '--mode',
      'demo',
      '--api-key',
      'test_key',
      '--base-url',
      baseUrl,
      '--json',
    ])

    assert.equal(result.code, 0)
    const report = JSON.parse(result.stdout)
    assert.equal(report.verdict, 'high-risk')
    assert.equal(report.riskScore, 92)
    assert.doesNotMatch(result.stdout, ansiPattern)
    assert.doesNotMatch(result.stdout, /HIREPROOF TERMINAL REPORT/)
  })
})

test('HireProof CLI audits a text file with rich branded output', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'hireproof-cli-'))
  const inputPath = path.join(tempDir, 'job.txt')
  await writeFile(inputPath, 'Company: Example. Role: Assistant.')

  try {
    await withMockHireProofApi((request, response, body) => {
      const payload = JSON.parse(body)
      assert.equal(payload.text, 'Company: Example. Role: Assistant.')
      assert.equal(payload.location, 'Philippines')

      response.setHeader('content-type', 'application/json')
      response.end(JSON.stringify(sampleReport({
        verdict: 'caution',
        riskScore: 47,
        confidence: 'medium',
        summary: 'Some details need checking.',
        extractedClaims: { company: 'Example', role: 'Assistant', salary: 'Not specified', location: 'Philippines', contactMethod: 'Not specified', applicationPath: 'Not specified' },
        redFlags: ['Missing salary'],
        greenFlags: ['Company named'],
        nextSteps: ['Ask for official posting.'],
      })))
    }, async (baseUrl) => {
      const result = await runCli(['audit', '--file', inputPath, '--location', 'Philippines', '--base-url', baseUrl, '--api-key', 'test_key'])

      assert.equal(result.code, 0)
      assert.match(result.stdout, /HIREPROOF TERMINAL REPORT/)
      assert.match(result.stdout, /\+[-]+\+/)
      assert.match(result.stdout, /Verdict\s+Caution/)
      assert.match(result.stdout, /Score: 47\/100/)
      assert.match(result.stdout, /\[[#-]+\]/)
      assert.match(result.stdout, /Claims/)
      assert.match(result.stdout, /Company\s+Example/)
      assert.match(result.stdout, /Evidence/)
      assert.match(result.stdout, /Ask for official posting/)
    })
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('HireProof CLI plain mode keeps non-boxed readable output', async () => {
  await withMockHireProofApi((request, response) => {
    response.setHeader('content-type', 'application/json')
    response.end(JSON.stringify(sampleReport()))
  }, async (baseUrl) => {
    const result = await runCli(['audit', '--text', 'Remote job', '--base-url', baseUrl, '--api-key', 'test_key', '--plain'])

    assert.equal(result.code, 0)
    assert.match(result.stdout, /Verdict: High-Risk/)
    assert.doesNotMatch(result.stdout, /HIREPROOF TERMINAL REPORT/)
    assert.doesNotMatch(result.stdout, /\+[-]+\+/)
  })
})

test('HireProof CLI no-color removes ANSI escapes from rich output', async () => {
  await withMockHireProofApi((request, response) => {
    response.setHeader('content-type', 'application/json')
    response.end(JSON.stringify(sampleReport()))
  }, async (baseUrl) => {
    const result = await runCli(['audit', '--text', 'Remote job', '--base-url', baseUrl, '--api-key', 'test_key', '--no-color'])

    assert.equal(result.code, 0)
    assert.match(result.stdout, /HIREPROOF TERMINAL REPORT/)
    assert.doesNotMatch(result.stdout, ansiPattern)
  })
})

test('HireProof CLI verbose mode shows more evidence items', async () => {
  await withMockHireProofApi((request, response) => {
    response.setHeader('content-type', 'application/json')
    response.end(JSON.stringify(sampleReport()))
  }, async (baseUrl) => {
    const compact = await runCli(['audit', '--text', 'Remote job', '--base-url', baseUrl, '--api-key', 'test_key', '--no-color'])
    const verbose = await runCli(['audit', '--text', 'Remote job', '--base-url', baseUrl, '--api-key', 'test_key', '--no-color', '--verbose'])

    assert.equal(compact.code, 0)
    assert.equal(verbose.code, 0)
    assert.doesNotMatch(compact.stdout, /No local footprint found/)
    assert.match(verbose.stdout, /No local footprint found/)
  })
})

test('HireProof CLI health output uses branded readiness card', async () => {
  await withMockHireProofApi((request, response) => {
    response.setHeader('content-type', 'application/json')
    response.end(JSON.stringify({
      status: 'ok',
      storage: 'redis',
      liveSearch: true,
      model: true,
      modelProvider: { aiGateway: true, openaiCompatible: true, model: 'openai/gpt-4o-mini' },
    }))
  }, async (baseUrl) => {
    const result = await runCli(['health', '--base-url', baseUrl, '--no-color'])

    assert.equal(result.code, 0)
    assert.match(result.stdout, /HIREPROOF HEALTH CHECK/)
    assert.match(result.stdout, /API\s+ok/)
    assert.match(result.stdout, /Live search\s+ready/)
    assert.match(result.stdout, /AI Gateway\s+ready/)
  })
})

test('HireProof CLI stores and reads local config', async () => {
  const configHome = await mkdtemp(path.join(os.tmpdir(), 'hireproof-config-'))

  try {
    const setUrl = await runCli(['config', 'set', 'baseUrl', 'https://example.test'], { configHome })
    const setKey = await runCli(['config', 'set', 'apiKey', 'local_key'], { configHome })
    const list = await runCli(['config', 'list'], { configHome })

    assert.equal(setUrl.code, 0)
    assert.equal(setKey.code, 0)
    assert.match(list.stdout, /baseUrl: https:\/\/example\.test/)
    assert.match(list.stdout, /apiKey: local_key/)
  } finally {
    await rm(configHome, { recursive: true, force: true })
  }
})
