import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // 1. Security Headers
  // Prevents the browser from interpreting files as something else than declared by the content type
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Prevents the site from being embedded in an iframe (clickjacking protection)
  // We allow SAMEORIGIN because the site uses internal iframes for the Verified Badge demo
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  
  // Enables XSS protection in older browsers
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy: only send referrer to same-origin
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // 2. Content Security Policy (Basic)
  // Note: For Next.js development and some libraries (like framer-motion/lucide), we need some unsafe-eval/inline.
  // In a real production app, we would use a stricter policy with nonces.
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: https://images.unsplash.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.openai.com https://api.upstash.com https://*.vercel.app",
    "frame-src 'self'",
    "object-src 'none'",
  ].join('; ')
  
  // response.headers.set('Content-Security-Policy', csp)

  return response
}

// Match all routes except static files and api internal calls if needed
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
