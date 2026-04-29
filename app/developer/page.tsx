'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Copy, Key, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { showToast } from '@/components/toast'

type User = { id: string; email: string; name: string }
type ApiKey = { id: string; name: string; lastFour: string; createdAt: string; lastUsedAt: string | null }
type Usage = { totalRequests: number; successfulRequests: number; failedRequests: number; recent: Array<{ id: string; endpoint: string; status: number; createdAt: string }> }

export default function DeveloperPortal() {
  const [user, setUser] = useState<User | null>(null)
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [newKey, setNewKey] = useState<string | null>(null)

  async function load() {
    const me = await fetch('/api/auth/me').then((res) => res.json())
    setUser(me.user)
    if (me.user) {
      const [keyRes, usageRes] = await Promise.all([
        fetch('/api/developer/keys').then((res) => res.json()),
        fetch('/api/developer/usage').then((res) => res.json()),
      ])
      setKeys(keyRes.keys || [])
      setUsage(usageRes)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function submitAuth() {
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    const json = await res.json()
    if (!res.ok) {
      showToast(json.error || 'Authentication failed.', 'info')
      return
    }
    setEmail('')
    setPassword('')
    await load()
  }

  async function createKey() {
    const res = await fetch('/api/developer/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Production API Key' }),
    })
    const json = await res.json()
    if (!res.ok) return showToast(json.error || 'Could not create key.', 'info')
    setNewKey(json.rawKey)
    await load()
  }

  async function revokeKey(id: string) {
    await fetch(`/api/developer/keys/${id}`, { method: 'DELETE' })
    await load()
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value)
    showToast('Copied to clipboard.', 'success')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-md px-4 py-16">
          <div className="rounded-2xl border border-border-soft bg-surface p-6 shadow-sm">
            <h1 className="text-3xl font-black">Developer Portal</h1>
            <p className="mt-2 text-sm font-semibold text-muted">Sign in to manage real HireProof API keys.</p>
            <div className="mt-6 space-y-3">
              {mode === 'register' && (
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-xl border border-border bg-background p-3 text-sm font-semibold" />
              )}
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-border bg-background p-3 text-sm font-semibold" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-xl border border-border bg-background p-3 text-sm font-semibold" />
              <button onClick={submitAuth} className="hireproof-focus w-full rounded-xl bg-foreground px-4 py-3 text-sm font-black text-background hover:bg-safe">
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
              <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="w-full text-sm font-bold text-muted hover:text-foreground">
                {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-safe/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-safe">
              <ShieldCheck className="h-3 w-3" /> Authenticated
            </div>
            <h1 className="text-4xl font-black">Developer Portal</h1>
            <p className="mt-2 text-sm font-semibold text-muted">Signed in as {user.email}. Keys created here authenticate `/api/v1/audit` and `/api/mcp`.</p>
          </div>
          <button onClick={createKey} className="hireproof-focus inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 font-black text-background hover:bg-safe">
            <Plus className="h-4 w-4" /> Create API key
          </button>
        </div>

        {newKey && (
          <div className="mb-8 rounded-2xl border border-safe/30 bg-safe/5 p-5">
            <p className="text-sm font-black text-safe">Copy this key now. It will not be shown again.</p>
            <div className="mt-3 flex gap-2 rounded-xl bg-background p-3 font-mono text-sm">
              <span className="min-w-0 flex-1 truncate">{newKey}</span>
              <button onClick={() => copy(newKey)} className="text-safe"><Copy className="h-4 w-4" /></button>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-border-soft bg-surface p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-black"><Key className="h-5 w-5 text-safe" /> API Keys</h2>
            <div className="space-y-3">
              {keys.length === 0 ? (
                <p className="rounded-xl border border-border-soft bg-background p-5 text-sm font-semibold text-muted">No keys yet.</p>
              ) : keys.map((key) => (
                <div key={key.id} className="flex items-center justify-between gap-4 rounded-xl border border-border-soft bg-background p-4">
                  <div>
                    <p className="font-black">{key.name}</p>
                    <p className="text-xs font-semibold text-muted">•••• {key.lastFour} · created {new Date(key.createdAt).toLocaleDateString()} · last used {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'never'}</p>
                  </div>
                  <button onClick={() => revokeKey(key.id)} className="rounded-lg p-2 text-muted hover:bg-risk-bg hover:text-risk-text" title="Revoke key">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border-soft bg-surface p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-muted">Usage</h2>
              <div className="text-3xl font-black">{usage?.totalRequests ?? 0}</div>
              <p className="text-xs font-bold text-muted">Total authenticated requests</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-bold">
                <div className="rounded-xl bg-safe/10 p-3 text-safe">{usage?.successfulRequests ?? 0} successful</div>
                <div className="rounded-xl bg-risk-bg p-3 text-risk-text">{usage?.failedRequests ?? 0} failed</div>
              </div>
            </div>
            <Link href="/docs/api-reference" className="block rounded-2xl border border-border-soft bg-surface p-6 text-sm font-black hover:border-safe">
              View API reference →
            </Link>
          </aside>
        </div>
      </main>
    </div>
  )
}
