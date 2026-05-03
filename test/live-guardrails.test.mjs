import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import vm from 'node:vm'
import ts from 'typescript'

async function loadGuardrailsModule() {
  const source = await fs.readFile(new URL('../lib/live-audit-guardrails.ts', import.meta.url), 'utf8')
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
    process: { env: {} },
    require: (id) => {
      if (id === '@/lib/rate-limit') {
        return {
          checkRateLimit: async () => ({ success: true, remaining: 1 }),
        }
      }
      if (id === '@upstash/redis') return { Redis: class {} }
      return {}
    },
    Date,
    setTimeout,
    clearTimeout,
  }
  context.module = { exports: context.exports }
  vm.runInNewContext(compiled, context)
  return context.module.exports
}

test('live audit guardrail blocks concurrent expensive audits with user-facing status', async () => {
  const { acquireLiveAuditGuardrail, clearLiveAuditGuardrailsForTests } = await loadGuardrailsModule()

  clearLiveAuditGuardrailsForTests()
  const first = await acquireLiveAuditGuardrail({ identifier: 'ip:1', channel: 'web', live: true })
  const second = await acquireLiveAuditGuardrail({ identifier: 'ip:1', channel: 'web', live: true })
  const third = await acquireLiveAuditGuardrail({ identifier: 'ip:1', channel: 'web', live: true })

  assert.equal(first.allowed, true)
  assert.equal(second.allowed, true)
  assert.equal(third.allowed, false)
  assert.equal(third.status.status, 'throttled')
  assert.match(third.status.message, /busy|try again/i)

  await first.release()
  await second.release()
})

test('live audit guardrail skips limits for demo audits', async () => {
  const { acquireLiveAuditGuardrail, clearLiveAuditGuardrailsForTests } = await loadGuardrailsModule()

  clearLiveAuditGuardrailsForTests()
  const result = await acquireLiveAuditGuardrail({ identifier: 'ip:demo', channel: 'web', live: false })

  assert.equal(result.allowed, true)
  assert.equal(result.status.status, 'not-live')
  await result.release()
})

