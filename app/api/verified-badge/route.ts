import { NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/auth-store'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const key = String(body.key || '')
  const domain = String(body.domain || '')
  const auth = key ? await authenticateApiKey(key) : null

  return NextResponse.json({
    verified: Boolean(auth && domain),
    domain,
    account: auth?.user?.name || auth?.ownerId || null,
    checkedAt: new Date().toISOString(),
  })
}
