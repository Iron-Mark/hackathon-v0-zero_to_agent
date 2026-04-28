import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of suspicious User-Agents or patterns to block
const BLOCKED_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /gobuster/i,
  /dirbuster/i,
  /masscan/i,
  /zgrab/i,
]

export function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') || ''

  // 1. Block known malicious User-Agents
  if (BLOCKED_UA_PATTERNS.some(pattern => pattern.test(ua))) {
    console.warn(`[Security] Blocked request from suspicious User-Agent: ${ua}`)
    return new NextResponse('Access Denied', { status: 403 })
  }

  // 2. Prevent Large Header Attacks
  let headersSize = 0
  request.headers.forEach((value, key) => {
    headersSize += key.length + value.length
  })

  if (headersSize > 16384) { // 16KB limit
    return new NextResponse('Header Too Large', { status: 431 })
  }

  return NextResponse.next()
}

// Only apply middleware to API and main routes
export const config = {
  matcher: ['/api/:path*', '/audit/:path*'],
}
