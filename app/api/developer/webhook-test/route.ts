import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserFromSessionToken } from '@/lib/auth-store'

export async function POST(request: Request) {
  // 1. Authenticate (optional strict check, but good practice for developer portals)
  const cookieStore = await cookies()
  const user = await getUserFromSessionToken(cookieStore.get('hireproof_session')?.value)
  
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing webhook URL.' }, { status: 400 })
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid webhook URL format.' }, { status: 400 })
    }

    // SSRF Protection: 1. Scheme Validation
    if (parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Webhooks must use the https:// protocol.' }, { status: 400 })
    }

    // SSRF Protection: 2. Hostname Blacklisting
    const hostname = parsedUrl.hostname.toLowerCase()
    
    // Check for explicit local/private hostnames
    if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return NextResponse.json({ error: 'Local network destinations are strictly prohibited.' }, { status: 400 })
    }

    // Check for IP-based SSRF (Metadata, Loopback, Private IPs)
    const blockedIPRanges = [
      /^127\./,                            // Loopback (127.x.x.x)
      /^10\./,                             // Private Class A (10.x.x.x)
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,    // Private Class B (172.16.x.x - 172.31.x.x)
      /^192\.168\./,                       // Private Class C (192.168.x.x)
      /^169\.254\./,                       // AWS/GCP/Azure Metadata service (169.254.x.x)
      /^0\./,                              // 0.x.x.x
      /^::1$/,                             // IPv6 Loopback
      /^\[::1\]$/                          // IPv6 Loopback (Bracketed)
    ]

    for (const regex of blockedIPRanges) {
      if (regex.test(hostname)) {
        return NextResponse.json({ error: 'Prohibited IP address detected in webhook destination.' }, { status: 400 })
      }
    }

    // 2. Generate a mock payload matching the HireProof shape
    const mockPayload = {
      event: 'audit.completed',
      id: `evt_test_${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date().toISOString(),
      data: {
        auditId: `hp_test_${Math.random().toString(36).slice(2, 11)}`,
        verdict: 'high-risk',
        riskScore: 92,
        extractedClaims: {
          company: 'Test Company Inc.',
          role: 'Remote Testing Engineer',
          salary: '$100k/year',
          location: 'Remote',
        },
        summary: 'This is a test webhook payload sent from the HireProof Developer Sandbox.',
      }
    }

    // 3. Dispatch the webhook
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HireProof-Webhook-Sandbox/1.0',
        'X-HireProof-Event': 'audit.completed',
      },
      body: JSON.stringify(mockPayload),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json(
        { error: `Webhook receiver returned status ${response.status}` },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true, status: response.status })

  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Webhook request timed out after 8 seconds.' }, { status: 504 })
    }
    return NextResponse.json({ error: `Failed to dispatch webhook: ${error.message}` }, { status: 500 })
  }
}
