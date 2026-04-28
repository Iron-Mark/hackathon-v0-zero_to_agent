import fs from 'fs/promises'
import path from 'path'
import { AuditReport } from './schemas'

const dataDir = path.join(process.cwd(), 'data')
const dbFile = path.join(dataDir, 'reports.json')

export async function saveReport(report: AuditReport) {
  try {
    await fs.mkdir(dataDir, { recursive: true })
    let reports: Record<string, AuditReport> = {}
    try {
      const data = await fs.readFile(dbFile, 'utf-8')
      reports = JSON.parse(data)
    } catch (e) {
      // file doesn't exist yet
    }
    if (!report.id) report.id = `report_${Date.now()}`
    reports[report.id] = report
    await fs.writeFile(dbFile, JSON.stringify(reports, null, 2))
  } catch (e) {
    console.error('Failed to save report to db:', e)
  }
}

export async function getReport(id: string): Promise<AuditReport | null> {
  try {
    const data = await fs.readFile(dbFile, 'utf-8')
    const reports = JSON.parse(data)
    return reports[id] || null
  } catch (e) {
    return null
  }
}
