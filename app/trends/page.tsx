'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Download, Globe, Map, ShieldCheck, TrendingUp } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'

type Trends = {
  totalReports: number
  verdicts: { safe: number; caution: number; 'high-risk': number }
  topLocations: Array<{ label: string; count: number }>
  topRoles: Array<{ label: string; count: number }>
  topContactMethods: Array<{ label: string; count: number }>
  mode: string
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<Trends | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/intelligence/trends')
      .then((res) => res.json())
      .then(setTrends)
      .finally(() => setLoading(false))
  }, [])

  function downloadReport() {
    if (!trends) return
    const blob = new Blob([JSON.stringify(trends, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `hireproof-trends-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const highRisk = trends?.verdicts['high-risk'] ?? 0
  const caution = trends?.verdicts.caution ?? 0
  const safe = trends?.verdicts.safe ?? 0

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex rounded-full bg-risk-bg px-3 py-1 text-xs font-black uppercase tracking-normal text-risk-text">
              {loading ? 'Analyzing data...' : (trends?.mode === 'hybrid' ? 'Stored audits + live search' : 'Stored audit aggregate')}
            </div>
            <h1 className="text-4xl font-black lg:text-5xl">Global Scam Trends</h1>
            <p className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-muted">
              Aggregated from reports saved by this HireProof deployment.
            </p>
          </div>
          {!loading && (
            <button onClick={downloadReport} className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 font-black text-background hover:bg-safe">
              <Download className="h-4 w-4" /> Export report
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-10">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-3xl border border-border-soft bg-surface/50" />
              ))}
            </div>
            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
              <div className="h-96 animate-pulse rounded-3xl border border-border-soft bg-surface/50" />
              <div className="space-y-6">
                <div className="h-48 animate-pulse rounded-3xl border border-border-soft bg-surface/50" />
                <div className="h-48 animate-pulse rounded-3xl border border-border-soft bg-surface/50" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Audits" value={trends?.totalReports ?? 0} icon={Globe} />
          <StatCard title="High-Risk" value={highRisk} icon={AlertCircle} color="text-risk-text" />
          <StatCard title="Caution" value={caution} icon={TrendingUp} color="text-caution-text" />
          <StatCard title="Safe" value={safe} icon={ShieldCheck} color="text-safe" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <section className="rounded-3xl border border-border-soft bg-surface p-8">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-black">
              <Map className="h-6 w-6" /> Regional Risk Analysis
            </h2>
            <div className="overflow-hidden rounded-2xl border border-border-soft bg-background">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-soft bg-surface/50 text-[10px] font-black uppercase tracking-widest text-muted">
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4 text-right">Reports</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold">
                  {(trends?.topLocations || []).map((item) => (
                    <tr key={item.label} className="border-b border-border-soft last:border-0">
                      <td className="px-6 py-4">{item.label}</td>
                      <td className="px-6 py-4 text-right">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

            <aside className="space-y-6">
              <ListCard title="Top Roles" items={trends?.topRoles || []} />
              <ListCard title="Contact Methods" items={trends?.topContactMethods || []} />
            </aside>
          </div>
        </>
      )}
      </main>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color = 'text-foreground' }: { title: string; value: number; icon: any; color?: string }) {
  return (
    <div className="rounded-3xl border border-border-soft bg-surface p-6 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-background text-muted">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mb-1 text-xs font-black uppercase tracking-widest text-muted">{title}</div>
      <div className={`text-2xl font-black ${color}`}>{value.toLocaleString()}</div>
    </div>
  )
}

function ListCard({ title, items }: { title: string; items: Array<{ label: string; count: number }> }) {
  return (
    <div className="rounded-3xl border border-border-soft bg-surface p-6">
      <h3 className="mb-4 text-lg font-black uppercase tracking-tight">{title}</h3>
      <div className="space-y-3">
        {items.length === 0 ? <p className="text-sm font-semibold text-muted">No data yet.</p> : items.map((item) => (
          <div key={item.label} className="flex justify-between gap-4 rounded-xl bg-background p-3 text-sm font-bold">
            <span className="truncate">{item.label}</span>
            <span className="text-muted">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
