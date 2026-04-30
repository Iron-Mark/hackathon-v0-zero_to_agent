import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  getUserFromSessionToken,
  listProviderCredentials,
  revokeProviderCredential,
  saveProviderCredential,
} from '@/lib/auth-store'
import { normalizeProviderInput, verifyProviderCredential } from '@/lib/provider-verification'

async function requireUser() {
  const cookieStore = await cookies()
  return getUserFromSessionToken(cookieStore.get('hireproof_session')?.value)
}

export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  return NextResponse.json({
    credentials: await listProviderCredentials(user.id),
  })
}

export async function PATCH(request: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const provider = normalizeProviderInput(body.provider)
  const key = typeof body.key === 'string' ? body.key : ''
  if (!provider) return NextResponse.json({ error: 'Unsupported provider.' }, { status: 400 })
  if (!key.trim()) return NextResponse.json({ error: 'Provider key is required.' }, { status: 400 })

  try {
    const verification = await verifyProviderCredential(provider, key)
    if (!verification.valid) {
      return NextResponse.json({ error: verification.error || 'Provider key could not be verified.' }, { status: 401 })
    }

    const credential = await saveProviderCredential(user.id, provider, key)
    return NextResponse.json({ credential })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save provider credential.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const provider = normalizeProviderInput(searchParams.get('provider'))
  if (!provider) return NextResponse.json({ error: 'Unsupported provider.' }, { status: 400 })

  return NextResponse.json({ revoked: await revokeProviderCredential(user.id, provider) })
}
