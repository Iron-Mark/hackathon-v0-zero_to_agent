import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildAuditSignals,
  scoreAuditSignals,
} from '../lib/audit-signals.mjs'
import { enrichAuditRequestWithOcr } from '../lib/ocr.mjs'

function scoreCase(claims, evidence = [], redFlags = [], greenFlags = []) {
  const signals = buildAuditSignals(claims, redFlags, greenFlags, evidence)
  return {
    signals,
    score: scoreAuditSignals(signals, evidence),
  }
}

function verdict(score) {
  if (score < 35) return 'safe'
  if (score < 65) return 'caution'
  return 'high-risk'
}

test('legitimate staffing agency listing does not become high risk just because the agency is not the end client', () => {
  const claims = {
    company: 'Crossing Hurdles',
    role: 'Frontend Developer',
    salary: '$20 - $70/hour',
    location: 'Philippines Remote',
    contactMethod: 'LinkedIn',
    applicationPath: 'LinkedIn Easy Apply',
  }
  const evidence = [
    {
      type: 'Job Post Source',
      source: 'LinkedIn public job page',
      snippet: 'Trust: reputable-job-board | Frontend Developer at Crossing Hurdles | Easy Apply | Contract remote role.',
    },
    {
      type: 'Company Check',
      source: 'Public web search',
      snippet: 'Public recruiting agency footprint found for Crossing Hurdles.',
    },
  ]

  const { score } = scoreCase(claims, evidence)

  assert.notEqual(verdict(score), 'high-risk')
})

test('promoted LinkedIn listing with normal apply path remains low risk unless other scam signals appear', () => {
  const claims = {
    company: 'Canva',
    role: 'Frontend Engineer',
    salary: '$60 - $85/hour',
    location: 'Remote',
    contactMethod: 'LinkedIn',
    applicationPath: 'LinkedIn Easy Apply',
  }
  const evidence = [
    {
      type: 'Job Post Source',
      source: 'LinkedIn promoted job',
      snippet: 'Trust: reputable-job-board | Promoted LinkedIn listing with Easy Apply and standard interview path.',
    },
    {
      type: 'Official Company Presence',
      source: 'SerpApi Google Search',
      snippet: 'Trust: official | Canva official website and careers footprint matched.',
      url: 'https://www.canva.com/careers',
    },
  ]

  const { score } = scoreCase(claims, evidence)

  assert.equal(verdict(score), 'safe')
})

test('copied repost with off-platform contact is high risk even when the copied source looks reputable', () => {
  const claims = {
    company: 'Microsoft Corporation',
    role: 'Frontend Intern',
    salary: 'PHP 80,000 per week',
    location: 'Remote Philippines',
    contactMethod: 'Telegram',
    applicationPath: 'No interview mentioned',
  }
  const evidence = [
    {
      type: 'Job Post Source',
      source: 'LinkedIn public job page',
      snippet: 'Trust: reputable-job-board | Resolved job page belongs to Crossing Hurdles, not Microsoft Corporation.',
    },
    {
      type: 'Input Conflict',
      source: 'LinkedIn public job page',
      snippet: 'Submitted text conflicts with the resolved public job page company and role.',
    },
  ]

  const { score, signals } = scoreCase(claims, evidence)

  assert.equal(verdict(score), 'high-risk')
  assert.ok(signals.some((signal) => signal.id === 'entity.input_conflict'))
})

test('agency versus client-company wording is caution at most when the apply path is still a reputable board', () => {
  const claims = {
    company: 'TalentBridge Recruiting',
    role: 'Backend Engineer for client fintech team',
    salary: '$45/hour',
    location: 'Remote United States',
    contactMethod: 'LinkedIn',
    applicationPath: 'Provided job URL',
  }
  const evidence = [
    {
      type: 'Job Post Source',
      source: 'LinkedIn public job page',
      snippet: 'Trust: reputable-job-board | TalentBridge Recruiting hiring for an unnamed client fintech team.',
    },
    {
      type: 'Company Check',
      source: 'Public web search',
      snippet: 'TalentBridge Recruiting has a public recruiting-agency footprint.',
    },
  ]

  const { score, signals } = scoreCase(claims, evidence)

  assert.notEqual(verdict(score), 'high-risk')
  assert.equal(signals.some((signal) => signal.id === 'entity.input_conflict'), false)
})

test('URL-inaccessible screenshot audit still appends OCR text for claim extraction', async () => {
  const { request, evidence } = await enrichAuditRequestWithOcr(
    {
      text: '',
      url: 'https://example.invalid/private-job-post',
      image: 'data:image/png;base64,aGVsbG8=',
    },
    {
      fetchImpl: async () => ({
        ok: false,
        status: 403,
        json: async () => ({}),
      }),
      preprocessTesseract: false,
      tesseractImpl: {
        recognize: async () => ({
          data: {
            text: 'Acme Support Assistant remote role apply through official careers page interview required',
            confidence: 88,
          },
        }),
      },
    },
  )

  assert.match(request.text, /Screenshot OCR content:/)
  assert.match(request.text, /Acme Support Assistant/)
  assert.equal(evidence[0].type, 'Screenshot OCR')
})

test('screenshot-only scam text calibrates to high risk after OCR-derived claim recovery', async () => {
  const { request, evidence } = await enrichAuditRequestWithOcr(
    {
      text: '',
      image: 'data:image/png;base64,aGVsbG8=',
    },
    {
      fetchImpl: async () => ({
        ok: false,
        status: 403,
        json: async () => ({}),
      }),
      preprocessTesseract: false,
      tesseractImpl: {
        recognize: async () => ({
          data: {
            text: 'Remote frontend intern PHP 80,000 per week no interview recruiter only wants Telegram contact',
            confidence: 86,
          },
        }),
      },
    },
  )
  const claims = {
    company: 'Unknown / Not Verifiable',
    role: 'Frontend Intern',
    salary: 'PHP 80,000 per week',
    location: 'Remote Philippines',
    contactMethod: 'Telegram',
    applicationPath: 'No interview mentioned',
  }

  const { score } = scoreCase(claims, evidence)

  assert.match(request.text, /Screenshot OCR content:/)
  assert.equal(verdict(score), 'high-risk')
}
)
