import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authenticateUser, makeSessionToken } from '@/lib/auth-store'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const user = await authenticateUser(String(body.email || ''), String(body.password || ''))
  if (!user) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })

  const cookieStore = await cookies()
  cookieStore.set('hireproof_session', makeSessionToken(user.id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return NextResponse.json({ user })
}
