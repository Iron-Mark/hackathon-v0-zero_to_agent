import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { buildTrendsViewModel } from '../lib/trends-view-model.mjs'

test('explore client fetches the intelligence reports endpoint', async () => {
  const source = await fs.readFile(new URL('../app/explore/explore-client.tsx', import.meta.url), 'utf8')

  assert.match(source, /\/api\/intelligence\/reports/)
  assert.doesNotMatch(source, /\/api\/reports/)
})

test('missing-user auth dummy hash uses the scrypt verifier format', async () => {
  const source = await fs.readFile(new URL('../lib/auth-store.ts', import.meta.url), 'utf8')

  assert.match(source, /scrypt:hireproof_dummy_salt_2026:/)
  assert.doesNotMatch(source, /\$2b\$10\$dummyhashplaceholder/)
})

test('trends view model maps stored audit API shape into UI sections', () => {
  const viewModel = buildTrendsViewModel({
    totalReports: 10,
    verdicts: { safe: 4, caution: 3, 'high-risk': 3 },
    topLocations: [{ label: 'Philippines', count: 6 }],
    topRoles: [{ label: 'Frontend Intern', count: 5 }],
    topContactMethods: [{ label: 'Telegram', count: 3 }],
    recentReports: [
      {
        id: 'audit_1',
        verdict: 'high-risk',
        riskScore: 92,
        summary: 'Telegram handoff and unrealistic salary.',
        extractedClaims: {
          company: 'TechStart',
          role: 'Frontend Intern',
          salary: 'PHP 80,000/week',
          location: 'Remote',
          contactMethod: 'Telegram',
          applicationPath: 'Message recruiter',
        },
        redFlags: ['Telegram-only contact'],
        greenFlags: [],
        evidence: [],
        alternatives: [],
        timeline: [],
        confidence: 'high',
        timestamp: '2026-04-29T00:00:00.000Z',
      },
    ],
    externalSignals: [{ title: 'Fake job warning' }],
    mode: 'stored-audits',
  })

  assert.equal(viewModel.statCards[0].label, 'Reports Reviewed')
  assert.equal(viewModel.statCards[0].value, '10')
  assert.equal(viewModel.statCards[1].value, '3')
  assert.equal(viewModel.vectorSections[0].title, 'Contact methods')
  assert.deepEqual(viewModel.vectorSections[0].items[0], { label: 'Telegram', count: 3, percent: 30 })
  assert.equal(viewModel.recentHighRisk[0].company, 'TechStart')
  assert.equal(viewModel.modeLabel, 'Stored audits')
})

test('triple-track coverage has an app docs page and sidebar link', async () => {
  const docsPage = await fs.readFile(new URL('../app/docs/triple-track-coverage/page.tsx', import.meta.url), 'utf8')
  const docsLayout = await fs.readFile(new URL('../app/docs/layout.tsx', import.meta.url), 'utf8')

  assert.match(docsPage, /v0 \+ MCPs/)
  assert.match(docsPage, /ChatSDK Agents/)
  assert.match(docsPage, /Vercel Workflow/)
  assert.match(docsLayout, /\/docs\/triple-track-coverage/)
})

test('chat and workflow status endpoints expose honest track readiness', async () => {
  const chatRoute = await fs.readFile(new URL('../app/api/chat/hireproof/route.ts', import.meta.url), 'utf8')
  const workflowRoute = await fs.readFile(new URL('../app/api/workflows/audit/route.ts', import.meta.url), 'utf8')

  assert.match(chatRoute, /ChatSDK-ready/)
  assert.match(chatRoute, /not a platform webhook adapter/)
  assert.match(workflowRoute, /WDK-ready/)
  assert.match(workflowRoute, /durable workflow/)
})

test('lab client streams real audit events instead of simulated telemetry', async () => {
  const source = await fs.readFile(new URL('../app/lab/lab-client.tsx', import.meta.url), 'utf8')

  assert.match(source, /\/api\/audit/)
  assert.match(source, /AuditReport/)
  assert.match(source, /TextDecoder/)
  assert.match(source, /parsed\.type === 'log'/)
  assert.match(source, /parsed\.type === 'result'/)
  assert.match(source, /parsed\.type === 'error'/)
  assert.doesNotMatch(source, /Generic Optimization/)
  assert.doesNotMatch(source, /Domain age: 4 days/)
  assert.doesNotMatch(source, /Visual demo mode/)
  assert.doesNotMatch(source, /0\.4ms/)
  assert.doesNotMatch(source, /Math\.random/)
})
