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
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-safe/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-safe border border-safe/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-safe"></span>
              </span>
              Stored forensic intelligence
            </div>
            <h1 className="text-4xl font-black lg:text-6xl tracking-tight">Intelligence Feed</h1>
            <p className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-muted">
              Access the global database of audited job opportunities. Every report is a case file for a safer internet.
            </p>
          </div>
          <div className="hidden lg:block text-right">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-1">Global Telemetry Status</div>
            <div className="text-xl font-black text-safe">OPERATIONAL</div>
          </div>
        </div>

        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1 group">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted transition-colors group-focus-within:text-safe" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search case files by role, company, or pattern..."
              className="w-full rounded-2xl border border-border-soft bg-surface/50 backdrop-blur-sm py-4 pl-12 pr-6 text-sm font-bold outline-none focus:border-safe/50 focus:ring-4 focus:ring-safe/5 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {(['all', 'high-risk', 'caution', 'safe'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setVerdict(item)}
                className={`whitespace-nowrap rounded-xl border px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                  verdict === item 
                    ? 'border-foreground bg-foreground text-background shadow-lg scale-105' 
                    : 'border-border-soft bg-surface/50 text-muted hover:border-safe/40 hover:text-foreground backdrop-blur-sm'
                }`}
              >
                {item} <span className="opacity-50 ml-1">[{counts[item] ?? 0}]</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl border border-border-soft bg-surface/30" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-[3rem] border border-dashed border-border-soft bg-surface/10 p-20 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-surface mb-6 text-muted border border-border-soft">
              <Search className="h-10 w-10 opacity-20" />
            </div>
            <h2 className="text-2xl font-black mb-2">No results found</h2>
            <p className="text-muted font-medium mb-8">No forensic case files match your current search parameters.</p>
            <Link href="/audit" className="inline-flex rounded-2xl bg-foreground px-8 py-4 text-base font-black text-background hover:bg-safe transition-all shadow-xl hover:shadow-safe/20">
              Run New Audit
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((item) => (
              <Link 
                key={item.id} 
                href={item.id ? `/audit/${item.id}` : '/audit'} 
                className="group relative flex flex-col rounded-[2.5rem] border border-border-soft bg-surface/50 p-8 transition-all hover:-translate-y-2 hover:border-safe/40 hover:bg-background hover:shadow-2xl hover:shadow-safe/5 backdrop-blur-sm overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-safe/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                <div className="mb-6 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] ${
                    item.verdict === 'high-risk' ? 'bg-risk-bg/10 text-risk-text border border-risk-bg/20' : 
                    item.verdict === 'caution' ? 'bg-caution-bg/10 text-caution-text border border-caution-bg/20' : 
                    'bg-safe/10 text-safe border border-safe/20'
                  }`}>
                    {item.verdict}
                  </span>
                  <div className="text-[10px] font-bold text-muted flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-safe" />
                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'RECENT_CASE'}
                  </div>
                </div>

                <div className="mb-1 text-sm font-black uppercase tracking-widest text-muted opacity-60">Case Report</div>
                <h3 className="mb-2 text-2xl font-black leading-tight transition-colors group-hover:text-safe">{item.extractedClaims.role}</h3>
                <p className="mb-8 text-base font-bold text-muted/80">{item.extractedClaims.company}</p>
                
                <div className="mt-auto flex items-center justify-between border-t border-border-soft/50 pt-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Risk Score</span>
                    <span className={`text-xl font-black ${item.verdict === 'high-risk' ? 'text-risk-text' : item.verdict === 'caution' ? 'text-caution-text' : 'text-safe'}`}>
                      {item.riskScore}<span className="text-[10px] opacity-40 ml-1">/100</span>
                    </span>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-border-soft group-hover:bg-safe group-hover:text-background group-hover:border-safe transition-all shadow-sm">
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
