import { Chat, type Adapter, type Thread, type Message, type WebhookOptions } from 'chat'
import { createDiscordAdapter } from '@chat-adapter/discord'
import { createSlackAdapter } from '@chat-adapter/slack'
import { createRedisState } from '@chat-adapter/state-redis'
import { createTelegramAdapter } from '@chat-adapter/telegram'
import { createZernioAdapter } from '@zernio/chat-sdk-adapter'
import { DEMO_FIXTURES } from '@/lib/fixtures'
import { formatChatVerdict } from '@/lib/chat-verdict'
import { saveReport } from '@/lib/db'
import type { AuditReport } from '@/lib/schemas'

export type ChatPlatform = 'slack' | 'discord' | 'telegram' | 'whatsapp' | 'local'
type WebhookPlatform = 'slack' | 'discord' | 'telegram' | 'zernio'

type HireProofBot = Chat<Record<string, Adapter>>

const CHAT_TEXT_LIMIT = 10_000
const requiredEnvironmentByPlatform: Record<WebhookPlatform, string[]> = {
  slack: ['SLACK_BOT_TOKEN', 'SLACK_SIGNING_SECRET', 'REDIS_URL'],
  discord: ['DISCORD_BOT_TOKEN', 'DISCORD_PUBLIC_KEY', 'DISCORD_APPLICATION_ID', 'REDIS_URL'],
  telegram: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_WEBHOOK_SECRET_TOKEN', 'TELEGRAM_BOT_USERNAME', 'REDIS_URL'],
  zernio: ['ZERNIO_API_KEY', 'ZERNIO_WEBHOOK_SECRET', 'REDIS_URL'],
}
const chatPlatformByWebhookPlatform: Record<WebhookPlatform, Exclude<ChatPlatform, 'local'>> = {
  slack: 'slack',
  discord: 'discord',
  telegram: 'telegram',
  zernio: 'whatsapp',
}

let bot: HireProofBot | null = null
let botFingerprint: string | null = null

function present(value?: string) {
  return Boolean(value?.trim())
}

function hasChatState() {
  return Boolean(process.env.REDIS_URL?.trim())
}

function getRedisUrl() {
  return process.env.REDIS_URL!.trim()
}

function hasSlackCredentials() {
  return present(process.env.SLACK_BOT_TOKEN) && present(process.env.SLACK_SIGNING_SECRET) && hasChatState()
}

function hasDiscordCredentials() {
  return present(process.env.DISCORD_BOT_TOKEN) && present(process.env.DISCORD_PUBLIC_KEY) && present(process.env.DISCORD_APPLICATION_ID) && hasChatState()
}

function hasTelegramCredentials() {
  return present(process.env.TELEGRAM_BOT_TOKEN) && present(process.env.TELEGRAM_WEBHOOK_SECRET_TOKEN) && present(process.env.TELEGRAM_BOT_USERNAME) && hasChatState()
}

function hasWhatsAppCredentials() {
  return present(process.env.ZERNIO_API_KEY) && present(process.env.ZERNIO_WEBHOOK_SECRET) && hasChatState()
}

function pickFixture(text: string) {
  const lower = text.toLowerCase()
  if (lower.includes('telegram') || lower.includes('80000') || lower.includes('80,000')) return DEMO_FIXTURES.highRisk
  if (lower.includes('unclear') || lower.includes('maybe') || lower.includes('caution')) return DEMO_FIXTURES.caution
  return DEMO_FIXTURES.safe
}

function normalizeChatText(text: string) {
  return text.trim().slice(0, CHAT_TEXT_LIMIT)
}

export function getSlackCredentialStatus() {
  return {
    botToken: present(process.env.SLACK_BOT_TOKEN),
    signingSecret: present(process.env.SLACK_SIGNING_SECRET),
    redis: hasChatState(),
    ready: hasSlackCredentials(),
  }
}

export function getDiscordCredentialStatus() {
  return {
    botToken: present(process.env.DISCORD_BOT_TOKEN),
    publicKey: present(process.env.DISCORD_PUBLIC_KEY),
    applicationId: present(process.env.DISCORD_APPLICATION_ID),
    redis: hasChatState(),
    ready: hasDiscordCredentials(),
  }
}

export function getTelegramCredentialStatus() {
  return {
    botToken: present(process.env.TELEGRAM_BOT_TOKEN),
    webhookSecretToken: present(process.env.TELEGRAM_WEBHOOK_SECRET_TOKEN),
    botUsername: present(process.env.TELEGRAM_BOT_USERNAME),
    redis: hasChatState(),
    ready: hasTelegramCredentials(),
  }
}

export function getWhatsAppCredentialStatus() {
  return {
    apiKey: present(process.env.ZERNIO_API_KEY),
    webhookSecret: present(process.env.ZERNIO_WEBHOOK_SECRET),
    redis: hasChatState(),
    ready: hasWhatsAppCredentials(),
  }
}

export function getChatCredentialStatus() {
  return {
    slack: getSlackCredentialStatus(),
    discord: getDiscordCredentialStatus(),
    telegram: getTelegramCredentialStatus(),
    whatsapp: getWhatsAppCredentialStatus(),
  }
}

function getChatConfigFingerprint() {
  return JSON.stringify({
    redis: process.env.REDIS_URL?.trim() || '',
    slack: hasSlackCredentials(),
    discord: hasDiscordCredentials(),
    telegram: hasTelegramCredentials(),
    whatsapp: hasWhatsAppCredentials(),
  })
}

function createCredentialGateResponse(platform: WebhookPlatform) {
  const chatPlatform = chatPlatformByWebhookPlatform[platform]

  return Response.json({
    error: `${platform === 'zernio' ? 'WhatsApp/Zernio' : platform} ChatSDK credentials are not configured.`,
    platform: chatPlatform,
    required: requiredEnvironmentByPlatform[platform],
    credentialStatus: getChatCredentialStatus()[chatPlatform],
  }, { status: 503 })
}

export async function createChatReply(text: string, baseUrl: string, platform: ChatPlatform = 'local', metadata?: {
  threadId?: string
  channelId?: string
}) {
  const now = Date.now()
  const safeText = normalizeChatText(text)
  const report: AuditReport = {
    ...pickFixture(safeText),
    id: `chat_${now}`,
    timestamp: new Date(now).toISOString(),
    source: 'chat' as const,
    mode: 'demo' as const,
    chatPlatform: platform,
    chatThreadId: metadata?.threadId,
    chatChannelId: metadata?.channelId,
  }

  try {
    await saveReport(report)
  } catch (error) {
    console.error('[ChatSDK] Report persistence failed:', error instanceof Error ? error.message : 'Unknown persistence error')
  }
  const verdict = formatChatVerdict(report, baseUrl)

  return { report, verdict }
}

async function replyToThread(thread: Thread, message: Message, platform: ChatPlatform) {
  const text = normalizeChatText(message.text || '')
  if (!text) return

  const baseUrl = process.env.APP_BASE_URL || ''
  const { verdict } = await createChatReply(text, baseUrl, platform, {
    threadId: thread.id,
    channelId: thread.channelId,
  })
  await thread.post(verdict.text)
}

function platformFromThreadId(threadId: string): ChatPlatform {
  if (threadId.startsWith('discord:')) return 'discord'
  if (threadId.startsWith('telegram:')) return 'telegram'
  if (threadId.startsWith('zernio:')) return 'whatsapp'
  if (threadId.startsWith('slack:')) return 'slack'
  return 'local'
}

function getAdapters() {
  const adapters: Record<string, Adapter> = {}

  if (hasSlackCredentials()) {
    adapters.slack = createSlackAdapter({
      botToken: process.env.SLACK_BOT_TOKEN!.trim(),
      signingSecret: process.env.SLACK_SIGNING_SECRET!.trim(),
      userName: 'hireproof',
    })
  }

  if (hasDiscordCredentials()) {
    adapters.discord = createDiscordAdapter({
      botToken: process.env.DISCORD_BOT_TOKEN!.trim(),
      publicKey: process.env.DISCORD_PUBLIC_KEY!.trim(),
      applicationId: process.env.DISCORD_APPLICATION_ID!.trim(),
      userName: 'hireproof',
    })
  }

  if (hasTelegramCredentials()) {
    adapters.telegram = createTelegramAdapter({
      botToken: process.env.TELEGRAM_BOT_TOKEN!.trim(),
      secretToken: process.env.TELEGRAM_WEBHOOK_SECRET_TOKEN!.trim(),
      userName: process.env.TELEGRAM_BOT_USERNAME!.trim(),
      mode: 'webhook',
    })
  }

  if (hasWhatsAppCredentials()) {
    adapters.zernio = createZernioAdapter({
      apiKey: process.env.ZERNIO_API_KEY!.trim(),
      webhookSecret: process.env.ZERNIO_WEBHOOK_SECRET!.trim(),
      botName: process.env.ZERNIO_BOT_NAME?.trim() || 'HireProof',
    })
  }

  return adapters
}

export function getHireProofBot() {
  const fingerprint = getChatConfigFingerprint()
  if (bot && botFingerprint === fingerprint) return bot
  bot = null
  botFingerprint = fingerprint

  if (!hasChatState()) return null

  const adapters = getAdapters()
  if (Object.keys(adapters).length === 0) return null

  bot = new Chat({
    userName: 'hireproof',
    adapters,
    state: createRedisState({
      url: getRedisUrl(),
      keyPrefix: 'hireproof:chat-sdk',
    }),
    dedupeTtlMs: 600_000,
  })

  bot.onNewMention(async (thread, message) => {
    await thread.subscribe()
    await replyToThread(thread, message, platformFromThreadId(thread.id))
  })

  bot.onDirectMessage(async (thread, message) => {
    await thread.subscribe()
    await replyToThread(thread, message, platformFromThreadId(thread.id))
  })

  bot.onSubscribedMessage(async (thread, message) => {
    await replyToThread(thread, message, platformFromThreadId(thread.id))
  })

  return bot
}

async function handlePlatformWebhook(platform: WebhookPlatform, request: Request, options?: WebhookOptions) {
  const chat = getHireProofBot()

  if (!chat || !chat.webhooks[platform]) {
    return createCredentialGateResponse(platform)
  }

  return chat.webhooks[platform](request, options)
}

export async function handleSlackWebhook(request: Request, options?: WebhookOptions) {
  return handlePlatformWebhook('slack', request, options)
}

export async function handleDiscordWebhook(request: Request, options?: WebhookOptions) {
  return handlePlatformWebhook('discord', request, options)
}

export async function handleTelegramWebhook(request: Request, options?: WebhookOptions) {
  return handlePlatformWebhook('telegram', request, options)
}

export async function handleZernioWebhook(request: Request, options?: WebhookOptions) {
  return handlePlatformWebhook('zernio', request, options)
}
