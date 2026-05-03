import { mkdir, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

function historyHome(options = {}) {
  return options.configHome || process.env.HIREPROOF_CONFIG_HOME || path.join(os.homedir(), '.hireproof')
}

export function reportHistoryPath(options = {}) {
  return path.join(historyHome(options), 'reports.jsonl')
}

function compactList(values, limit = 5) {
  return Array.isArray(values) ? values.slice(0, limit).map(value => String(value)) : []
}

export function toReportSummary(report) {
  return {
    id: report?.id || `report_${Date.now()}`,
    savedAt: new Date().toISOString(),
    verdict: report?.verdict || 'unknown',
    riskScore: Number(report?.riskScore ?? 0),
    confidence: report?.confidence || 'unknown',
    mode: report?.mode || 'unknown',
    summary: report?.summary || '',
    company: report?.extractedClaims?.company || 'Not specified',
    role: report?.extractedClaims?.role || 'Not specified',
    redFlags: compactList(report?.redFlags, 5),
    greenFlags: compactList(report?.greenFlags, 5),
    nextSteps: compactList(report?.nextSteps, 5),
    evidence: compactList(report?.evidence?.map(item => item?.snippet || item?.source || item?.type), 3),
  }
}

export async function saveReportSummary(report, options = {}) {
  const file = reportHistoryPath(options)
  await mkdir(path.dirname(file), { recursive: true })
  const summary = toReportSummary(report)
  await writeFile(file, `${JSON.stringify(summary)}\n`, { flag: 'a' })
  return summary
}

export async function readReportSummaries(options = {}) {
  try {
    const raw = await readFile(reportHistoryPath(options), 'utf8')
    return raw
      .split(/\r?\n/)
      .filter(Boolean)
      .map(line => JSON.parse(line))
      .reverse()
  } catch {
    return []
  }
}
