import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserFromSessionToken } from '@/lib/auth-store'

export async function GET() {
  const cookieStore = await cookies()
  const user = await getUserFromSessionToken(cookieStore.get('hireproof_session')?.value)
  return NextResponse.json({ user })
}
