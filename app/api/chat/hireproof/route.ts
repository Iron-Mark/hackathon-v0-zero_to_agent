import { NextResponse } from 'next/server'
import { DEMO_FIXTURES } from '@/lib/fixtures'
import { formatChatVerdict } from '@/lib/chat-verdict'
import { saveReport } from '@/lib/db'
import type { AuditReport } from '@/lib/schemas'

export const runtime = 'nodejs'

function pickFixture(text: string) {
  const lower = text.toLowerCase()
  if (lower.includes('telegram') || lower.includes('80000') || lower.includes('80,000')) return DEMO_FIXTURES.highRisk
  if (lower.includes('unclear') || lower.includes('maybe') || lower.includes('caution')) return DEMO_FIXTURES.caution
  return DEMO_FIXTURES.safe
}

export async function GET() {
  return NextResponse.json({
    status: 'ChatSDK-ready: local chat verdict format, not a platform webhook adapter.',
    usage: {
      method: 'POST',
      body: { text: 'Suspicious job post text', platform: 'slack', channel: 'demo' },
    },
  })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const text = typeof body.text === 'string' ? body.text : ''

  if (!text.trim()) {
    return NextResponse.json({ error: 'Missing text for chat verification.' }, { status: 400 })
  }

  const now = Date.now()
  const report: AuditReport = {
    ...pickFixture(text),
    id: `chat_${now}`,
    timestamp: new Date(now).toISOString(),
    source: 'api' as const,
    mode: 'demo' as const,
  }

  const baseUrl = process.env.APP_BASE_URL || new URL(request.url).origin
  await saveReport(report)
  const verdict = formatChatVerdict(report, baseUrl)

  return NextResponse.json({
    status: verdict.status,
    platform: body.platform || 'local',
    channel: body.channel || null,
    reply: verdict.text,
    reportUrl: verdict.reportUrl,
    report,
  })
}
