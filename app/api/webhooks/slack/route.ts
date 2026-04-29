import { after } from 'next/server'
import { handleSlackWebhook, getSlackCredentialStatus } from '@/lib/hireproof-bot'

export const runtime = 'nodejs'

const waitUntil = (task: Promise<unknown>) => after(() => task)

export async function GET() {
  return Response.json({
    status: 'ChatSDK Agents Slack webhook',
    endpoint: '/api/webhooks/slack',
    credentialStatus: getSlackCredentialStatus(),
  })
}

export async function POST(request: Request) {
  return handleSlackWebhook(request, { waitUntil })
}
