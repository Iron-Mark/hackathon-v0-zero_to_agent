import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createPilotRequest, getUserFromSessionToken, listPilotRequests, recordProductEvent, updatePilotRequestStatus } from '@/lib/auth-store'
import { validateMutationOrigin } from '@/lib/request-security'

async function requireUser() {
  const cookieStore = await cookies()
  return getUserFromSessionToken(cookieStore.get('hireproof_session')?.value)
}

export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  return NextResponse.json({ requests: await listPilotRequests() })
}

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request)
  if (originError) return originError

  try {
    const body = await request.json().catch(() => ({}))
    const record = await createPilotRequest({
      name: body.name,
      email: body.email,
      organization: body.organization,
      pilotType: body.pilotType,
      workflow: body.workflow,
      sourcePath: body.sourcePath || '/pilot',
    })
    await recordProductEvent({
      eventName: 'pilot_request_submitted',
      path: '/pilot',
      metadata: {
        pilotType: record.pilotType,
        hasOrganization: record.organization ? 'yes' : 'no',
      },
    }).catch(() => null)
    return NextResponse.json({ request: record }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save pilot request.' }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  const originError = validateMutationOrigin(request)
  if (originError) return originError

  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  try {
    const body = await request.json().catch(() => ({}))
    const updated = await updatePilotRequestStatus(body.id, body.status)
    await recordProductEvent({
      eventName: 'pilot_request_status_updated',
      path: '/pilot/admin',
      metadata: { status: updated.status },
    }).catch(() => null)
    return NextResponse.json({ request: updated })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not update pilot request.' }, { status: 400 })
  }
}
