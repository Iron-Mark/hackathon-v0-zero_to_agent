import { NextResponse } from 'next/server'
import { isSerpApiConfigured } from '@/lib/serpapi'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    storage: process.env.UPSTASH_REDIS_REST_URL ? 'redis' : 'local-json',
    liveSearch: isSerpApiConfigured(),
    model: Boolean(process.env.MODEL_PROVIDER_KEY),
    timestamp: new Date().toISOString(),
  })
}
