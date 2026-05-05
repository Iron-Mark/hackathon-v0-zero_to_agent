import { NextResponse } from 'next/server'

function parseOrigin(value: string | null) {
  if (!value) return null

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function allowedMutationOrigins(request: Request) {
  const origins = new Set<string>([new URL(request.url).origin])
  const appBaseOrigin = parseOrigin(process.env.APP_BASE_URL || null)
  if (appBaseOrigin) origins.add(appBaseOrigin)
  return origins
}

export function validateMutationOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const sourceOrigin = parseOrigin(origin) || parseOrigin(referer)

  if (!sourceOrigin || !allowedMutationOrigins(request).has(sourceOrigin)) {
    return NextResponse.json({ error: 'CSRF validation failed.' }, { status: 403 })
  }

  return null
}

export function requestIp(request: Request) {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  return request.headers.get('x-real-ip') || (xForwardedFor ? xForwardedFor.split(',')[0].trim() : '127.0.0.1')
}
