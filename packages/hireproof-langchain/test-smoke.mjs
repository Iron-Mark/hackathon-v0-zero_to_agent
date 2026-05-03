import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const {
  HireProofAuditInputSchema,
  createHireProofAuditTool,
  isSafeEnough,
  runHireProofAudit,
} = require('./dist/index.js')

class FakeDynamicStructuredTool {
  constructor(config) {
    this.name = config.name
    this.description = config.description
    this.schema = config.schema
    this.func = config.func
  }
}

const parsed = HireProofAuditInputSchema.parse({
  text: 'Remote frontend intern. PHP 80,000/week. No interview.',
})
assert.equal(parsed.mode, 'demo')
assert.equal(isSafeEnough({ verdict: 'safe', riskScore: 12 }), true)
assert.equal(isSafeEnough({ verdict: 'high-risk', riskScore: 92 }), false)

const tool = createHireProofAuditTool({
  DynamicStructuredTool: FakeDynamicStructuredTool,
  apiKey: 'hireproof_agent_demo_key',
})
assert.equal(tool.name, 'hireproof_job_safety_audit')

const report = await runHireProofAudit({
  text: 'Remote frontend intern. PHP 80,000/week. No interview. Message us on Telegram.',
  location: 'Philippines',
  mode: 'demo',
})

assert.equal(report.verdict, 'high-risk')
assert.ok(Number(report.riskScore) >= 80)

console.log('@hireproof/langchain tests passed')
