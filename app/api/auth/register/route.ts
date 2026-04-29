import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createUser, makeSessionToken } from '@/lib/auth-store'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const user = await createUser(String(body.email || ''), String(body.password || ''), String(body.name || ''))
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
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Registration failed.' }, { status: 400 })
  }
}
