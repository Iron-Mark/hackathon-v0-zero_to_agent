import { NextResponse } from 'next/server'
import { isSerpApiConfigured } from '@/lib/serpapi'
import { getModelProviderStatus, hasHireProofModelProvider } from '@/lib/ai-model'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    storage: process.env.UPSTASH_REDIS_REST_URL ? 'redis' : 'local-json',
    liveSearch: isSerpApiConfigured(),
    model: hasHireProofModelProvider(),
    modelProvider: getModelProviderStatus(),
    timestamp: new Date().toISOString(),
  })
}
