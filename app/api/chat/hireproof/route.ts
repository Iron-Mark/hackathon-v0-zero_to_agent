import { NextResponse } from 'next/server'
import { createChatReply, getSlackCredentialStatus } from '@/lib/hireproof-bot'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({
    status: 'ChatSDK Agents local test endpoint with Slack webhook wiring.',
    platformWebhook: '/api/webhooks/slack',
    credentialStatus: getSlackCredentialStatus(),
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

  const baseUrl = process.env.APP_BASE_URL || new URL(request.url).origin
  const { report, verdict } = await createChatReply(text, baseUrl)

  return NextResponse.json({
    status: verdict.status,
    platform: body.platform || 'local',
    channel: body.channel || null,
    reply: verdict.text,
    reportUrl: verdict.reportUrl,
    report,
  })
}
