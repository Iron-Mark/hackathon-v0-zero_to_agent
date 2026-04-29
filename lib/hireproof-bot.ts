import { Chat, type WebhookOptions } from 'chat'
import { createSlackAdapter } from '@chat-adapter/slack'
import { createRedisState } from '@chat-adapter/state-redis'
import { DEMO_FIXTURES } from '@/lib/fixtures'
import { formatChatVerdict } from '@/lib/chat-verdict'
import { saveReport } from '@/lib/db'
import type { AuditReport } from '@/lib/schemas'

type HireProofBot = Chat<{
  slack: ReturnType<typeof createSlackAdapter>
}>

let bot: HireProofBot | null = null

function hasSlackCredentials() {
  return Boolean(process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET && process.env.REDIS_URL)
}

function pickFixture(text: string) {
  const lower = text.toLowerCase()
  if (lower.includes('telegram') || lower.includes('80000') || lower.includes('80,000')) return DEMO_FIXTURES.highRisk
  if (lower.includes('unclear') || lower.includes('maybe') || lower.includes('caution')) return DEMO_FIXTURES.caution
  return DEMO_FIXTURES.safe
}

export function getSlackCredentialStatus() {
  return {
    botToken: Boolean(process.env.SLACK_BOT_TOKEN),
    signingSecret: Boolean(process.env.SLACK_SIGNING_SECRET),
    redis: Boolean(process.env.REDIS_URL),
    ready: hasSlackCredentials(),
  }
}

export async function createChatReply(text: string, baseUrl: string) {
  const now = Date.now()
  const report: AuditReport = {
    ...pickFixture(text),
    id: `chat_${now}`,
    timestamp: new Date(now).toISOString(),
    source: 'api' as const,
    mode: 'demo' as const,
  }

  await saveReport(report)
  const verdict = formatChatVerdict(report, baseUrl)

  return { report, verdict }
}

export function getHireProofBot() {
  if (!hasSlackCredentials()) return null
  if (bot) return bot

  bot = new Chat({
    userName: 'hireproof',
    adapters: {
      slack: createSlackAdapter({
        botToken: process.env.SLACK_BOT_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        userName: 'hireproof',
      }),
    },
    state: createRedisState({
      url: process.env.REDIS_URL!,
      keyPrefix: 'hireproof:chat-sdk',
    }),
    dedupeTtlMs: 600_000,
  })

  bot.onNewMention(async (thread, message) => {
    await thread.subscribe()
    const baseUrl = process.env.APP_BASE_URL || ''
    const { verdict } = await createChatReply(message.text || '', baseUrl)
    await thread.post(verdict.text)
  })

  bot.onSubscribedMessage(async (thread, message) => {
    if (!message.text?.trim()) return
    const baseUrl = process.env.APP_BASE_URL || ''
    const { verdict } = await createChatReply(message.text, baseUrl)
    await thread.post(verdict.text)
  })

  return bot
}

export async function handleSlackWebhook(request: Request, options?: WebhookOptions) {
  const chat = getHireProofBot()

  if (!chat) {
    return Response.json({
      error: 'Slack ChatSDK credentials are not configured.',
      required: ['SLACK_BOT_TOKEN', 'SLACK_SIGNING_SECRET', 'REDIS_URL'],
      credentialStatus: getSlackCredentialStatus(),
    }, { status: 503 })
  }

  return chat.webhooks.slack(request, options)
}
