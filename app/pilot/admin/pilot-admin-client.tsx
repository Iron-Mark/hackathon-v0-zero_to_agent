'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BarChart3, Download, Filter, LockKeyhole, Mail, UsersRound } from 'lucide-react'

type PilotRequest = {
  id: string
  name: string
  email: string
  organization: string
  pilotType: string
  workflow: string
  sourcePath: string
  status: 'new' | 'contacted' | 'closed'
  createdAt: string
}

type AnalyticsSummary = {
  totalEvents: number
  byEvent: Record<string, number>
  byPath: Record<string, number>
}

export function PilotAdminClient() {
  const [requests, setRequests] = useState<PilotRequest[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | PilotRequest['status']>('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [savingStatusId, setSavingStatusId] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/pilot/requests').then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || 'Could not load pilot requests.')
        return data.requests as PilotRequest[]
      }),
      fetch('/api/developer/analytics').then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || 'Could not load analytics.')
        return data as AnalyticsSummary
      }),
    ])
      .then(([nextRequests, nextAnalytics]) => {
        if (cancelled) return
        setRequests(nextRequests)
        setAnalytics(nextAnalytics)
      })
      .catch((nextError) => {
        if (!cancelled) setError(nextError instanceof Error ? nextError.message : 'Could not load admin data.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl border border-border-soft bg-surface p-6 text-sm font-black text-muted">
        Loading pilot admin data...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-caution/30 bg-caution/10 p-6">
        <LockKeyhole className="mb-4 h-6 w-6 text-caution" />
        <h1 className="text-2xl font-black">Admin access required</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-muted">
          {error} Log in through the Developer Portal, then return here to view pilot leads and analytics.
        </p>
        <Link href="/developer" className="hireproof-focus mt-5 inline-flex items-center gap-2 rounded-lg border border-border-soft bg-background px-4 py-2.5 text-sm font-black hover:bg-surface">
          Open Developer Portal <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  const topEvents = Object.entries(analytics?.byEvent || {}).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const topPaths = Object.entries(analytics?.byPath || {}).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const pilotTypes = Array.from(new Set(requests.map((request) => request.pilotType))).filter(Boolean)
  const normalizedQuery = query.trim().toLowerCase()
  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesType = typeFilter === 'all' || request.pilotType === typeFilter
    const searchable = [request.name, request.email, request.organization, request.pilotType, request.workflow].join(' ').toLowerCase()
    return matchesStatus && matchesType && (!normalizedQuery || searchable.includes(normalizedQuery))
  })

  async function updateStatus(requestId: string, status: PilotRequest['status']) {
    setSavingStatusId(requestId)
    setNotice('')
    try {
      const response = await fetch('/api/pilot/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: requestId, status }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not update pilot request.')
      setRequests((current) => current.map((request) => request.id === requestId ? data.request as PilotRequest : request))
      setNotice('Pilot request status updated.')
    } catch (nextError) {
      setNotice(nextError instanceof Error ? nextError.message : 'Could not update pilot request.')
    } finally {
      setSavingStatusId('')
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-2xl border border-border-soft bg-surface p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-safe/30 bg-safe/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-safe">
            <UsersRound className="h-4 w-4" />
            Pilot admin
          </div>
          <h1 className="text-3xl font-black tracking-tight">Pilot requests and product signals</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-muted">
            Authenticated view for stored pilot leads and lightweight product events.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/api/pilot/requests/export" className="hireproof-focus hireproof-cta-primary inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-black">
            Export leads <Download className="h-4 w-4" />
          </a>
          <a href="/api/developer/analytics/export" className="hireproof-focus inline-flex items-center justify-center gap-2 rounded-lg border border-border-soft bg-background px-4 py-2.5 text-sm font-black hover:bg-surface">
            Export events <Download className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border-soft bg-surface p-5">
          <UsersRound className="mb-4 h-5 w-5 text-safe" />
          <div className="text-3xl font-black">{requests.length}</div>
          <p className="mt-1 text-xs font-black uppercase tracking-widest text-muted">Pilot requests</p>
        </div>
        <div className="rounded-2xl border border-border-soft bg-surface p-5">
          <BarChart3 className="mb-4 h-5 w-5 text-evidence" />
          <div className="text-3xl font-black">{analytics?.totalEvents || 0}</div>
          <p className="mt-1 text-xs font-black uppercase tracking-widest text-muted">Tracked events</p>
        </div>
        <div className="rounded-2xl border border-border-soft bg-surface p-5">
          <Mail className="mb-4 h-5 w-5 text-caution" />
          <div className="text-3xl font-black">{requests.filter((request) => request.status === 'new').length}</div>
          <p className="mt-1 text-xs font-black uppercase tracking-widest text-muted">New leads</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-soft bg-surface p-5">
          <h2 className="text-lg font-black">Top events</h2>
          <div className="mt-4 space-y-2">
            {topEvents.length ? topEvents.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-background p-3 text-sm font-semibold">
                <span>{label}</span>
                <span className="font-black text-safe">{value}</span>
              </div>
            )) : <p className="text-sm font-semibold text-muted">No events yet.</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-border-soft bg-surface p-5">
          <h2 className="text-lg font-black">Top paths</h2>
          <div className="mt-4 space-y-2">
            {topPaths.length ? topPaths.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-background p-3 text-sm font-semibold">
                <span className="min-w-0 truncate">{label}</span>
                <span className="font-black text-safe">{value}</span>
              </div>
            )) : <p className="text-sm font-semibold text-muted">No paths yet.</p>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border-soft bg-surface p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-black">Recent pilot requests</h2>
            <p className="mt-1 text-sm font-semibold text-muted">{filteredRequests.length} shown from {requests.length} stored requests.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[44rem]">
            <label className="text-xs font-black uppercase tracking-widest text-muted">
              Search
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="hireproof-focus mt-2 w-full rounded-lg border border-border bg-background p-2 text-sm font-semibold normal-case tracking-normal outline-none focus:border-safe" placeholder="Name, email, org, workflow" />
            </label>
            <label className="text-xs font-black uppercase tracking-widest text-muted">
              Status
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="hireproof-focus mt-2 w-full rounded-lg border border-border bg-background p-2 text-sm font-semibold normal-case tracking-normal outline-none focus:border-safe">
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label className="text-xs font-black uppercase tracking-widest text-muted">
              Pilot type
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="hireproof-focus mt-2 w-full rounded-lg border border-border bg-background p-2 text-sm font-semibold normal-case tracking-normal outline-none focus:border-safe">
                <option value="all">All types</option>
                {pilotTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
          </div>
        </div>
        {notice && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border-soft bg-background p-3 text-sm font-semibold text-muted">
            <Filter className="h-4 w-4 text-safe" />
            {notice}
          </div>
        )}
        <div className="mt-4 space-y-3">
          {filteredRequests.length ? filteredRequests.slice(0, 50).map((request) => (
            <article key={request.id} className="rounded-xl border border-border-soft bg-background p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-black">{request.name}</h3>
                  <p className="text-sm font-semibold text-muted">{request.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full border border-safe/25 bg-safe/10 px-2.5 py-1 text-xs font-black uppercase tracking-widest text-safe">{request.pilotType}</span>
                    <span className="rounded-full border border-border-soft bg-surface px-2.5 py-1 text-xs font-black uppercase tracking-widest text-muted">{request.status}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:items-end">
                  <time className="text-xs font-semibold text-muted">{new Date(request.createdAt).toLocaleString()}</time>
                  <select
                    value={request.status}
                    disabled={savingStatusId === request.id}
                    onChange={(event) => updateStatus(request.id, event.target.value as PilotRequest['status'])}
                    className="hireproof-focus rounded-lg border border-border bg-surface p-2 text-xs font-black uppercase tracking-widest outline-none focus:border-safe disabled:opacity-60"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              {request.organization && <p className="mt-3 text-sm font-semibold text-muted">{request.organization}</p>}
              <p className="mt-3 text-sm font-semibold leading-6 text-muted">{request.workflow}</p>
            </article>
          )) : <p className="text-sm font-semibold text-muted">No matching pilot requests.</p>}
        </div>
      </section>
    </div>
  )
}
