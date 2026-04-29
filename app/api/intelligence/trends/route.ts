import { NextResponse } from 'next/server'
import { getReportTrends } from '@/lib/db'
import { isSerpApiConfigured, searchNewsReputation } from '@/lib/serpapi'

export async function GET() {
  const trends = await getReportTrends()
  let externalSignals: unknown[] = []

  if (isSerpApiConfigured()) {
    try {
      externalSignals = await searchNewsReputation('recruitment scam job fraud')
    } catch {
      externalSignals = []
    }
  }

  return NextResponse.json({
    ...trends,
    externalSignals,
    mode: isSerpApiConfigured() ? 'hybrid' : 'stored-audits',
  })
}
