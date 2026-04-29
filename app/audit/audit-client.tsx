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
import { DEMO_FIXTURES } from '@/lib/fixtures'
import { useAuditHistory } from '@/hooks/useAuditHistory'
import { useLiveMode } from '@/hooks/useLiveMode'
import type { AuditReport, AuditRequest } from '@/lib/schemas'

type DemoScenario = 'high-risk' | 'caution' | 'safe'

const sampleRequests: Record<DemoScenario, AuditRequest> = {
  'high-risk': {
    text: 'Remote Frontend Intern - PHP 80,000/week. To apply, message our manager on Telegram: @ApexHiringManager. Do not apply through LinkedIn. Instant start, no interview required.',
    location: 'Philippines',
    mode: 'demo'
  },
  'caution': {
    text: 'Junior Data Analyst at Global Insights Group. We are looking for a data analyst. Pay is competitive. Send your CV to hr@globalinsights-hr.com.',
    location: 'Remote',
    mode: 'demo'
  },
  'safe': {
    text: 'Senior Frontend Engineer at Vercel. Join our team at Vercel to help build the best developer experience for the web. Apply via our official careers page at vercel.com/careers.',
    location: 'United States',
    mode: 'demo'
  }
}

function AuditContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addReport } = useAuditHistory()
  const { isLiveMode } = useLiveMode()
  
  const [report, setReport] = useState<AuditReport | null>(null)
  const [isAuditing, setIsAuditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoTriggered, setDemoTriggered] = useState(false)

  // Handle demo scenario from query param
  useEffect(() => {
    const demo = searchParams.get('demo') as DemoScenario
    if (demo && sampleRequests[demo] && !demoTriggered && !report && !isAuditing) {
      setDemoTriggered(true)
      handleAudit(sampleRequests[demo])
    }
  }, [searchParams, demoTriggered, report, isAuditing])

  const handleAudit = async (request: AuditRequest) => {
    setIsAuditing(true)
    setReport(null)
    setError(null)

    try {
      // In demo mode or if live mode is off, we use mock results after a delay
      if (!isLiveMode || request.mode === 'demo') {
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Match demo scenarios or fall back to a random one
        let mockResult: AuditReport
        const lowerText = (request.text || '').toLowerCase()
        if (lowerText.includes('80,000') || lowerText.includes('telegram')) {
          mockResult = JSON.parse(JSON.stringify(DEMO_FIXTURES.highRisk))
        } else if (lowerText.includes('vercel')) {
          mockResult = JSON.parse(JSON.stringify(DEMO_FIXTURES.safe))
        } else {
          // Semi-random logic for generic inputs
          const random = Math.random()
          if (random > 0.7) mockResult = JSON.parse(JSON.stringify(DEMO_FIXTURES.highRisk))
          else if (random > 0.4) mockResult = JSON.parse(JSON.stringify(DEMO_FIXTURES.caution))
          else mockResult = JSON.parse(JSON.stringify(DEMO_FIXTURES.safe))
        }
        
        // Customize the mock result to match input slightly
        const finalReport: AuditReport = {
          ...mockResult,
          id: `report_${Math.random().toString(36).substring(2, 10)}`,
          timestamp: new Date().toISOString(),
          mode: 'demo'
        }
        
        setReport(finalReport)
        addReport(finalReport)
      } else {
        // Real API Call
        const res = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        })
        
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Audit failed')
        }
        
        const finalReport = await res.json()
        setReport(finalReport)
        addReport(finalReport)
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during forensic analysis.')
    } finally {
      setIsAuditing(false)
    }
  }

  const reset = () => {
    setReport(null)
    setError(null)
    setDemoTriggered(false)
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
            className="mx-auto max-w-4xl py-12 lg:py-20"
          >
            <div className="mb-12 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-safe/30 bg-safe/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-safe">
                <Terminal className="h-4 w-4" />
                Dossier Generation Portal
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Run Forensic <span className="text-safe">Audit.</span></h1>
              <p className="mt-4 text-lg font-medium text-muted">
                Paste the job details below. Our agents will cross-reference signals in real-time.
              </p>
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

            {/* Quick Demo Shortcuts */}
            <div className="mt-16 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-6">Test Scenarios</p>
              <div className="flex flex-wrap justify-center gap-4">
                {(['high-risk', 'caution', 'safe'] as DemoScenario[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleAudit(sampleRequests[type])}
                    className="flex items-center gap-2 rounded-xl border border-border-soft bg-surface px-4 py-2 text-xs font-black uppercase tracking-widest transition-all hover:bg-background hover:scale-105 active:scale-95"
                  >
                    <div className={`h-2 w-2 rounded-full ${
                      type === 'high-risk' ? 'bg-risk-text' : 
                      type === 'caution' ? 'bg-caution' : 'bg-safe'
                    }`} />
                    {type}
                  </button>
                ))}
              </div>
            </div>
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
            <ResultScreen result={report} onBackToAudit={reset} isDemo={report.mode === 'demo'} />
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
