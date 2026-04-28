'use client'

import { useRef, useState } from 'react'
import { ArrowLeft, Download, Share2, AlertTriangle, Zap, CheckCircle2, Clock, AlertCircle, Loader2, Link2, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import RiskRadarChart from '@/components/risk-radar-chart'
import { generatePdfDossier } from '@/lib/generate-pdf'
import { showToast } from '@/components/toast'

interface Result {
  id?: string
  verdict: 'safe' | 'caution' | 'high-risk'
  riskScore: number
  confidence: string
  summary: string
  extractedClaims: Record<string, string>
  redFlags: string[]
  greenFlags: string[]
  evidence: Array<{
    source: string
    snippet: string
    url?: string
    type: string
  }>
  alternatives: Array<{
    title: string
    company: string
    salary?: string
  }>
  nextSteps: string[]
}

interface ResultScreenProps {
  result: Result
  isDemo?: boolean
  onBackToAudit?: () => void
}

export default function ResultScreen({ result, isDemo = true, onBackToAudit }: ResultScreenProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'safe': return 'text-safe-text'
      case 'caution': return 'text-caution-text'
      case 'high-risk': return 'text-risk-text'
      default: return 'text-foreground'
    }
  }

  const getVerdictBg = (verdict: string) => {
    switch (verdict) {
      case 'safe': return 'border-safe-bg bg-safe-bg'
      case 'caution': return 'border-caution-bg bg-caution-bg'
      case 'high-risk': return 'border-risk-bg bg-risk-bg'
      default: return 'border-border bg-surface'
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'safe': return <CheckCircle2 className="w-8 h-8" />
      case 'caution': return <Zap className="w-8 h-8" />
      case 'high-risk': return <AlertTriangle className="w-8 h-8" />
      default: return null
    }
  }

  const getVerdictText = (verdict: string) => {
    switch (verdict) {
      case 'safe': return 'Safe'
      case 'caution': return 'Caution'
      case 'high-risk': return 'High-Risk'
      default: return 'Unknown'
    }
  }

  const shareText = [
    `HireProof verdict: ${getVerdictText(result.verdict)}`,
    `Risk score: ${result.riskScore}/100`,
    result.summary,
    result.redFlags.length > 0 ? `Top flags: ${result.redFlags.slice(0, 3).join('; ')}` : '',
  ].filter(Boolean).join('\n')

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title: 'HireProof investigation',
        text: shareText,
      })
      return
    }
    await navigator.clipboard.writeText(shareText)
  }

  const handleDownload = async () => {
    if (!contentRef.current) return
    
    try {
      setIsExporting(true)
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = image
      link.download = `hireproof-verdict-${result.verdict}.png`
      link.click()
    } catch (err) {
      console.error('Failed to export image', err)
      window.print()
    } finally {
      setIsExporting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-[73px] z-10 border-b border-border-soft bg-background/95 backdrop-blur-sm print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {onBackToAudit ? (
            <button
              onClick={onBackToAudit}
              className="hireproof-focus flex items-center gap-2 rounded-lg text-sm font-black hover:text-safe"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Audit
            </button>
          ) : (
            <a
              href="/audit"
              className="hireproof-focus flex items-center gap-2 rounded-lg text-sm font-black hover:text-safe"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Audit
            </a>
          )}
          <div className="flex gap-3">
            {result.id && (
              <button 
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.origin + '/audit/' + result.id)
                    showToast('Link copied to clipboard!')
                  } catch (e) {
                    showToast('Failed to copy link', 'info')
                  }
                }} 
                className="hireproof-focus rounded-lg border border-border bg-surface p-2 hover:bg-evidence-bg" 
                title="Copy Permalink" 
                aria-label="Copy Permalink"
              >
                <Link2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={handleShare} className="hireproof-focus rounded-lg border border-border bg-surface p-2 hover:bg-evidence-bg" title="Share" aria-label="Share result">
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={handleDownload} disabled={isExporting} className="hireproof-focus rounded-lg border border-border bg-surface p-2 hover:bg-evidence-bg disabled:opacity-50" title="Download as Image" aria-label="Download result as image">
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => generatePdfDossier(result)} 
              className="hireproof-focus rounded-lg border border-border bg-surface p-2 hover:bg-evidence-bg" 
              title="Download PDF Dossier" 
              aria-label="Download PDF dossier"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        ref={contentRef} 
        className="mx-auto max-w-4xl space-y-10 px-4 py-10" 
        aria-live="polite"
      >
        <motion.section variants={itemVariants} className={`rounded-2xl border p-6 shadow-sm sm:p-8 ${getVerdictBg(result.verdict)}`}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className={`${getVerdictColor(result.verdict)} flex-shrink-0`}>
              {getVerdictIcon(result.verdict)}
            </div>
            <div className="flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h1 className={`text-3xl font-black ${getVerdictColor(result.verdict)}`}>
                  {getVerdictText(result.verdict)}
                </h1>
                <span className="rounded-full bg-surface/70 px-3 py-1 text-sm font-black text-muted">
                  {result.confidence}
                </span>
              </div>
              <p className="mb-5 text-lg font-semibold leading-8">{result.summary}</p>
              <div className="flex flex-wrap items-center gap-8">
                <div>
                  <div className="mb-1 text-sm font-black text-muted">Risk Score</div>
                  <div className="text-4xl font-black">{result.riskScore}/100</div>
                  <div className="mt-3 h-2.5 w-56 max-w-full overflow-hidden rounded-full bg-surface/80">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.riskScore}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      className={`h-full rounded-full ${
                        result.verdict === 'safe'
                          ? 'bg-safe'
                          : result.verdict === 'caution'
                            ? 'bg-caution'
                            : 'bg-high-risk'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="rounded-2xl border border-border-soft bg-surface p-6 shadow-sm">
          <h2 className="mb-3 text-2xl font-black">Risk Breakdown</h2>
          <p className="mb-4 text-sm font-semibold text-muted">How the AI scored each dimension of this opportunity.</p>
          <RiskRadarChart
            extractedClaims={result.extractedClaims as any}
            redFlags={result.redFlags}
            greenFlags={result.greenFlags}
            evidence={result.evidence}
            verdict={result.verdict}
          />
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="mb-5 text-2xl font-black">Extracted Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(result.extractedClaims).map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-border-soft bg-surface p-4 shadow-sm">
                <div className="mb-1 text-sm font-black capitalize text-muted">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="font-black">{value}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {result.redFlags.length > 0 && (
          <motion.section variants={itemVariants}>
            <h2 className="mb-5 flex items-center gap-2 text-2xl font-black text-risk-text">
              <AlertTriangle className="w-5 h-5" />
              Red Flags
            </h2>
            <div className="space-y-2">
              {result.redFlags.map((flag, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  key={i} 
                  className="flex gap-3 rounded-xl border border-risk-bg bg-risk-bg p-3 text-risk-text"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div className="font-semibold">{flag}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {result.greenFlags.length > 0 && (
          <motion.section variants={itemVariants}>
            <h2 className="mb-5 flex items-center gap-2 text-2xl font-black text-safe-text">
              <CheckCircle2 className="w-5 h-5" />
              Green Flags
            </h2>
            <div className="space-y-2">
              {result.greenFlags.map((flag, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  key={i} 
                  className="flex gap-3 rounded-xl border border-safe-bg bg-safe-bg p-3 text-safe-text"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div className="font-semibold">{flag}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {result.evidence.length > 0 && (
          <motion.section variants={itemVariants}>
            <h2 className="mb-5 text-2xl font-black">Supporting Evidence</h2>
            <div className="space-y-3">
              {result.evidence.map((ev, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (i * 0.1) }}
                  key={i} 
                  className="rounded-2xl border border-border-soft bg-surface p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="text-sm font-black">{ev.source}</div>
                    <span className="rounded-full bg-evidence-bg px-2 py-1 text-xs font-black text-evidence">{ev.type}</span>
                  </div>
                  <p className="mb-3 text-sm font-medium leading-6 text-muted">{ev.snippet}</p>
                  {ev.url && (
                    <a href={ev.url} target="_blank" rel="noopener noreferrer" className="hireproof-focus text-xs font-black text-evidence hover:text-safe">
                      Read full article
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {result.alternatives.length > 0 && (
          <motion.section variants={itemVariants}>
            <h2 className="mb-5 text-2xl font-black">Safer Alternatives</h2>
            <div className="space-y-3">
              {result.alternatives.map((alt, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + (i * 0.1) }}
                  key={i} 
                  className="rounded-2xl border border-safe-bg bg-safe-bg p-4 text-safe-text"
                >
                  <div className="font-black">{alt.title}</div>
                  <div className="text-sm font-semibold">{alt.company}</div>
                  {alt.salary && <div className="mt-1 text-sm font-black">{alt.salary}</div>}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        <motion.section variants={itemVariants} className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-black">
            <AlertCircle className="w-5 h-5" />
            Next Steps
          </h2>
          <ol className="list-inside list-decimal space-y-2 text-sm">
            {result.nextSteps.map((step, i) => (
              <li key={i} className="font-semibold text-muted">{step}</li>
            ))}
          </ol>
        </motion.section>

        {isDemo && (
          <motion.div variants={itemVariants} className="rounded-2xl border border-evidence-bg bg-evidence-bg p-4 text-center text-sm text-evidence">
            <span className="font-black">Demo Data</span>
            <p className="mt-1 font-semibold">This is a sample investigation. Connect live APIs for real-time verification.</p>
          </motion.div>
        )}

        <div className="text-center pb-6 print:hidden">
          {onBackToAudit ? (
            <button
              onClick={onBackToAudit}
              className="hireproof-focus rounded-xl bg-foreground px-6 py-3 font-black text-background shadow-lg hover:bg-safe"
            >
              Run Another Investigation
            </button>
          ) : (
            <a
              href="/audit"
              className="hireproof-focus inline-block rounded-xl bg-foreground px-6 py-3 font-black text-background shadow-lg hover:bg-safe"
            >
              Run Another Investigation
            </a>
          )}
        </div>
      </motion.div>
    </div>
  )
}
