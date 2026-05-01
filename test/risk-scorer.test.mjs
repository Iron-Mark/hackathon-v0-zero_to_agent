import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import vm from 'node:vm'
import ts from 'typescript'

async function loadRiskScorer() {
  const source = await fs.readFile(new URL('../lib/risk-scorer.ts', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText

  const context = {
    exports: {},
    require: () => ({}),
  }

  vm.runInNewContext(compiled, context)
  return context.exports
}

test('green verification signals lower risk instead of increasing it', async () => {
  const { calculateRiskScore, determineVerdict } = await loadRiskScorer()

  const neutral = calculateRiskScore(
    {
      company: 'Apex Careers',
      role: 'Frontend Intern',
      salary: 'PHP 20,000 per month',
      location: 'Manila',
      contactMethod: 'Email',
      applicationPath: 'Official careers page',
    },
    [],
    [],
    [],
  )

  const verified = calculateRiskScore(
    {
      company: 'Apex Careers',
      role: 'Frontend Intern',
      salary: 'PHP 20,000 per month',
      location: 'Manila',
      contactMethod: 'Email',
      applicationPath: 'Official careers page',
    },
    [],
    [
      'Company web presence verified',
      'Professional application through official channels',
      'Salary formatted as standard market rate',
      'Specific location provided',
    ],
    [
      { type: 'Company Check', source: 'Search', snippet: 'Official careers page found.' },
      { type: 'Local Presence', source: 'Maps', snippet: 'Registered local office found.' },
    ],
  )

  assert.ok(verified < neutral, `expected verified score ${verified} to be lower than neutral score ${neutral}`)
  assert.equal(determineVerdict(verified), 'safe')
})

test('obvious scam patterns stay high risk even with one generic positive signal', async () => {
  const { calculateRiskScore, determineVerdict } = await loadRiskScorer()
  const score = calculateRiskScore(
    {
      company: 'Unknown / Not Verifiable',
      role: 'Remote Frontend Intern',
      salary: 'PHP 80,000 per week',
      location: 'Remote',
      contactMethod: 'Telegram',
      applicationPath: 'No interview mentioned',
    },
    [
      'Unrealistically high salary for the role level',
      'Salary quoted per week instead of annual (suspicious)',
      'Telegram-only contact method (bypasses official channels)',
      'Company name not verifiable via web search',
      'No interview process mentioned',
    ],
    ['Specific location provided'],
    [],
  )

  assert.ok(score >= 80, `expected scam-pattern score to remain high, got ${score}`)
  assert.equal(determineVerdict(score), 'high-risk')
})

