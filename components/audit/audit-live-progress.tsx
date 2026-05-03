'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertCircle, Building2, CheckCircle2, FileSearch, Globe2, Newspaper, SearchCheck, ShieldCheck, Square, WalletCards } from 'lucide-react'
import { motion } from 'framer-motion'

export type AuditProgressPhase =
  | 'intake'
  | 'ocr'
  | 'extract'
  | 'guardrail'
  | 'company'
  | 'news'
  | 'jobs'
  | 'local'
  | 'coverage'
  | 'score'
  | 'report'

export type AuditProgressEvent = {
  type: 'log'
  message: string
  phase?: AuditProgressPhase
  status?: 'pending' | 'active' | 'complete' | 'blocked'
  label?: string
}

type AuditLiveProgressProps = {
  events: AuditProgressEvent[]
  onStopWaiting: () => void
}

const PHASES: Array<{ id: AuditProgressPhase; label: string; icon: typeof Activity }> = [
  { id: 'intake', label: 'Intake', icon: FileSearch },
  { id: 'ocr', label: 'OCR / URL', icon: Globe2 },
  { id: 'extract', label: 'Claims', icon: SearchCheck },
  { id: 'guardrail', label: 'Guardrails', icon: ShieldCheck },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'jobs', label: 'Jobs', icon: WalletCards },
  { id: 'local', label: 'Local', icon: Globe2 },
  { id: 'coverage', label: 'Coverage', icon: SearchCheck },
  { id: 'score', label: 'Scoring', icon: Activity },
  { id: 'report', label: 'Report', icon: CheckCircle2 },
]

function phaseIndex(phase?: AuditProgressPhase) {
  return Math.max(0, PHASES.findIndex(item => item.id === phase))
}

function getPhaseStatus(phase: AuditProgressPhase, events: AuditProgressEvent[]) {
  const lastForPhase = [...events].reverse().find(event => event.phase === phase)
  if (lastForPhase?.status === 'blocked') return 'blocked'
  if (lastForPhase?.status === 'complete') return 'complete'

  const latestPhase = [...events].reverse().find(event => event.phase)?.phase
  const currentIndex = phaseIndex(latestPhase)
  const thisIndex = phaseIndex(phase)
  if (thisIndex < currentIndex) return 'complete'
  if (thisIndex === currentIndex) return 'active'
  return 'pending'
}

function getWaitingMessage(events: AuditProgressEvent[]) {
  const latest = [...events].reverse().find(event => event.message)
  if (!latest) return 'Submitting audit request...'
  if (latest.phase === 'company' || latest.phase === 'news' || latest.phase === 'jobs' || latest.phase === 'local') {
    return 'Still waiting on search providers...'
  }
  if (latest.phase === 'coverage') return 'Keeping the connection open for live evidence...'
  return 'No result yet; this can take longer when providers are slow.'
}

export function AuditLiveProgress({ events, onStopWaiting }: AuditLiveProgressProps) {
  const [isWaiting, setIsWaiting] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const latestEvent = [...events].reverse().find(event => event.message)
  const progress = useMemo(() => {
    const latestPhase = latestEvent?.phase
    if (!latestPhase) return 8
    return Math.min(92, Math.round(((phaseIndex(latestPhase) + 1) / PHASES.length) * 100))
  }, [latestEvent?.phase])

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    setReducedMotion(Boolean(media?.matches))
    const timeout = window.setTimeout(() => setIsWaiting(true), 4200)
    return () => window.clearTimeout(timeout)
  }, [events.length])

  const visibleEvents = events.slice(-8)

  return (
    <section className="mx-auto max-w-5xl px-4 py-8" aria-label="Live audit progress">
      <div className="rounded-3xl border border-border-soft bg-surface p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-safe/30 bg-safe/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-safe">
              <Activity className={reducedMotion ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5 animate-pulse'} />
              Analyst console
            </div>
            <h2 className="text-2xl font-black">Checking live evidence</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted" aria-live="polite">
              {latestEvent?.label || latestEvent?.message || 'Preparing the audit request and opening the evidence stream.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onStopWaiting}
            className="hireproof-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-soft bg-background px-4 py-2 text-sm font-black text-muted transition-colors hover:text-risk-text"
          >
            <Square className="h-4 w-4" />
            Stop waiting
          </button>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted">
            <span>Live progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-background">
            <motion.div
              className="h-full rounded-full bg-safe"
              animate={{ width: `${progress}%` }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.28, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PHASES.map((phase) => {
            const status = getPhaseStatus(phase.id, events)
            const Icon = phase.icon
            return (
              <div key={phase.id} className="rounded-2xl border border-border-soft bg-background p-3">
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                    status === 'complete'
                      ? 'border-safe/30 bg-safe/10 text-safe'
                      : status === 'blocked'
                        ? 'border-caution/30 bg-caution-bg/30 text-caution-text'
                        : status === 'active'
                          ? 'border-evidence/30 bg-evidence/10 text-evidence'
                          : 'border-border-soft bg-surface text-muted'
                  }`}>
                    {status === 'complete' ? <CheckCircle2 className="h-4 w-4" /> : status === 'blocked' ? <AlertCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-black">{phase.label}</div>
                    <div className="text-[10px] font-black uppercase tracking-normal text-muted">{status}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-border-soft bg-background p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-widest text-safe">Evidence stream</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">{visibleEvents.length} events</span>
          </div>
          <div className="space-y-2 text-xs font-semibold text-muted" aria-live="polite">
            {visibleEvents.length > 0 ? visibleEvents.map((event, index) => (
              <div key={`${event.message}-${index}`} className="rounded-xl border border-border-soft bg-surface px-3 py-2">
                <span className="mr-2 font-black text-foreground">{event.label || event.phase || 'event'}</span>
                {event.message}
              </div>
            )) : (
              <div className="rounded-xl border border-border-soft bg-surface px-3 py-2">Submitting audit request...</div>
            )}
            {isWaiting && (
              <div className="rounded-xl border border-caution/30 bg-caution-bg/20 px-3 py-2 text-caution-text">
                {getWaitingMessage(events)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
