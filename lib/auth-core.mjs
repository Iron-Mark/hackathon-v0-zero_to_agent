import crypto from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(crypto.scrypt)
const PASSWORD_PREFIX = 'scrypt'

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const key = await scrypt(password, salt, 64)
  return `${PASSWORD_PREFIX}:${salt}:${Buffer.from(key).toString('hex')}`
}

export async function verifyPassword(password, storedHash) {
  const [prefix, salt, expectedHex] = String(storedHash || '').split(':')
  if (prefix !== PASSWORD_PREFIX || !salt || !expectedHex) return false

  const actual = await scrypt(password, salt, 64)
  const expected = Buffer.from(expectedHex, 'hex')
  const actualBuffer = Buffer.from(actual)
  if (actualBuffer.length !== expected.length) return false
  return crypto.timingSafeEqual(actualBuffer, expected)
}

export function hashApiKey(rawKey) {
  return crypto.createHash('sha256').update(String(rawKey)).digest('hex')
}

export function createApiKey(name, ownerId = '') {
  const rawKey = `hp_live_${crypto.randomBytes(24).toString('base64url')}`
  const now = new Date().toISOString()
  const record = {
    id: `key_${crypto.randomUUID()}`,
    ownerId,
    name: String(name || 'API Key').slice(0, 80),
    keyHash: hashApiKey(rawKey),
    lastFour: rawKey.slice(-4),
    createdAt: now,
    lastUsedAt: null,
    revokedAt: null,
  }
  return { rawKey, record }
}

export function createSessionToken(userId, secret, ttlSeconds = 60 * 60 * 24 * 7) {
  const expiresAt = Date.now() + ttlSeconds * 1000
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt })).toString('base64url')
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifySessionToken(token, secret) {
  const [payload, signature] = String(token || '').split('.')
  if (!payload || !signature || !secret) return null
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!data.userId || !data.expiresAt || Date.now() > data.expiresAt) return null
    return data
  } catch {
    return null
  }
}
