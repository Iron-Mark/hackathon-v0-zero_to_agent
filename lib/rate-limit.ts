export interface RateLimiterOptions {
  limit: number
  windowMs: number
}

interface RateLimitRecord {
  count: number
  timestamp: number
}

// In-memory store for Hackathon demo purposes.
// For production on Vercel Edge/Serverless, replace with @upstash/ratelimit and Vercel KV.
const store = new Map<string, RateLimitRecord>()

export function checkRateLimit(identifier: string, options: RateLimiterOptions) {
  const now = Date.now()
  const record = store.get(identifier)

  if (!record) {
    store.set(identifier, { count: 1, timestamp: now })
    return { success: true, remaining: options.limit - 1 }
  }

  // If the window has expired, reset the counter
  if (now - record.timestamp > options.windowMs) {
    store.set(identifier, { count: 1, timestamp: now })
    return { success: true, remaining: options.limit - 1 }
  }

  // If over the limit within the window
  if (record.count >= options.limit) {
    return { success: false, remaining: 0 }
  }

  // Increment
  record.count += 1
  return { success: true, remaining: options.limit - record.count }
}
