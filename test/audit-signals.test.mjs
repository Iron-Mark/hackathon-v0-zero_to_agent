import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildAuditSignals,
  scoreAuditSignals,
  strongestRiskSignals,
  strongestTrustSignals,
} from '../lib/audit-signals.mjs'

function verdict(score) {
  if (score < 35) return 'safe'
  if (score < 65) return 'caution'
  return 'high-risk'
}

test('critical scam pattern gets a high-risk floor', () => {
  const claims = {
    company: 'Unknown / Not Verifiable',
    role: 'Frontend Intern',
    salary: 'PHP 80,000 per week',
    location: 'Remote Philippines',
    contactMethod: 'Telegram',
    applicationPath: 'No interview mentioned',
  }

  const signals = buildAuditSignals(claims, [], [], [])
  const score = scoreAuditSignals(signals, [])

  assert.equal(score >= 80, true)
  assert.equal(verdict(score), 'high-risk')
  assert.ok(signals.some((signal) => signal.id === 'salary.implausible_weekly_entry_role'))
  assert.ok(signals.some((signal) => signal.id === 'contact.telegram_only'))
  assert.ok(signals.some((signal) => signal.id === 'process.no_interview'))
})

test('official matching evidence caps low-risk conventional hiring path', () => {
  const claims = {
    company: 'Canva',
    role: 'Product Designer',
    salary: '$120,000 per year',
    location: 'Sydney',
    contactMethod: 'Email',
    applicationPath: 'Official careers channel',
  }
  const evidence = [
    {
      type: 'Official Company Presence',
      source: 'SerpApi Google Knowledge Graph',
      snippet: 'Trust: official | Knowledge Graph matched Canva.',
      url: 'https://www.canva.com',
    },
    {
      type: 'Verified Local Presence',
      source: 'SerpApi Google Maps',
      snippet: 'Trust: verified-local | Place detail matched Canva | Address: Sydney',
      url: 'https://www.canva.com',
    },
    {
      type: 'Comparable Jobs',
      source: 'LinkedIn',
      snippet: 'Trust: reputable-job-board | Product Designer at Canva | Salary: $120,000 per year',
      url: 'https://www.linkedin.com/jobs/view/123',
    },
  ]

  const signals = buildAuditSignals(claims, [], [], evidence)
  const score = scoreAuditSignals(signals, evidence)

  assert.equal(score <= 30, true)
  assert.equal(verdict(score), 'safe')
  assert.ok(strongestTrustSignals(signals).some((signal) => signal.id === 'source.official_match'))
})

test('input conflict prevents a safe verdict despite reputable job source', () => {
  const claims = {
    company: 'Crossing Hurdles',
    role: 'Frontend Developer',
    salary: '$20 - $70/hour',
    location: 'Philippines Remote',
    contactMethod: 'LinkedIn',
    applicationPath: 'Easy Apply',
  }
  const evidence = [
    {
      type: 'Job Post Source',
      source: 'LinkedIn public job page',
      snippet: 'HireProof read public job content from https://www.linkedin.com/jobs/collections/recommended/?currentJobId=4406287170.',
    },
    {
      type: 'Input Conflict',
      source: 'LinkedIn public job page',
      snippet: 'Submitted company says "Microsoft Corporation", but the resolved job page says "Crossing Hurdles".',
    },
  ]

  const signals = buildAuditSignals(claims, [], [], evidence)
  const score = scoreAuditSignals(signals, evidence)
  const redFlags = strongestRiskSignals(signals).map((signal) => signal.explanation)

  assert.equal(score >= 45, true)
  assert.notEqual(verdict(score), 'safe')
  assert.ok(redFlags.some((flag) => flag.includes('conflicts with the resolved public job page')))
})

test('apply path mismatch creates a caution floor', () => {
  const claims = {
    company: 'Acme',
    role: 'Backend Engineer',
    salary: '$90,000 per year',
    location: 'Remote',
    contactMethod: 'Email',
    applicationPath: 'Provided job URL',
  }
  const evidence = [
    {
      type: 'Official Company Presence',
      source: 'SerpApi Google Search',
      snippet: 'Trust: official | Acme careers page found.',
      url: 'https://acme.com/careers',
    },
    {
      type: 'Apply Path Mismatch',
      source: 'SerpApi Google Jobs',
      snippet: 'Risk signal: submitted apply domain random-form.example does not match official company domain acme.com.',
      url: 'https://random-form.example/apply',
    },
  ]

  const score = scoreAuditSignals(buildAuditSignals(claims, [], [], evidence), evidence)

  assert.equal(score >= 45, true)
  assert.equal(verdict(score), 'caution')
})

test('thin evidence with unknown company cannot become high-confidence safe', () => {
  const claims = {
    company: 'Unknown / Not Verifiable',
    role: 'Remote Assistant',
    salary: 'Not specified',
    location: 'Remote',
    contactMethod: 'Email',
    applicationPath: 'Provided job URL',
  }

  const score = scoreAuditSignals(buildAuditSignals(claims, [], [], []), [])

  assert.equal(score >= 40, true)
  assert.notEqual(verdict(score), 'safe')
})

test('screenshot OCR evidence improves audit coverage without overriding risk signals', () => {
  const claims = {
    company: 'Unknown / Not Verifiable',
    role: 'Frontend Intern',
    salary: 'PHP 80,000 per week',
    location: 'Remote Philippines',
    contactMethod: 'Telegram',
    applicationPath: 'No interview mentioned',
  }
  const evidence = [
    {
      type: 'Screenshot OCR',
      source: 'Screenshot OCR: Google Vision',
      snippet: 'Remote frontend intern, PHP 80,000 per week, no interview, Telegram contact.',
    },
  ]

  const signals = buildAuditSignals(claims, [], [], evidence)
  const score = scoreAuditSignals(signals, evidence)

  assert.ok(signals.some((signal) => signal.id === 'screenshot.ocr_google_vision'))
  assert.equal(score >= 80, true)
})

test('unavailable screenshot OCR adds a confidence penalty', () => {
  const claims = {
    company: 'Unknown / Not Verifiable',
    role: 'Remote Assistant',
    salary: 'Not specified',
    location: 'Remote',
    contactMethod: 'Not specified',
    applicationPath: 'Not specified',
  }
  const evidence = [
    {
      type: 'Screenshot OCR Unavailable',
      source: 'Screenshot OCR unavailable',
      snippet: 'OCR unavailable: Google Vision API key is not configured; fallback OCR failed.',
    },
  ]

  const signals = buildAuditSignals(claims, [], [], evidence)

  assert.ok(signals.some((signal) => signal.id === 'screenshot.ocr_unavailable'))
})

test('strongest signal helpers expose explainable reasons', () => {
  const claims = {
    company: 'Unknown / Not Verifiable',
    role: 'Frontend Intern',
    salary: 'PHP 80,000 per week',
    location: 'Remote Philippines',
    contactMethod: 'Telegram',
    applicationPath: 'No interview mentioned',
  }
  const signals = buildAuditSignals(claims, [], [], [])

  assert.match(strongestRiskSignals(signals, 1)[0].explanation, /salary|implausible/i)
  assert.equal(strongestTrustSignals(signals).length, 1)
  assert.match(strongestRiskSignals(signals).map((signal) => signal.explanation).join(' '), /Telegram|interview|salary|implausible/i)
})
