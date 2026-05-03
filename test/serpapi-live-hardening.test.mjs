import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import vm from 'node:vm'
import ts from 'typescript'

async function loadSerpApiModule() {
  const source = await fs.readFile(new URL('../lib/serpapi.ts', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText

  const context = {
    exports: {},
    process: { env: {} },
    console,
    require: (id) => {
      if (id === '@upstash/redis') return { Redis: class {} }
      return {}
    },
    URLSearchParams,
    AbortController,
    DOMException,
    setTimeout,
    clearTimeout,
    fetch: async () => ({ ok: true, json: async () => ({}) }),
  }
  context.module = { exports: context.exports }

  vm.runInNewContext(compiled, context)
  return context.module.exports
}

async function loadSerpApiModuleWithFetch(fetchImpl) {
  const source = await fs.readFile(new URL('../lib/serpapi.ts', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText

  const context = {
    exports: {},
    process: { env: {} },
    console,
    require: (id) => {
      if (id === '@upstash/redis') return { Redis: class {} }
      return {}
    },
    URLSearchParams,
    AbortController,
    DOMException,
    setTimeout,
    clearTimeout,
    Date,
    fetch: fetchImpl,
  }
  context.module = { exports: context.exports }

  vm.runInNewContext(compiled, context)
  return context.module.exports
}

test('SerpApi news reputation keeps negative evidence company-specific', async () => {
  const source = await fs.readFile(new URL('../lib/serpapi.ts', import.meta.url), 'utf8')

  assert.match(source, /isCompanySpecificNewsResult/)
  assert.match(source, /companyTokens/)
  assert.match(source, /if \(!isCompanySpecificNewsResult\(result, company\)\) continue/)
})

test('live audit routes ensure direct SerpApi coverage after agent execution', async () => {
  const uiRoute = await fs.readFile(new URL('../app/api/audit/route.ts', import.meta.url), 'utf8')
  const apiRoute = await fs.readFile(new URL('../app/api/v1/audit/route.ts', import.meta.url), 'utf8')

  for (const source of [uiRoute, apiRoute]) {
    assert.match(source, /runSmartSerpApiInvestigation/)
    assert.match(source, /ensureSerpApiEvidenceCoverage/)
    assert.match(source, /searchCompanyPresence/)
    assert.match(source, /searchNewsReputation/)
    assert.match(source, /searchComparableJobs/)
    assert.match(source, /searchLocalPresence/)
  }
})

test('SerpApi locale inference localizes Philippine audits', async () => {
  const { resolveSerpApiLocale } = await loadSerpApiModule()

  assert.equal(JSON.stringify(resolveSerpApiLocale('Manila, Philippines')), JSON.stringify({
    gl: 'ph',
    hl: 'en',
    google_domain: 'google.com.ph',
    location: 'Manila, Metro Manila, Philippines',
  }))

  assert.equal(resolveSerpApiLocale('Austin, Texas').gl, 'us')
})

test('smart SerpApi evidence emits trusted positive and high-risk signals', async () => {
  const { buildEvidenceFromSerpApiResults } = await loadSerpApiModule()

  const evidence = buildEvidenceFromSerpApiResults({
    claims: {
      company: 'Acme Careers',
      role: 'Frontend Developer',
      salary: 'PHP 20,000 per month',
      location: 'Manila',
    },
    web: {
      organic_results: [
        {
          title: 'Acme Careers - Official Careers',
          link: 'https://acme.com/careers/frontend-developer',
          displayed_link: 'acme.com',
          snippet: 'Official careers page for frontend developer roles.',
        },
      ],
      knowledge_graph: { title: 'Acme Careers', website: 'https://acme.com' },
    },
    news: {
      news_results: [
        {
          title: 'Authorities warn about Acme Careers impersonation scam',
          link: 'https://news.example.com/acme-careers-impersonation-scam',
          source: { name: 'News Example' },
          date: '2 days ago',
        },
      ],
    },
    jobs: {
      jobs_results: [
        {
          title: 'Frontend Developer',
          company_name: 'Acme Careers',
          location: 'Manila',
          via: 'LinkedIn',
          detected_extensions: { schedule_type: 'Full-time' },
          related_links: [{ link: 'https://linkedin.com/jobs/view/123' }],
          apply_options: [{ title: 'Apply on Acme', link: 'https://acme.com/careers/frontend-developer' }],
        },
      ],
    },
    maps: {
      local_results: [
        {
          title: 'Acme Careers',
          address: 'Makati, Metro Manila',
          phone: '+63 2 1234 5678',
          rating: 4.4,
          reviews: 120,
          website: 'https://acme.com',
          gps_coordinates: { latitude: 14.5547, longitude: 121.0244 },
        },
      ],
    },
  })

  assert.ok(evidence.some(item => item.type === 'Official Company Presence'))
  assert.ok(evidence.some(item => item.type === 'Verified Local Presence'))
  assert.ok(evidence.some(item => item.type === 'Comparable Jobs'))
  assert.ok(evidence.some(item => /Risk signal:/.test(item.snippet)))
})

test('smart SerpApi orchestration uses bounded deep searches before backfill', async () => {
  const source = await fs.readFile(new URL('../lib/serpapi.ts', import.meta.url), 'utf8')

  assert.match(source, /const \[web, applyWeb, news, jobs, companyJobs, maps\]/)
  assert.match(source, /applyHost/)
  assert.match(source, /companyJobs/)
  assert.match(source, /hasCompanyEvidence/)
  assert.match(source, /hasLocalEvidence/)
})

test('SerpApi wrapper caches equivalent searches to save repeated credits', async () => {
  let fetchCount = 0
  const { clearSerpApiResponseCache, getSerpApiResponseCacheStats, searchCompanyPresence } = await loadSerpApiModuleWithFetch(async () => {
    fetchCount += 1
    return {
      ok: true,
      json: async () => ({
        organic_results: [
          {
            title: 'Acme Careers - Official Careers',
            link: 'https://acme.com/careers',
            displayed_link: 'acme.com',
            snippet: 'Official careers page for Acme.',
          },
        ],
      }),
    }
  })

  clearSerpApiResponseCache()
  await searchCompanyPresence('Acme Careers', 'Frontend Developer', 'test-serpapi-key', 'Manila, Philippines')
  await searchCompanyPresence(' acme   careers ', 'frontend developer', 'test-serpapi-key', 'Manila, Philippines')

  assert.equal(fetchCount, 1)
  const stats = getSerpApiResponseCacheStats()
  assert.equal(stats.memoryEntries, 1)
  assert.equal(stats.misses, 1)
  assert.equal(stats.hits, 1)
})

test('smart investigation similarity cache reuses equivalent company role location audits', async () => {
  let fetchCount = 0
  const { clearSerpApiResponseCache, getSerpApiResponseCacheStats, runSmartSerpApiInvestigation } = await loadSerpApiModuleWithFetch(async () => {
    fetchCount += 1
    return {
      ok: true,
      json: async () => ({
        organic_results: [
          {
            title: 'Acme Careers - Official Careers',
            link: 'https://acme.com/careers',
            displayed_link: 'acme.com',
            snippet: 'Official careers page for Acme.',
          },
        ],
      }),
    }
  })

  clearSerpApiResponseCache()
  await runSmartSerpApiInvestigation({
    company: 'Acme Careers Inc.',
    role: 'Junior Frontend Developer',
    salary: 'PHP 30,000 per month',
    location: 'Makati, Philippines',
  }, { serpapiKey: 'test-serpapi-key', applicationUrl: 'https://acme.com/careers/123' })

  await runSmartSerpApiInvestigation({
    company: 'acme careers',
    role: 'Frontend Developer',
    salary: 'PHP 32,000 per month',
    location: 'Manila, Philippines',
  }, { serpapiKey: 'test-serpapi-key', applicationUrl: 'https://acme.com/jobs/456' })

  assert.ok(fetchCount > 0)
  assert.ok(fetchCount <= 6)
  assert.equal(getSerpApiResponseCacheStats().similarityHits, 1)
})

test('SerpApi source includes persistent redis cache hooks and quota telemetry', async () => {
  const source = await fs.readFile(new URL('../lib/serpapi.ts', import.meta.url), 'utf8')

  assert.match(source, /@upstash\/redis/)
  assert.match(source, /readPersistentSerpApiCache/)
  assert.match(source, /writePersistentSerpApiCache/)
  assert.match(source, /readPersistentSmartInvestigationCache/)
  assert.match(source, /writePersistentSmartInvestigationCache/)
  assert.match(source, /creditsSaved/)
  assert.match(source, /similarityHits/)
})
