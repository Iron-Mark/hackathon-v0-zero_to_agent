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

test('transparent RLHF coding contractor role is caution, not high-risk or fully safe', () => {
  const claims = {
    company: 'Outlier AI',
    role: 'TypeScript Software Engineer for RLHF code review',
    salary: '$30 - $70/hour',
    location: 'Remote accepted countries only',
    contactMethod: 'Official platform application',
    applicationPath: 'Official platform application with identity verification',
  }
  const evidence = [
    {
      type: 'Job Post Source',
      source: 'Official platform job page',
      snippet: 'Trust: reputable-job-board | TypeScript Software Engineer remote contractor role. 1099 independent contractor. Hours are project-dependent and not guaranteed week to week. Payment weekly via PayPal or Stripe.',
    },
    {
      type: 'Contract Transparency',
      source: 'Resolved job page',
      snippet: 'Accepted countries only. Not compatible with F-1 OPT, STEM OPT, W-2 employment, guaranteed hours, or employer sponsorship. Unable to provide offer letters or employment verification. Identity verification and valid contractor documentation required.',
    },
    {
      type: 'Role Details',
      source: 'Resolved job page',
      snippet: 'Help train large language models through RLHF. Compare and rank multiple code snippets, repair AI-generated code, explain code review decisions, and convert feedback into reward signals.',
    },
  ]

  const { score, signals } = scoreCase(claims, evidence)

  assert.equal(verdict(score), 'caution')
  assert.equal(score >= 35 && score < 65, true)
  assert.ok(signals.some((signal) => signal.id === 'contractor.variable_hours_caution'))
  assert.ok(signals.some((signal) => signal.id === 'contractor.transparent_limitations'))
  assert.ok(signals.some((signal) => signal.id === 'role.rlhf_ai_training_context'))
  assert.equal(signals.some((signal) => signal.id === 'contact.telegram_only'), false)
  assert.equal(signals.some((signal) => signal.id === 'process.no_interview'), false)
})

test('RLHF contractor role becomes high risk when paired with Telegram and no interview scam signals', () => {
  const claims = {
    company: 'Unknown / Not Verifiable',
    role: 'TypeScript Software Engineer RLHF Contractor',
    salary: '$70/hour',
    location: 'Remote',
    contactMethod: 'Telegram',
    applicationPath: 'No interview mentioned',
  }
  const evidence = [
    {
      type: 'Screenshot OCR',
      source: 'Screenshot OCR: Google Vision',
      snippet: 'RLHF coding contractor role. Contact recruiter only on Telegram. No interview required. Start today.',
    },
  ]

  const { score } = scoreCase(claims, evidence)

  assert.equal(verdict(score), 'high-risk')
})
