import { NextResponse } from 'next/server'
import { recordProductEvent } from '@/lib/auth-store'
import { validateMutationOrigin } from '@/lib/request-security'

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request)
  if (originError) return originError

  try {
    const body = await request.json().catch(() => ({}))
    await recordProductEvent({
      eventName: body.eventName,
      path: body.path,
      metadata: body.metadata,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not record event.' }, { status: 400 })
  }
}
