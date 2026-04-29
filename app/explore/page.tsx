'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import type { AuditReport } from '@/lib/schemas'

export default function ExplorePage() {
  const [reports, setReports] = useState<AuditReport[]>([])
  const [query, setQuery] = useState('')
  const [verdict, setVerdict] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (verdict !== 'all') params.set('verdict', verdict)
    setLoading(true)
    fetch(`/api/intelligence/reports?${params}`)
      .then((res) => res.json())
      .then((json) => setReports(json.reports || []))
      .finally(() => setLoading(false))
  }, [query, verdict])

  const counts = useMemo(() => ({
    all: reports.length,
    safe: reports.filter((item) => item.verdict === 'safe').length,
    caution: reports.filter((item) => item.verdict === 'caution').length,
    'high-risk': reports.filter((item) => item.verdict === 'high-risk').length,
  }), [reports])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <div className="mb-10">
          <div className="mb-3 inline-flex rounded-full bg-safe/10 px-3 py-1 text-xs font-black uppercase tracking-normal text-safe">
            Stored audit intelligence
          </div>
          <h1 className="text-4xl font-black lg:text-5xl">Intelligence Feed</h1>
          <p className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-muted">
            Browse real reports saved by HireProof audits in this deployment.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search company, role, location..."
              className="w-full rounded-xl border border-border-soft bg-surface py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-safe/50 focus:ring-4 focus:ring-safe/5"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {(['all', 'high-risk', 'caution', 'safe'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setVerdict(item)}
                className={`rounded-full border px-4 py-2 text-xs font-black capitalize ${verdict === item ? 'border-foreground bg-foreground text-background' : 'border-border bg-surface text-muted hover:bg-background'}`}
              >
                {item} <span className="opacity-70">({counts[item] ?? 0})</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border-soft bg-surface p-10 text-center text-sm font-bold text-muted">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-border-soft bg-surface p-10 text-center">
            <p className="font-bold text-muted">No saved reports match this filter yet.</p>
            <Link href="/audit" className="mt-4 inline-flex rounded-xl bg-foreground px-5 py-3 text-sm font-black text-background hover:bg-safe">Run an audit</Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((item) => (
              <Link key={item.id} href={item.id ? `/audit/${item.id}` : '/audit'} className="group flex flex-col rounded-2xl border border-border-soft bg-surface p-6 transition-all hover:-translate-y-1 hover:border-safe/30 hover:shadow-xl hover:shadow-safe/5">
                <div className="mb-4 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${item.verdict === 'high-risk' ? 'bg-risk-bg text-risk-text' : item.verdict === 'caution' ? 'bg-caution-bg text-caution-text' : 'bg-safe-bg text-safe-text'}`}>
                    {item.verdict}
                  </span>
                  <span className="text-[10px] font-bold text-muted">{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}</span>
                </div>
                <h3 className="mb-1 text-lg font-black transition-colors group-hover:text-safe">{item.extractedClaims.role}</h3>
                <p className="mb-6 text-sm font-semibold text-muted">{item.extractedClaims.company}</p>
                <div className="mt-auto flex items-center justify-between border-t border-border-soft pt-4">
                  <span className="text-xs font-black text-muted">Risk {item.riskScore}/100</span>
                  <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-safe" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
