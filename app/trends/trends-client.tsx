'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { SiteHeader } from '@/components/site-header'
import { TrendingUp, AlertTriangle, ShieldCheck, Zap, Globe, BarChart3, Clock, ArrowUpRight } from 'lucide-react'

export function TrendsClient() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/intelligence/trends')
      .then(res => res.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-safe border-t-transparent" />
          <p className="mt-4 text-sm font-black uppercase tracking-widest text-muted">Analyzing Global Patterns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-20">
        <header className="mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-safe/30 bg-safe/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-safe">
            <TrendingUp className="h-4 w-4" />
            Live Intelligence
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Global Threat <span className="text-safe">Trends.</span></h1>
          <p className="mt-6 max-w-2xl text-lg font-medium text-muted leading-relaxed">
            Real-time analysis of the most prevalent recruitment scam patterns across the global job market.
          </p>
        </header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* High-Level Stats */}
          <motion.div variants={itemVariants} className="col-span-full grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Scam Velocity', value: '+14% /mo', icon: BarChart3, color: 'text-risk-text' },
              { label: 'Avg. Phish Score', value: '84/100', icon: AlertTriangle, color: 'text-caution' },
              { label: 'Defense Efficacy', value: '99.8%', icon: ShieldCheck, color: 'text-safe' },
              { label: 'New Nodes', value: '14 Active', icon: Globe, color: 'text-evidence' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-border-soft bg-surface p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className={`rounded-lg bg-background p-2 ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted">{stat.label}</div>
                <div className="mt-1 text-2xl font-black">{stat.value}</div>
              </div>
            ))}
          </motion.div>

          {/* Prevailing Vectors */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
            <div className="rounded-[2.5rem] border border-border-soft bg-surface p-10 shadow-sm">
              <h3 className="text-2xl font-black mb-8">Top Malicious Vectors</h3>
              <div className="space-y-6">
                {stats?.topVectors?.map((vector: any, i: number) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                      <span>{vector.name}</span>
                      <span className="text-risk-text">{vector.frequency}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-background">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${vector.frequency}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full bg-risk-bg shadow-[0_0_10px_#f43f5e]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-border-soft bg-surface p-10 shadow-sm">
              <h3 className="text-2xl font-black mb-8">Recent High-Risk Keywords</h3>
              <div className="flex flex-wrap gap-3">
                {stats?.highRiskKeywords?.map((keyword: string, i: number) => (
                  <span key={i} className="rounded-xl border border-risk-bg/20 bg-risk-bg/5 px-4 py-2 text-xs font-black text-risk-text">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Live Alerts Sidebar */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="rounded-[2.5rem] border border-border-soft bg-foreground p-8 text-background shadow-xl">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-safe text-background shadow-lg shadow-safe/20">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black leading-tight">Trending Scam: "The Ghost Recruiter"</h3>
              <p className="mt-4 text-sm font-bold opacity-70">
                A new automated pattern using deep-fake LinkedIn profiles to redirect candidates to malicious phishing forms.
              </p>
              <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <Clock className="h-3 w-3" />
                Detected 2h ago
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-border-soft bg-surface p-8">
              <h4 className="text-sm font-black uppercase tracking-widest text-muted mb-6">Regional Hotspots</h4>
              <div className="space-y-4">
                {[
                  { region: 'South East Asia', level: 'High', color: 'text-risk-text' },
                  { region: 'North America', level: 'Moderate', color: 'text-caution' },
                  { region: 'Western Europe', level: 'Low', color: 'text-safe' },
                ].map((hotspot) => (
                  <div key={hotspot.region} className="flex items-center justify-between border-b border-border-soft pb-4 last:border-0 last:pb-0">
                    <span className="text-sm font-bold">{hotspot.region}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${hotspot.color}`}>{hotspot.level} Risk</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
