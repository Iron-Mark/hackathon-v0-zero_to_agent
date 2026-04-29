import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createApiKey,
  createSessionToken,
  hashApiKey,
  hashPassword,
  verifyPassword,
  verifySessionToken,
} from '../lib/auth-core.mjs'

test('password hashes verify the original password and reject another password', async () => {
  const hash = await hashPassword('correct horse battery staple')

  assert.equal(await verifyPassword('correct horse battery staple', hash), true)
  assert.equal(await verifyPassword('wrong password', hash), false)
})

test('session tokens are signed and reject tampering', () => {
  const token = createSessionToken('user_123', 'secret-key')
  const parsed = verifySessionToken(token, 'secret-key')
  const [payload, signature] = token.split('.')
  const tamperedPayload = `${payload.slice(0, -1)}${payload.endsWith('A') ? 'B' : 'A'}`

  assert.equal(parsed?.userId, 'user_123')
  assert.equal(verifySessionToken(`${tamperedPayload}.${signature}`, 'secret-key'), null)
})

test('api keys expose raw token once and use stable hashes for lookup', () => {
  const key = createApiKey('Production')

  assert.match(key.rawKey, /^hp_live_/)
  assert.equal(key.record.name, 'Production')
  assert.equal(key.record.keyHash, hashApiKey(key.rawKey))
  assert.equal(key.record.lastFour, key.rawKey.slice(-4))
})
