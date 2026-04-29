import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserFromSessionToken, issueApiKey, listApiKeys } from '@/lib/auth-store'

async function requireUser() {
  const cookieStore = await cookies()
  return getUserFromSessionToken(cookieStore.get('hireproof_session')?.value)
}

export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  return NextResponse.json({ keys: await listApiKeys(user.id) })
}

export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const { rawKey, record } = await issueApiKey(user.id, String(body.name || 'Production API Key'))
  return NextResponse.json({ rawKey, key: record }, { status: 201 })
}
