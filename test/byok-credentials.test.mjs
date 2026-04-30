import test from 'node:test'
import assert from 'node:assert/strict'
import {
  decryptSecret,
  encryptSecret,
  redactSecret,
} from '../lib/byok-crypto.mjs'

test('byok credential encryption round-trips without storing plaintext', () => {
  const encrypted = encryptSecret('sk-test-owner-secret', 'test-encryption-secret')

  assert.notEqual(encrypted.ciphertext, 'sk-test-owner-secret')
  assert.doesNotMatch(JSON.stringify(encrypted), /sk-test-owner-secret/)
  assert.equal(decryptSecret(encrypted, 'test-encryption-secret'), 'sk-test-owner-secret')
})

test('byok credential decryption fails with the wrong key', () => {
  const encrypted = encryptSecret('serpapi-owner-secret', 'correct-encryption-secret')

  assert.throws(() => decryptSecret(encrypted, 'wrong-encryption-secret'))
})

test('byok credential redaction keeps only safe metadata', () => {
  assert.deepEqual(redactSecret('sk-test-owner-secret'), {
    lastFour: 'cret',
  })
})

test('developer portal does not persist hosted provider secrets to localStorage', async () => {
  const source = await import('node:fs/promises').then((fs) =>
    fs.readFile(new URL('../app/developer/developer-client.tsx', import.meta.url), 'utf8')
  )

  assert.doesNotMatch(source, /localStorage\.setItem\('MODEL_PROVIDER_KEY'/)
  assert.doesNotMatch(source, /localStorage\.setItem\('SERPAPI_API_KEY'/)
  assert.match(source, /\/api\/developer\/provider-credentials/)
})

test('authenticated audit and mcp routes load owner byok credentials', async () => {
  const fs = await import('node:fs/promises')
  const v1AuditRoute = await fs.readFile(new URL('../app/api/v1/audit/route.ts', import.meta.url), 'utf8')
  const mcpRoute = await fs.readFile(new URL('../app/api/mcp/route.ts', import.meta.url), 'utf8')
  const mcpTools = await fs.readFile(new URL('../lib/mcp-tools.ts', import.meta.url), 'utf8')
  const serpapi = await fs.readFile(new URL('../lib/serpapi.ts', import.meta.url), 'utf8')
  const aiModel = await fs.readFile(new URL('../lib/ai-model.ts', import.meta.url), 'utf8')

  assert.match(v1AuditRoute, /getOwnerProviderCredentials/)
  assert.match(v1AuditRoute, /credentialMode/)
  assert.match(mcpRoute, /getOwnerProviderCredentials/)
  assert.match(mcpTools, /serpapiKey/)
  assert.match(serpapi, /serpapiKey\?: string/)
  assert.match(aiModel, /modelProviderKey\?: string/)
})
