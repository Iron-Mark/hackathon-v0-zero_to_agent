'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Play, Zap, Search, TrendingUp, Terminal, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AuditForm from '@/components/audit-form'
import ResultScreen from '@/components/result-screen'
import { SiteHeader } from '@/components/site-header'
import { ErrorBoundary } from '@/components/error-boundary'
import { AuditSkeleton } from '@/components/audit-skeleton'
import { useAuditHistory } from '@/hooks/useAuditHistory'
import { getFixtureByVerdict } from '@/lib/fixtures'
import type { AuditReport, AuditRequest } from '@/lib/schemas'

type StreamEvent =
  | { type: 'log'; message: string }
  | { type: 'result'; data: AuditReport }
  | { type: 'error'; message: string }

type DemoVerdict = 'safe' | 'caution' | 'high-risk'

const DEMO_VERDICTS: DemoVerdict[] = ['high-risk', 'caution', 'safe']

function isDemoVerdict(value: string | null): value is DemoVerdict {
  return Boolean(value && DEMO_VERDICTS.includes(value as DemoVerdict))
}

function buildDemoReport(verdict: DemoVerdict): AuditReport {
  return {
    id: `demo_${verdict}_${Date.now()}`,
    ...getFixtureByVerdict(verdict),
    timestamp: new Date().toISOString(),
    mode: 'demo',
    credentialMode: 'demo',
    source: 'demo',
    publiclyListed: true,
  }
}

function chooseDemoVerdict(text: string): DemoVerdict {
  const lower = text.toLowerCase()
  if (lower.includes('80000') || lower.includes('telegram') || lower.includes('urgent')) return 'high-risk'
  if (lower.includes('unclear') || lower.includes('caution') || lower.includes('competitive')) return 'caution'
  return 'safe'
}

async function readAuditStream(response: Response, onEvent: (event: StreamEvent) => void) {
  if (!response.body) throw new Error('Audit stream did not return a readable body.')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })
      const chunks = buffer.split('\n\n')
      buffer = chunks.pop() ?? ''

      for (const chunk of chunks) {
        const dataLine = chunk
          .split('\n')
          .find((line) => line.startsWith('data:'))

        if (!dataLine) continue
        const parsed = JSON.parse(dataLine.slice(5).trim()) as StreamEvent
        onEvent(parsed)

        if (parsed.type === 'log') continue
        if (parsed.type === 'result') return parsed.data
        if (parsed.type === 'error') throw new Error(parsed.message)
      }

      if (done) break
    }
  } finally {
    reader.releaseLock()
  }

  throw new Error('Audit stream ended without a report.')
}

async function readErrorMessage(response: Response) {
  const fallback = `Audit failed with HTTP ${response.status}.`
  const text = await response.text().catch(() => '')
  if (!text) return fallback

  try {
    const parsed = JSON.parse(text) as { error?: string; message?: string }
    return parsed.error || parsed.message || fallback
  } catch {
    return text.slice(0, 200) || fallback
  }
}

function AuditContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addReport } = useAuditHistory()
  
  const [report, setReport] = useState<AuditReport | null>(null)
  const [isAuditing, setIsAuditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streamLogs, setStreamLogs] = useState<string[]>([])
  const [liveMode, setLiveMode] = useState(true)
  const loadedDemoRef = useRef<string | null>(null)

  useEffect(() => {
    const demo = searchParams.get('demo')
    if (!isDemoVerdict(demo)) return
    if (loadedDemoRef.current === demo) return

    const demoReport = buildDemoReport(demo)
    loadedDemoRef.current = demo
    setLiveMode(false)
    setReport(demoReport)
    setError(null)
    setStreamLogs(['Demo fixtures loaded for instant judging.'])
    addReport(demoReport)
  }, [searchParams, addReport])

  const handleAudit = async (request: AuditRequest) => {
    setIsAuditing(true)
    setReport(null)
    setError(null)
    setStreamLogs([])

    try {
      if (!liveMode) {
        const demoReport = buildDemoReport(chooseDemoVerdict(request.text))
        setReport(demoReport)
        addReport(demoReport)
        return
      }

      // Real API Call
      const res = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...request, mode: liveMode ? 'live' : 'demo' })
        })
        
        if (!res.ok) {
          throw new Error(await readErrorMessage(res))
        }
        
        const finalReport = await readAuditStream(res, (event) => {
          if (event.type === 'log') {
            setStreamLogs((logs) => [...logs, event.message].slice(-8))
          }
        })
        setReport(finalReport)
        addReport(finalReport)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during job verification.')
    } finally {
      setIsAuditing(false)
    }
  }

  const reset = () => {
    setReport(null)
    setError(null)
    setStreamLogs([])
    router.push('/audit')
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <AnimatePresence mode="wait">
        {!isAuditing && !report && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-auto max-w-6xl py-8 lg:py-10"
          >
            <div className="mb-6 text-center lg:mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-safe/30 bg-safe/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-safe">
                <Terminal className="h-4 w-4" />
                Job Verification Portal
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Check a Job <span className="text-safe">Post.</span></h1>
              <p className="mx-auto mt-3 max-w-2xl text-base font-medium text-muted sm:text-lg">
                Paste the job details below. Our agents will cross-reference signals in real-time.
              </p>
            </div>

            <div className="mb-4 inline-flex rounded-xl border border-border-soft bg-surface p-1 text-xs font-black lg:mb-5">
              <button
                type="button"
                onClick={() => setLiveMode(true)}
                className={`rounded-lg px-3 py-2 transition-colors ${liveMode ? 'bg-foreground text-background' : 'text-muted hover:text-foreground'}`}
              >
                Live evidence
              </button>
              <button
                type="button"
                onClick={() => setLiveMode(false)}
                className={`rounded-lg px-3 py-2 transition-colors ${!liveMode ? 'bg-foreground text-background' : 'text-muted hover:text-foreground'}`}
              >
                Demo fixtures
              </button>
            </div>
            
            <AuditForm onInvestigate={handleAudit} loading={isAuditing} />
            
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 rounded-2xl border border-risk-bg/20 bg-risk-bg/5 p-4 text-center text-sm font-bold text-risk-text"
              >
                {error}
              </motion.div>
            )}


          </motion.div>
        )}

        {isAuditing && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AuditSkeleton />
            <div className="mx-auto -mt-4 max-w-4xl rounded-2xl border border-border-soft bg-surface p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-safe">
                  Live audit stream
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                  {streamLogs.length} events
                </span>
              </div>
              <div className="space-y-2 font-mono text-xs text-muted">
                {streamLogs.length > 0 ? streamLogs.map((log, index) => (
                  <div key={`${log}-${index}`} className="rounded-lg bg-background px-3 py-2">
                    {log}
                  </div>
                )) : (
                  <div className="rounded-lg bg-background px-3 py-2">Submitting audit request...</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {report && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="pb-20"
          >
            <ResultScreen result={report} onBackToAudit={reset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AuditClient() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-20 xl:px-32">
        <ErrorBoundary>
          <Suspense fallback={<AuditSkeleton />}>
            <AuditContent />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
