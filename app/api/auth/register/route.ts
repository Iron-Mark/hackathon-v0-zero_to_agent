import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createUser, makeSessionToken } from '@/lib/auth-store'
import { checkRateLimit } from '@/lib/rate-limit'
import { requestIp, validateMutationOrigin } from '@/lib/request-security'

async function validateRegisterRateLimit(request: Request, email: string) {
  const normalizedEmail = email.trim().toLowerCase() || 'unknown'
  const result = await checkRateLimit(`auth_register:${requestIp(request)}:${normalizedEmail}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  })

  if (result.success) return null

  const retryAfter = 'retryAfterMs' in result ? Math.ceil((result as any).retryAfterMs / 1000) : 900
  return NextResponse.json(
    { error: 'Too many registration attempts. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  )
}

export async function POST(request: Request) {
  const csrfError = validateMutationOrigin(request)
  if (csrfError) return csrfError

  try {
    const body = await request.json().catch(() => ({}))
    const email = String(body.email || '')
    const rateLimitError = await validateRegisterRateLimit(request, email)
    if (rateLimitError) return rateLimitError

    const user = await createUser(email, String(body.password || ''), String(body.name || ''))
    const cookieStore = await cookies()
    cookieStore.set('hireproof_session', makeSessionToken(user.id), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return NextResponse.json({ user })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed.'
    if (message === 'An account with this email already exists.') {
      return NextResponse.json({ error: 'Registration could not be completed.' }, { status: 400 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
