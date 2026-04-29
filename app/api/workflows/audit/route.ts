import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({
    status: 'WDK-ready: durable workflow handoff shape for async job-post investigations.',
    usage: {
      method: 'POST',
      body: {
        text: 'Suspicious job post text',
        webhook_url: 'https://example.com/hireproof-callback',
      },
    },
  })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const text = typeof body.text === 'string' ? body.text.trim() : ''

  if (!text) {
    return NextResponse.json({ error: 'Missing text for workflow investigation.' }, { status: 400 })
  }

  const workflowId = `wf_${Date.now().toString(36)}`
  const baseUrl = process.env.APP_BASE_URL || new URL(request.url).origin

  return NextResponse.json({
    status: 'accepted',
    track: 'WDK-ready',
    workflowId,
    message: 'Workflow request accepted. This route documents the durable workflow handoff shape; wire a Vercel WDK runner here before claiming full WDK execution.',
    durableWorkflow: {
      intendedRunner: 'Vercel Workflow / WDK',
      sourceEndpoint: '/api/workflows/audit',
      existingAsyncFallback: '/api/v1/audit with webhook_url',
      callbackUrl: body.webhook_url || null,
      reportBaseUrl: `${baseUrl.replace(/\/$/, '')}/audit/[id]`,
    },
  }, { status: 202 })
}
