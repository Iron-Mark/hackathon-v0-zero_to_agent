import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { AuditReport, AuditReportSchema } from './schemas'
import { Redis } from '@upstash/redis'

const dataDir = path.join(process.cwd(), 'data')
const dbFile = path.join(dataDir, 'reports.json')
const redisIndexKey = 'hireproof:report-index'

// Maximum reports to keep in the JSON file (prevent unbounded growth)
const MAX_REPORTS = 500
// 30 days in seconds for Redis TTL
const REDIS_TTL_SECONDS = 30 * 24 * 60 * 60

// Simple write lock to prevent concurrent write corruption
let writeLock: Promise<void> = Promise.resolve()

let globalRedis: Redis | null = null

function parseRedisIndex(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((id): id is string => typeof id === 'string')
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
    } catch {
      return []
    }
  }
  return []
}

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) return null
  if (!globalRedis) {
    try {
      globalRedis = new Redis({
        url,
        token,
      })
    } catch {
      return null
    }
  }
  return globalRedis
}

export async function saveReport(report: AuditReport) {
  if (!report.id) report.id = `report_${crypto.randomUUID()}`
  
  // Cryptographically guarantee DB structural integrity before write
  const safeReport = AuditReportSchema.parse(report)

  // 1. Enterprise Distributed Storage (Upstash Redis)
  const redis = getRedis()
  if (redis) {
    try {
      // Save directly to Redis with a 30-day TTL to auto-manage storage
      await redis.set(safeReport.id!, JSON.stringify(safeReport), { ex: REDIS_TTL_SECONDS })
      const index = parseRedisIndex(await redis.get(redisIndexKey))
      const nextIndex = [safeReport.id!, ...index.filter((id) => id !== safeReport.id)].slice(0, MAX_REPORTS)
      await redis.set(redisIndexKey, nextIndex)
      return // Successfully saved to Redis, skip local FS
    } catch (e) {
      console.warn("[Database] Upstash save failed, falling back to local FS.", e)
    }
  }

  // 2. Hackathon Local Fallback (Local FS)
  // Queue writes to prevent race conditions
  writeLock = writeLock.then(async () => {
    try {
      await fs.mkdir(dataDir, { recursive: true })
      let reports: Record<string, AuditReport> = Object.create(null)
      try {
        const data = await fs.readFile(dbFile, 'utf-8')
        reports = JSON.parse(data)
        if (typeof reports !== 'object' || reports === null || Array.isArray(reports)) {
          reports = Object.create(null) // Corrupted file, reset
        }
      } catch {
        // file doesn't exist or is corrupted
      }

      // Evict oldest reports if over limit
      const keys = Object.keys(reports)
      if (keys.length >= MAX_REPORTS) {
        const sorted = keys.sort((a, b) => {
          const tA = reports[a]?.timestamp || ''
          const tB = reports[b]?.timestamp || ''
          return tA.localeCompare(tB)
        })
        const toRemove = sorted.slice(0, keys.length - MAX_REPORTS + 1)
        for (const key of toRemove) delete reports[key]
      }

      reports[safeReport.id!] = safeReport

      // Atomic write: write to temp file then rename to prevent partial writes
      const tmpFile = dbFile + '.tmp'
      await fs.writeFile(tmpFile, JSON.stringify(reports, null, 2))
      await fs.rename(tmpFile, dbFile)
    } catch (e) {
      console.error('Failed to save report to db:', e)
    }
  })
  await writeLock
}

export async function listReports(limit = 100): Promise<AuditReport[]> {
  const redis = getRedis()
  if (redis) {
    try {
      const index = parseRedisIndex(await redis.get(redisIndexKey))
      const reports = await Promise.all(index.slice(0, limit).map((id) => getReport(id)))
      return reports.filter((report): report is AuditReport => Boolean(report))
    } catch (e) {
      console.warn("[Database] Upstash list failed, falling back to local FS.", e)
    }
  }

  try {
    const data = await fs.readFile(dbFile, 'utf-8')
    const reports = JSON.parse(data)
    if (typeof reports !== 'object' || reports === null) return []
    return Object.values(reports)
      .map((report) => AuditReportSchema.safeParse(report))
      .filter((parsed) => parsed.success)
      .map((parsed) => parsed.data)
      .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
      .slice(0, limit)
  } catch {
    return []
  }
}

export async function getReportTrends() {
  const reports = (await listReports(500)).filter((report) => report.publiclyListed !== false)
  const verdicts = { safe: 0, caution: 0, 'high-risk': 0 }
  const locations: Record<string, number> = {}
  const roles: Record<string, number> = {}
  const contactMethods: Record<string, number> = {}

  for (const report of reports) {
    verdicts[report.verdict] += 1
    const location = report.extractedClaims.location || 'Unknown'
    const role = report.extractedClaims.role || 'Unknown'
    const contact = report.extractedClaims.contactMethod || 'Unknown'
    locations[location] = (locations[location] || 0) + 1
    roles[role] = (roles[role] || 0) + 1
    contactMethods[contact] = (contactMethods[contact] || 0) + 1
  }

  const topEntries = (items: Record<string, number>) =>
    Object.entries(items)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, count]) => ({ label, count }))

  return {
    totalReports: reports.length,
    verdicts,
    topLocations: topEntries(locations),
    topRoles: topEntries(roles),
    topContactMethods: topEntries(contactMethods),
    recentReports: reports.slice(0, 10),
  }
}

export async function getReport(id: string): Promise<AuditReport | null> {
  if (!id || typeof id !== 'string') return null
  // Guard against path traversal
  if (id.includes('/') || id.includes('\\') || id.includes('..')) return null

  // 1. Enterprise Distributed Storage (Upstash Redis)
  const redis = getRedis()
  if (redis) {
    try {
      const data = await redis.get(id)
      if (data) {
        // Upstash parses valid JSON automatically, or returns string.
        const parsed = typeof data === 'string' ? JSON.parse(data) : data
        return AuditReportSchema.parse(parsed)
      }
      return null
    } catch (e) {
      console.warn("[Database] Upstash fetch failed, falling back to local FS.", e)
    }
  }

  // 2. Hackathon Local Fallback (Local FS)
  try {
    const data = await fs.readFile(dbFile, 'utf-8')
    const reports = JSON.parse(data)
    if (typeof reports !== 'object' || reports === null) return null
    // Ensure we don't return properties from the object prototype
    if (id === '__proto__' || id === 'constructor') return null
    return reports[id] || null
  } catch {
    return null
  }
}
