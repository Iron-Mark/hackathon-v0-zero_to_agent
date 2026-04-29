import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { provider, key } = await req.json()

    if (!key) {
      return NextResponse.json({ valid: false, error: 'No key provided' }, { status: 400 })
    }

    if (provider === 'openai') {
      // Minimal test call to OpenAI
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`
        }
      })
      
      if (res.ok) {
        return NextResponse.json({ valid: true })
      } else {
        const json = await res.json()
        return NextResponse.json({ valid: false, error: json.error?.message || 'Invalid OpenAI key' }, { status: 401 })
      }
    }

    if (provider === 'serp') {
      // Minimal test call to SerpApi
      const res = await fetch(`https://serpapi.com/search.json?engine=google&q=test&api_key=${key}`)
      
      if (res.ok) {
        return NextResponse.json({ valid: true })
      } else {
        const json = await res.json()
        return NextResponse.json({ valid: false, error: json.error || 'Invalid SerpApi key' }, { status: 401 })
      }
    }

    return NextResponse.json({ valid: false, error: 'Invalid provider' }, { status: 400 })
  } catch (error) {
    console.error('[VerifyInfrastructure] Error:', error)
    return NextResponse.json({ valid: false, error: 'Internal server error during verification' }, { status: 500 })
  }
}
