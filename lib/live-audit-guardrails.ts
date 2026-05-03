import { Redis } from '@upstash/redis'
import { checkRateLimit } from '@/lib/rate-limit'
import type { OperationalStatus } from '@/lib/schemas'

type GuardrailChannel = 'web' | 'api'

export const LIVE_SEARCH_OPERATION_FIELD = 'liveSearch'

type AcquireInput = {
  identifier: string
  channel: GuardrailChannel
  live: boolean
}

type GuardrailResult = {
  allowed: boolean
  status: OperationalStatus
  retryAfterSec?: number
  release: () => Promise<void>
}

const localConcurrency = new Map<string, number>()
let globalRedis: Redis | null = null

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) return null
  if (!globalRedis) {
    try {
      globalRedis = new Redis({ url, token })
    } catch {
      return null
    }
  }
  return globalRedis
}

function maxConcurrent(channel: GuardrailChannel) {
  return channel === 'api' ? 3 : 2
}

function windowLimit(channel: GuardrailChannel) {
  return channel === 'api' ? 30 : 8
}

function concurrencyKey(input: AcquireInput) {
  return `hireproof:live-audit:concurrent:${input.channel}:${input.identifier}`
}

async function releaseLocal(key: string) {
  const current = localConcurrency.get(key) || 0
  if (current <= 1) localConcurrency.delete(key)
  else localConcurrency.set(key, current - 1)
}

export function buildOperationalEvidence(status: OperationalStatus) {
  return {
    source: 'HireProof Operations',
    type: status.status === 'circuit-open' ? 'Live Search Guardrail' : 'Audit Guardrail',
    snippet: status.message || 'HireProof adjusted live evidence collection to protect reliability and quota.',
  }
}

export async function acquireLiveAuditGuardrail(input: AcquireInput): Promise<GuardrailResult> {
  const noop = async () => {}
  if (!input.live) {
    return {
      allowed: true,
      status: { status: 'not-live', message: 'Demo or non-live audit; expensive live-search guardrails were not needed.' },
      release: noop,
    }
  }

  const rateLimit = await checkRateLimit(`live-audit:${input.channel}:${input.identifier}`, {
    limit: windowLimit(input.channel),
    windowMs: 10 * 60 * 1000,
  })
  if (!rateLimit.success) {
    const retryAfterSec = 'retryAfterMs' in rateLimit ? Math.ceil((rateLimit.retryAfterMs as number) / 1000) : 60
    return {
      allowed: false,
      retryAfterSec,
      status: {
        status: 'throttled',
        retryAfterSec,
        message: `Live audit protection is active because this ${input.channel === 'api' ? 'API key' : 'browser'} has started many expensive audits. Try again after the retry window.`,
      },
      release: noop,
    }
  }

  const key = concurrencyKey(input)
  const redis = getRedis()
  if (redis) {
    try {
      const count = await redis.incr(key)
      await redis.expire(key, 90)
      if (count > maxConcurrent(input.channel)) {
        await redis.decr(key)
        return {
          allowed: false,
          retryAfterSec: 30,
          status: {
            status: 'throttled',
            retryAfterSec: 30,
            message: 'Live audit protection is active because your expensive investigations are already busy. Please try again shortly.',
          },
          release: noop,
        }
      }
      return {
        allowed: true,
        status: { status: 'ok', message: 'Live audit guardrails passed.' },
        release: async () => {
          try {
            await redis.decr(key)
          } catch {
            await releaseLocal(key)
          }
        },
      }
    } catch {
      // fall through to local protection
    }
  }

  const current = localConcurrency.get(key) || 0
  if (current >= maxConcurrent(input.channel)) {
    return {
      allowed: false,
      retryAfterSec: 30,
      status: {
        status: 'throttled',
        retryAfterSec: 30,
        message: 'Live audit protection is active because your expensive investigations are already busy. Please try again shortly.',
      },
      release: noop,
    }
  }

  localConcurrency.set(key, current + 1)
  return {
    allowed: true,
    status: { status: 'ok', message: 'Live audit guardrails passed.' },
    release: () => releaseLocal(key),
  }
}

export function clearLiveAuditGuardrailsForTests() {
  localConcurrency.clear()
}
