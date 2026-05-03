import { NextResponse } from 'next/server'
import { listReports } from '@/lib/db'
import { filterPublicIntelligenceReports } from '@/lib/public-intelligence-reports.mjs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim().toLowerCase() || ''
  const verdict = searchParams.get('verdict') || 'all'
  const reports = filterPublicIntelligenceReports(await listReports(200))

  const filtered = reports.filter((report) => {
    const haystack = [
      report.extractedClaims.company,
      report.extractedClaims.role,
      report.extractedClaims.location,
      report.summary,
    ].join(' ').toLowerCase()
    const queryMatch = !query || haystack.includes(query)
    const verdictMatch = verdict === 'all' || report.verdict === verdict
    return queryMatch && verdictMatch
  })

  return NextResponse.json({
    reports: filtered.slice(0, 50),
    total: filtered.length,
  })
}
