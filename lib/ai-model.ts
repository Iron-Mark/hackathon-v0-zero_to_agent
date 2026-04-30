import { gateway } from '@ai-sdk/gateway'
import { createOpenAI } from '@ai-sdk/openai'

const openai = createOpenAI({
  apiKey: process.env.MODEL_PROVIDER_KEY || '',
})

export function getModelProviderStatus(modelProviderKey?: string) {
  return {
    aiGateway: Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_AI_GATEWAY_API_KEY),
    openaiCompatible: Boolean(modelProviderKey || process.env.MODEL_PROVIDER_KEY),
    ownerByok: Boolean(modelProviderKey),
    model: process.env.HIREPROOF_MODEL || 'openai/gpt-4o-mini',
  }
}

export function hasHireProofModelProvider(modelProviderKey?: string) {
  const status = getModelProviderStatus(modelProviderKey)
  return status.aiGateway || status.openaiCompatible
}

export function getHireProofModel(modelProviderKey?: string) {
  const { aiGateway, model: modelId } = getModelProviderStatus(modelProviderKey)

  if (aiGateway) {
    return gateway(modelId)
  }

  if (modelProviderKey) {
    return createOpenAI({ apiKey: modelProviderKey })(modelId.replace(/^openai\//, ''))
  }

  return openai(modelId.replace(/^openai\//, ''))
}
