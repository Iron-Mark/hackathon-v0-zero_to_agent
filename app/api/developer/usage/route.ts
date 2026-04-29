import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUsageSummary, getUserFromSessionToken } from '@/lib/auth-store'

export async function GET() {
  const cookieStore = await cookies()
  const user = await getUserFromSessionToken(cookieStore.get('hireproof_session')?.value)
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  return NextResponse.json(await getUsageSummary(user.id))
}
