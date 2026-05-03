import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import vm from 'node:vm'
import ts from 'typescript'

async function loadAlternativesModule() {
  const source = await fs.readFile(new URL('../lib/alternative-jobs.ts', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText
  const context = { exports: {}, module: { exports: {} } }
  context.module.exports = context.exports
  vm.runInNewContext(compiled, context)
  return context.module.exports
}

test('verified alternatives require sourced comparable job evidence', async () => {
  const { buildVerifiedAlternativeJobs } = await loadAlternativesModule()
  const alternatives = buildVerifiedAlternativeJobs([
    {
      source: 'SerpApi Google Jobs',
      type: 'Comparable Jobs',
      snippet: 'Trust: reputable-job-board | Frontend Developer at Real Careers PH | Location: Manila | Salary: PHP 70,000 per month',
      url: 'https://www.linkedin.com/jobs/view/123',
    },
    {
      source: 'Generic Jobs',
      type: 'Comparable Jobs',
      snippet: 'Trust: job-result | Placeholder Developer at No Source Inc | Location: Manila | Salary: PHP 90,000 per month',
    },
  ])

  assert.equal(JSON.stringify(alternatives), JSON.stringify([
    {
      title: 'Frontend Developer',
      company: 'Real Careers PH',
      salary: 'PHP 70,000 per month',
      location: 'Manila',
      url: 'https://www.linkedin.com/jobs/view/123',
      source: 'SerpApi Google Jobs',
      verifiedSource: 'reputable-job-board',
    },
  ]))
})
