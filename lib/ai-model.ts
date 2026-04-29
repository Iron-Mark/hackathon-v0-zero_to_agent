import { gateway } from '@ai-sdk/gateway'
import { createOpenAI } from '@ai-sdk/openai'

const openai = createOpenAI({
  apiKey: process.env.MODEL_PROVIDER_KEY || '',
})

export function getModelProviderStatus() {
  return {
    aiGateway: Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_AI_GATEWAY_API_KEY),
    openaiCompatible: Boolean(process.env.MODEL_PROVIDER_KEY),
    model: process.env.HIREPROOF_MODEL || 'openai/gpt-4o-mini',
  }
}

export function hasHireProofModelProvider() {
  const status = getModelProviderStatus()
  return status.aiGateway || status.openaiCompatible
}

export function getHireProofModel() {
  const { aiGateway, model: modelId } = getModelProviderStatus()

  if (aiGateway) {
    return gateway(modelId)
  }

  return openai(modelId.replace(/^openai\//, ''))
}
