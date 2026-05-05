import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateMutationOrigin } from '@/lib/request-security'

export async function POST(request: Request) {
  const csrfError = validateMutationOrigin(request)
  if (csrfError) return csrfError

  const cookieStore = await cookies()
  cookieStore.delete('hireproof_session')
  return NextResponse.json({ ok: true })
}
