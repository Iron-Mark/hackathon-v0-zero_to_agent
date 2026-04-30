import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserFromSessionToken } from '@/lib/auth-store'
import { normalizeProviderInput, verifyProviderCredential } from '@/lib/provider-verification'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const user = await getUserFromSessionToken(cookieStore.get('hireproof_session')?.value)
    if (!user) return NextResponse.json({ valid: false, error: 'Authentication required.' }, { status: 401 })

    const { provider, key } = await req.json()
    const normalizedProvider = normalizeProviderInput(provider)

    if (!normalizedProvider) {
      return NextResponse.json({ valid: false, error: 'Invalid provider' }, { status: 400 })
    }

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ valid: false, error: 'No key provided' }, { status: 400 })
    }

    const result = await verifyProviderCredential(normalizedProvider, key)
    return NextResponse.json(result, { status: result.valid ? 200 : 401 })
  } catch (error) {
    console.error('[VerifyInfrastructure] Error:', error)
    return NextResponse.json({ valid: false, error: 'Internal server error during verification' }, { status: 500 })
  }
}
