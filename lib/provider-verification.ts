import type { ProviderCredentialKind } from './auth-store'

export async function verifyProviderCredential(provider: ProviderCredentialKind, key: string) {
  const secret = key.trim()
  if (!secret) return { valid: false, error: 'No key provided.' }

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(10_000),
    })

    if (res.ok) return { valid: true }
    const json = await res.json().catch(() => ({}))
    return { valid: false, error: json.error?.message || 'Invalid OpenAI-compatible key.' }
  }

  const url = new URL('https://serpapi.com/search.json')
  url.searchParams.set('engine', 'google')
  url.searchParams.set('q', 'hireproof test')
  url.searchParams.set('api_key', secret)

  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
  if (res.ok) return { valid: true }
  const json = await res.json().catch(() => ({}))
  return { valid: false, error: json.error || 'Invalid SerpApi key.' }
}

export function normalizeProviderInput(provider: unknown): ProviderCredentialKind | null {
  if (provider === 'openai') return 'openai'
  if (provider === 'serpapi' || provider === 'serp') return 'serpapi'
  return null
}
