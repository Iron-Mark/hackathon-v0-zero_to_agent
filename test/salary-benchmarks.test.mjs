import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import vm from 'node:vm'
import ts from 'typescript'

async function loadSalaryModule() {
  const source = await fs.readFile(new URL('../lib/salary-benchmarks.ts', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText

  const context = {
    exports: {},
    console,
    URL,
  }
  context.module = { exports: context.exports }
  vm.runInNewContext(compiled, context)
  return context.module.exports
}

test('seeded salary benchmark returns country role seniority band', async () => {
  const { getSeededSalaryBenchmark } = await loadSalaryModule()

  const benchmark = getSeededSalaryBenchmark({
    role: 'Senior Frontend Developer',
    location: 'Manila, Philippines',
    seniority: 'senior',
  })

  assert.equal(benchmark.country, 'PH')
  assert.equal(benchmark.currency, 'PHP')
  assert.equal(benchmark.source, 'seeded-country-band')
  assert.ok(benchmark.monthlyLow > 0)
  assert.ok(benchmark.monthlyHigh > benchmark.monthlyLow)
})

test('hybrid salary benchmark prefers fresh live comparable median over seeded fallback', async () => {
  const { buildHybridSalaryBenchmark } = await loadSalaryModule()

  const benchmark = buildHybridSalaryBenchmark({
    role: 'Senior Frontend Developer',
    location: 'Manila, Philippines',
    seniority: 'senior',
    liveComparableMonthlyValues: [100000, 120000, 140000],
  })

  assert.equal(benchmark.source, 'serpapi-live-comparables')
  assert.equal(benchmark.comparableMonthlyAmount, 120000)
  assert.equal(benchmark.country, 'PH')
})

test('hybrid salary benchmark falls back to seeded band when live comparable data is sparse', async () => {
  const { buildHybridSalaryBenchmark } = await loadSalaryModule()

  const benchmark = buildHybridSalaryBenchmark({
    role: 'Frontend Developer',
    location: 'Remote',
    seniority: 'mid',
    liveComparableMonthlyValues: [3000],
  })

  assert.equal(benchmark.source, 'seeded-country-band')
  assert.equal(benchmark.country, 'REMOTE')
  assert.ok(benchmark.comparableMonthlyAmount > 0)
})

