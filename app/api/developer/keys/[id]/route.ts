import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserFromSessionToken, revokeApiKey } from '@/lib/auth-store'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const user = await getUserFromSessionToken(cookieStore.get('hireproof_session')?.value)
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const { id } = await params
  const revoked = await revokeApiKey(user.id, id)
  return NextResponse.json({ revoked })
}
