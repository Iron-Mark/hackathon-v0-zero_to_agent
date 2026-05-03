'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Share2, AlertTriangle, Zap, CheckCircle2, Clock, AlertCircle, Loader2, Link2, FileText, Bot, UserCheck, ShieldCheck, SearchCheck, Table, Camera, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import html2canvas from 'html2canvas'
import RiskRadarChart from '@/components/audit/risk-radar-chart'
import { generatePdfDossier, generateCertificate } from '@/lib/generate-pdf'
import { showToast } from '@/components/system/toast'
import { Confetti } from '@/components/system/confetti'
import { buildLegalAbuseReportMailto, buildReportCsvExport } from '@/lib/report-actions.mjs'

interface Result {
  id?: string
  userFeedback?: 'helpful' | 'incorrect'
  userFeedbackReason?: string
  verdict: 'safe' | 'caution' | 'high-risk'
  riskScore: number
  confidence: string
  summary: string
  extractedClaims: Record<string, string>
  redFlags: string[]
  greenFlags: string[]
  evidence: Array<{
    id?: string
    source: string
    snippet: string
    url?: string
    type: string
    sourceType?: string
    trustLevel?: string
    matchConfidence?: number
  }>
  alternatives: Array<{
    title: string
    company: string
    salary?: string
  }>
  nextSteps: string[]
  intelligence?: {
    coverage: Record<string, string>
    companyProfileMode?: string
    companyIdentity: { status: string; officialDomain?: string; evidenceIds: string[] }
    recruiterIdentity?: { status: string; recruiterName?: string; recruiterEmailDomain?: string; evidenceIds: string[] }
    localPresence: { status: string; evidenceIds: string[] }
    marketBenchmark: {
      status: string
      claimedMonthlyAmount?: number
      comparableMonthlyAmount?: number
      currency?: string
      ratio?: number
      evidenceIds: string[]
    }
    applyPath: { status: string; submittedHost?: string; officialHost?: string; evidenceIds: string[] }
    signals: Array<{
      id: string
      label: string
      direction: 'risk' | 'trust' | 'neutral'
      severity: 'low' | 'medium' | 'high'
      weight: number
      evidenceIds: string[]
      rationale: string
    }>
    scoreTrace: Array<{ step: string; delta: number; scoreAfter: number; reason: string }>
  }
  operations?: {
    liveSearch?: { status?: string; message?: string; retryAfterSec?: number }
    salaryBenchmark?: { source?: string; country?: string; currency?: string; message?: string }
    falsePositiveControl?: { profileModeExplanation?: string }
  }
}

interface ResultScreenProps {
  result: Result
  onBackToAudit?: () => void
}

function sanitizeUrl(url?: string): string | undefined {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url
    }
    return undefined
  } catch {
    return undefined
  }
}

type ResultEvidence = Result['evidence'][number]

function isOcrEvidence(item: ResultEvidence) {
  const type = item.type.toLowerCase()
  const source = item.source.toLowerCase()
  return type.includes('screenshot ocr') || source.includes('screenshot ocr')
}

function isUnavailableOcr(item: ResultEvidence) {
  return item.type.toLowerCase().includes('unavailable') || item.source.toLowerCase().includes('unavailable')
}

function getOcrProviderLabel(item: ResultEvidence) {
  const source = item.source.toLowerCase()
  if (source.includes('google vision')) return 'Google Vision OCR'
  if (source.includes('tesseract')) return 'Tesseract fallback OCR'
  return 'Screenshot OCR'
}

function getOcrConfidenceLabel(item: ResultEvidence) {
  if (isUnavailableOcr(item)) return 'Low confidence'
  if (item.source.toLowerCase().includes('google vision')) return 'High confidence'
  return 'Medium confidence'
}

function getOcrSummary(item: ResultEvidence) {
  if (isUnavailableOcr(item)) {
    return 'Screenshot text could not be extracted. HireProof lowered confidence for this image-only evidence.'
  }
  if (item.source.toLowerCase().includes('tesseract')) {
    return 'Screenshot analyzed with fallback OCR. Text may be less accurate, so HireProof weighted this evidence lower.'
  }
  return 'Text extracted from the uploaded screenshot using Google Vision and included in the evidence review.'
}

function redactSensitiveDisplayText(value: string) {
  return String(value || '')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email redacted]')
    .replace(/\b(?:\+?\d[\d\s().-]{7,}\d)\b/g, '[phone redacted]')
    .replace(/https?:\/\/\S+/gi, '[link redacted]')
    .replace(/\b(?:token|code|otp|password|passcode)\s*[:=-]?\s*[A-Za-z0-9_-]{4,}\b/gi, '[private code redacted]')
    .replace(/\s+/g, ' ')
    .trim()
}

function shortenDisplayText(value: string, limit = 420) {
  const text = redactSensitiveDisplayText(value)
  if (text.length <= limit) return text
  return `${text.slice(0, limit).trim()}...`
}

function getOcrPreview(item: ResultEvidence) {
  return shortenDisplayText(item.snippet
    .replace(/^Extracted screenshot text using Screenshot OCR:\s*(Google Vision|Tesseract fallback)\.\s*/i, '')
    .replace(/^Screenshot text could not be extracted\.\s*/i, '')
    .trim())
}

function getEvidenceDisplaySnippet(item: ResultEvidence) {
  if (!isOcrEvidence(item)) return item.snippet
  if (isUnavailableOcr(item)) return getOcrSummary(item)
  return `${getOcrSummary(item)} Preview: ${getOcrPreview(item)}`
}

const PNG_EXPORT_PALETTES = {
  dark: {
    background: '#0c0f14',
    surface: '#121821',
    surfaceSoft: '#18212d',
    foreground: '#f8fafc',
    muted: '#a3adba',
    border: '#2a3442',
    safe: '#55f06f',
    safeBg: '#10351f',
    caution: '#facc15',
    cautionBg: '#3b2f0a',
    risk: '#ff5f57',
    riskBg: '#3a1415',
    evidence: '#7dd3fc',
    evidenceBg: '#0e2a3a',
  },
  light: {
    background: '#f8faf7',
    surface: '#ffffff',
    surfaceSoft: '#edf5ef',
    foreground: '#0b1210',
    muted: '#52615c',
    border: '#d8e2dc',
    safe: '#12864f',
    safeBg: '#dff8e7',
    caution: '#9a6b00',
    cautionBg: '#fff3c4',
    risk: '#c92a2a',
    riskBg: '#ffe2e2',
    evidence: '#0f6f9f',
    evidenceBg: '#dff4ff',
  },
} as const

function hasClass(element: HTMLElement, prefix: string) {
  return Array.from(element.classList).some((className) => className === prefix || className.startsWith(`${prefix}/`))
}

function preparePngExportClone(clonedDocument: Document, isDark: boolean) {
  const root = clonedDocument.getElementById('result-content')
  if (!(root instanceof HTMLElement)) return

  const palette = isDark ? PNG_EXPORT_PALETTES.dark : PNG_EXPORT_PALETTES.light
  root.dataset.hireproofPngExport = 'true'

  const style = clonedDocument.createElement('style')
  style.textContent = `
    [data-hireproof-png-export],
    [data-hireproof-png-export] * {
      animation: none !important;
      transition: none !important;
      box-shadow: none !important;
      text-shadow: none !important;
      filter: none !important;
      backdrop-filter: none !important;
      color-scheme: ${isDark ? 'dark' : 'light'} !important;
    }
  `
  clonedDocument.head.appendChild(style)

  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
  elements.forEach((element) => {
    element.style.boxShadow = 'none'
    element.style.textShadow = 'none'
    element.style.filter = 'none'
    element.style.backdropFilter = 'none'
    element.style.backgroundColor = 'transparent'
    element.style.backgroundImage = 'none'
    element.style.color = palette.foreground
    element.style.caretColor = palette.safe
    element.style.textDecorationColor = palette.safe
    element.style.borderColor = palette.border
    element.style.outlineColor = palette.safe

    if (element === root || hasClass(element, 'bg-background')) {
      element.style.backgroundColor = palette.background
    } else if (hasClass(element, 'bg-foreground') || hasClass(element, 'bg-white')) {
      element.style.backgroundColor = palette.foreground
    } else if (hasClass(element, 'bg-border') || hasClass(element, 'bg-border-soft')) {
      element.style.backgroundColor = palette.border
    } else if (hasClass(element, 'bg-surface') || hasClass(element, 'bg-card')) {
      element.style.backgroundColor = palette.surface
    } else if (hasClass(element, 'bg-surface-elevated')) {
      element.style.backgroundColor = palette.surfaceSoft
    } else if (hasClass(element, 'bg-safe') || hasClass(element, 'bg-safe-bg')) {
      element.style.backgroundColor = palette.safeBg
    } else if (hasClass(element, 'bg-caution') || hasClass(element, 'bg-caution-bg')) {
      element.style.backgroundColor = palette.cautionBg
    } else if (hasClass(element, 'bg-risk') || hasClass(element, 'bg-risk-bg')) {
      element.style.backgroundColor = palette.riskBg
    } else if (hasClass(element, 'bg-evidence') || hasClass(element, 'bg-evidence-bg')) {
      element.style.backgroundColor = palette.evidenceBg
    }

    if (hasClass(element, 'text-muted')) {
      element.style.color = palette.muted
    } else if (hasClass(element, 'text-background')) {
      element.style.color = palette.background
    } else if (hasClass(element, 'text-white')) {
      element.style.color = '#ffffff'
    } else if (hasClass(element, 'text-border') || hasClass(element, 'text-border-soft')) {
      element.style.color = palette.border
    } else if (hasClass(element, 'text-safe') || hasClass(element, 'text-safe-text')) {
      element.style.color = palette.safe
    } else if (hasClass(element, 'text-caution') || hasClass(element, 'text-caution-text')) {
      element.style.color = palette.caution
    } else if (hasClass(element, 'text-risk') || hasClass(element, 'text-risk-text')) {
      element.style.color = palette.risk
    } else if (hasClass(element, 'text-evidence')) {
      element.style.color = palette.evidence
    } else if (hasClass(element, 'text-foreground') || element === root) {
      element.style.color = palette.foreground
    }

    if (hasClass(element, 'border-safe') || hasClass(element, 'border-safe-bg')) {
      element.style.borderColor = palette.safe
    } else if (hasClass(element, 'border-caution') || hasClass(element, 'border-caution-bg')) {
      element.style.borderColor = palette.caution
    } else if (hasClass(element, 'border-risk') || hasClass(element, 'border-risk-bg')) {
      element.style.borderColor = palette.risk
    } else if (hasClass(element, 'border-evidence')) {
      element.style.borderColor = palette.evidence
    }
  })
}

export default function ResultScreen({ result, onBackToAudit }: ResultScreenProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null)
  const [feedbackReason, setFeedbackReason] = useState(result.userFeedbackReason || '')
  const [expandedOcr, setExpandedOcr] = useState(false)

  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(Boolean(result.userFeedback))
  const { resolvedTheme } = useTheme()
  
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

  const handleShare = async () => {
    const shareText = `HireProof verdict: ${getVerdictText(result.verdict)}\nRisk score: ${result.riskScore}/100`
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: 'HireProof investigation', text: shareText })
      return
    }
    await navigator.clipboard.writeText(shareText)
  }

  const handleDownload = async () => {
    if (!contentRef.current) return
    const isDarkExport = resolvedTheme === 'dark'
    try {
      setIsExporting(true)
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDarkExport ? PNG_EXPORT_PALETTES.dark.background : PNG_EXPORT_PALETTES.light.background,
        onclone: (clonedDocument) => preparePngExportClone(clonedDocument, isDarkExport),
      })
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `hireproof-verdict-${result.verdict}.png`
      link.click()
    } catch (error) {
      console.error('HireProof PNG export failed', error)
      showToast('PNG export failed. PDF and CSV exports are still available.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleReportCsvDownload = () => {
    const exportPayload = buildReportCsvExport(result)
    const blob = new Blob([exportPayload.content], { type: exportPayload.mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = exportPayload.filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } }
  const intelligence = result.intelligence
  const coverageEntries = intelligence
    ? Object.entries(intelligence.coverage)
    : []
  const ocrReceipt = (result.evidence || []).find(isOcrEvidence)
  const ocrPreview = ocrReceipt ? getOcrPreview(ocrReceipt) : ''
  const formatMoney = (amount?: number, currency = '') => {
    if (typeof amount !== 'number') return 'Not enough data'
    return `${currency ? `${currency} ` : ''}${amount.toLocaleString()} / month`
  }

  const submitFeedback = async (vote: 'helpful' | 'incorrect') => {
    if (feedbackGiven || !result.id) return
    setFeedbackLoading(vote)
    setFeedbackGiven(true)
    try {
      const res = await fetch('/api/intelligence/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: result.id, feedback: vote, reason: feedbackReason || undefined }),
      })
      if (res.ok) showToast('Thanks for your feedback!', 'success')
    } finally {
      setFeedbackLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {result.verdict === 'safe' && result.riskScore < 15 && <Confetti />}
      <div className="sticky top-[73px] z-10 border-b border-border-soft bg-background/95 backdrop-blur-sm print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {onBackToAudit ? (
            <button onClick={onBackToAudit} className="hireproof-focus flex items-center gap-2 rounded-lg text-sm font-black hover:text-safe">
              <ArrowLeft className="w-4 h-4" /> Back to Audit
            </button>
          ) : (
            <Link href="/audit" className="hireproof-focus flex items-center gap-2 rounded-lg text-sm font-black hover:text-safe">
              <ArrowLeft className="w-4 h-4" /> Back to Audit
            </Link>
          )}
          <div className="flex items-center gap-2" aria-label="Quick exports">
            <span className="hidden text-[10px] font-black uppercase tracking-normal text-muted sm:inline">Quick exports</span>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              title="Download PNG Screenshot"
              className="hireproof-focus flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-evidence-bg sm:w-auto sm:gap-1.5 sm:px-3"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden text-xs font-black sm:inline">PNG</span>
            </button>
            <button
              onClick={() => generatePdfDossier({
                ...result,
                timestamp: result.id ? new Date().toISOString() : undefined
              })}
              title="Download PDF dossier"
              className="hireproof-focus flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-evidence transition-colors hover:bg-evidence-bg sm:w-auto sm:gap-1.5 sm:px-3"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden text-xs font-black sm:inline">PDF</span>
            </button>
            <button
              onClick={handleReportCsvDownload}
              title="Download report CSV"
              className="hireproof-focus flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-evidence transition-colors hover:bg-evidence-bg sm:w-auto sm:gap-1.5 sm:px-3"
            >
              <Table className="w-4 h-4" />
              <span className="hidden text-xs font-black sm:inline">CSV</span>
            </button>
            <button
              onClick={handleShare}
              title="Share verdict"
              aria-label="Share verdict"
              className="hireproof-focus flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-evidence transition-colors hover:bg-evidence-bg sm:w-auto sm:gap-1.5 sm:px-3"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden text-xs font-black sm:inline">Share</span>
            </button>
            {result.verdict === 'safe' && (
              <button
                onClick={() => generateCertificate({
                  company: result.extractedClaims.company || 'Verified Organization',
                  role: result.extractedClaims.role || 'Verified Role',
                  timestamp: new Date().toISOString()
                })}
                title="Download Safety Certificate"
                className="hireproof-focus flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface hover:bg-evidence-bg text-safe transition-colors"
              >
                <UserCheck className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" ref={contentRef} id="result-content" className="mx-auto max-w-4xl space-y-10 px-4 py-10 relative">
        <motion.section variants={itemVariants} data-testid="audit-result-verdict" className="relative z-10 rounded-2xl border p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-border-soft bg-surface/50 p-8 shadow-sm backdrop-blur-sm relative overflow-hidden">
            <div className="bot-scan-line opacity-10" />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-safe/10 border border-safe/20 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-safe" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">HireProof Verdict</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" />
                    Evidence-backed report
                  </div>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-normal ${getVerdictBg(result.verdict)} ${getVerdictColor(result.verdict)}`}>
                {result.verdict === 'high-risk' ? <AlertTriangle className="h-3.5 w-3.5" /> :
                 result.verdict === 'caution' ? <Zap className="h-3.5 w-3.5" /> :
                 <CheckCircle2 className="h-3.5 w-3.5" />}
                {getVerdictText(result.verdict)} verdict
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-7xl font-black tracking-tighter ${getVerdictColor(result.verdict)}`}>
                  {result.riskScore}
                </span>
                <span className="text-xl font-bold text-muted opacity-40">/100</span>
              </div>
              <p className="max-w-md text-base font-semibold leading-relaxed text-muted">
                HireProof checked the listing against the available evidence and risk signals. 
                <span className="text-foreground"> Confidence: {result.confidence}.</span>
              </p>
            </div>

            <div className="relative h-40 w-40 flex items-center justify-center lg:h-48 lg:w-48 group">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-border-soft" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="282.7"
                  initial={{ strokeDashoffset: 282.7 }}
                  animate={{ strokeDashoffset: 282.7 - (282.7 * result.riskScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={getVerdictColor(result.verdict)}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-sm font-black uppercase tracking-widest ${getVerdictColor(result.verdict)}`}>
                  {result.verdict}
                </span>
                <div className="mt-1 h-1 w-8 rounded-full bg-border-soft overflow-hidden">
                  <motion.div animate={{ x: [-32, 32] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="h-full w-full bg-white/20" />
                </div>
              </div>
            </div>
            <div className="mt-5 grid w-full gap-3 border-t border-border-soft pt-5 sm:grid-cols-3">
              <div className="rounded-xl border border-border-soft bg-background p-3">
                <div className="text-[10px] font-black uppercase tracking-normal text-muted">Evidence receipts</div>
                <div className="mt-1 text-xl font-black">{result.evidence.length}</div>
              </div>
              <div className="rounded-xl border border-border-soft bg-background p-3">
                <div className="text-[10px] font-black uppercase tracking-normal text-muted">Next steps</div>
                <div className="mt-1 text-xl font-black">{result.nextSteps.length}</div>
              </div>
              <div className="rounded-xl border border-border-soft bg-background p-3">
                <div className="text-[10px] font-black uppercase tracking-normal text-muted">Confidence</div>
                <div className="mt-1 truncate text-xl font-black">{result.confidence}</div>
              </div>
            </div>
          </div>
        </motion.section>

        {ocrReceipt && (
          <motion.section variants={itemVariants} data-testid="ocr-evidence-receipt" className="rounded-[2rem] border border-evidence/30 bg-evidence/5 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                  isUnavailableOcr(ocrReceipt)
                    ? 'border-caution-bg bg-caution-bg text-caution-text'
                    : 'border-evidence/25 bg-background text-evidence'
                }`}>
                  {isUnavailableOcr(ocrReceipt) ? <AlertCircle className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black">Screenshot analyzed</h2>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                      isUnavailableOcr(ocrReceipt)
                        ? 'bg-caution-bg text-caution-text'
                        : ocrReceipt.source.toLowerCase().includes('google vision')
                          ? 'bg-safe-bg text-safe-text'
                          : 'bg-evidence-bg text-evidence'
                    }`}>
                      {getOcrConfidenceLabel(ocrReceipt)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-muted">{getOcrProviderLabel(ocrReceipt)}</p>
                  <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted">{getOcrSummary(ocrReceipt)}</p>
                </div>
              </div>
              {ocrPreview && !isUnavailableOcr(ocrReceipt) && (
                <button
                  type="button"
                  aria-expanded={expandedOcr}
                  aria-controls="ocr-extracted-text"
                  onClick={() => setExpandedOcr((value) => !value)}
                  className="hireproof-focus inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-evidence/25 bg-background px-4 py-2 text-sm font-black text-evidence transition-colors hover:bg-evidence-bg"
                >
                  {expandedOcr ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {expandedOcr ? 'Hide extracted text' : 'Show extracted text'}
                </button>
              )}
            </div>
            {ocrPreview && !isUnavailableOcr(ocrReceipt) && expandedOcr && (
              <div id="ocr-extracted-text" className="mt-5 rounded-2xl border border-border-soft bg-background p-4">
                <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted">Extracted text preview</div>
                <p className="max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-xs font-semibold leading-6 text-muted">
                  {ocrPreview}
                </p>
              </div>
            )}
          </motion.section>
        )}

        <motion.section variants={itemVariants} className="rounded-[2.5rem] border border-border-soft bg-surface p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-black mb-2">Risk Breakdown</h2>
            <p className="text-sm font-semibold text-muted">How the AI scored each dimension of this opportunity.</p>
          </div>
          <RiskRadarChart
            extractedClaims={result.extractedClaims as any}
            redFlags={result.redFlags}
            greenFlags={result.greenFlags}
            evidence={result.evidence}
            verdict={result.verdict}
          />
        </motion.section>

        <motion.section variants={itemVariants} className="overflow-hidden rounded-[2.5rem] border border-border-soft bg-background shadow-2xl relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_50%)]" />
          <div className="flex flex-col md:flex-row relative z-10">
            <div className="flex-1 p-8 lg:p-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-evidence-bg text-evidence flex items-center justify-center">
                  <SearchCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black">Evidence Coverage</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">V2 intelligence report</p>
                </div>
              </div>
              <p className="mb-8 text-base font-medium leading-relaxed text-muted">
                HireProof checks company identity, apply path, local footprint, reputation, and market salary against visible evidence. The verdict is based on these receipts, not hidden model guesses.
              </p>
              {result.operations?.liveSearch?.status && result.operations.liveSearch.status !== 'ok' && result.operations.liveSearch.status !== 'not-live' && (
                <div className="mb-4 rounded-xl border border-caution/30 bg-caution/10 p-4 text-xs font-bold leading-6 text-caution-text">
                  {result.operations.liveSearch.message}
                </div>
              )}
              {result.operations?.falsePositiveControl?.profileModeExplanation && (
                <div className="mb-4 rounded-xl border border-safe/25 bg-safe/10 p-4 text-xs font-bold leading-6 text-safe-text">
                  {result.operations.falsePositiveControl.profileModeExplanation}
                </div>
              )}
              {result.operations?.salaryBenchmark?.message && (
                <div className="mb-4 rounded-xl border border-border-soft bg-background p-4 text-xs font-bold leading-6 text-muted">
                  {result.operations.salaryBenchmark.message}
                </div>
              )}
              
              <div className="grid gap-3 sm:grid-cols-2">
                {coverageEntries.length > 0 ? coverageEntries.map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-border-soft bg-surface p-4">
                    <div className="text-[10px] font-black uppercase tracking-normal text-muted">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className={`mt-1 text-sm font-black capitalize ${
                      value === 'verified' || value === 'clear' || value === 'normal' || value === 'official'
                        ? 'text-safe-text'
                        : value === 'risk' || value === 'anomalous' || value === 'mismatch'
                          ? 'text-risk-text'
                          : 'text-caution-text'
                    }`}>
                      {value.replace('-', ' ')}
                    </div>
                  </div>
                )) : (
                  <div className="rounded-xl border border-border-soft bg-surface p-4 sm:col-span-2">
                    <div className="text-sm font-bold text-muted">Legacy report: structured v2 coverage was not included in this result.</div>
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-3 border-t border-border-soft pt-6 sm:grid-cols-4">
                <div className="rounded-xl border border-border-soft bg-surface p-4">
                  <div className="text-[10px] font-black uppercase tracking-normal text-muted">Profile Mode</div>
                  <div className="mt-1 text-sm font-black capitalize">{(intelligence?.companyProfileMode || 'Legacy').replace('_', ' ')}</div>
                </div>
                <div className="rounded-xl border border-border-soft bg-surface p-4">
                  <div className="text-[10px] font-black uppercase tracking-normal text-muted">Company Identity</div>
                  <div className="mt-1 text-sm font-black capitalize">{intelligence?.companyIdentity.status || 'Legacy'}</div>
                  {intelligence?.companyIdentity.officialDomain && <div className="mt-1 truncate text-xs font-semibold text-muted">{intelligence.companyIdentity.officialDomain}</div>}
                </div>
                <div className="rounded-xl border border-border-soft bg-surface p-4">
                  <div className="text-[10px] font-black uppercase tracking-normal text-muted">Recruiter Identity</div>
                  <div className={`mt-1 text-sm font-black capitalize ${intelligence?.recruiterIdentity?.status === 'risky' ? 'text-risk-text' : ''}`}>
                    {intelligence?.recruiterIdentity?.status || 'Legacy'}
                  </div>
                  {intelligence?.recruiterIdentity?.recruiterEmailDomain && <div className="mt-1 truncate text-xs font-semibold text-muted">{intelligence.recruiterIdentity.recruiterEmailDomain}</div>}
                </div>
                <div className="rounded-xl border border-border-soft bg-surface p-4">
                  <div className="text-[10px] font-black uppercase tracking-normal text-muted">Apply Path</div>
                  <div className={`mt-1 text-sm font-black capitalize ${intelligence?.applyPath.status === 'mismatch' ? 'text-risk-text' : ''}`}>
                    {intelligence?.applyPath.status || 'Legacy'}
                  </div>
                  {intelligence?.applyPath.submittedHost && <div className="mt-1 truncate text-xs font-semibold text-muted">{intelligence.applyPath.submittedHost}</div>}
                </div>
                <div className="rounded-xl border border-border-soft bg-surface p-4 sm:col-span-2">
                  <div className="text-[10px] font-black uppercase tracking-normal text-muted">Market Salary</div>
                  <div className={`mt-1 text-sm font-black capitalize ${intelligence?.marketBenchmark.status === 'anomalous' ? 'text-risk-text' : ''}`}>
                    {intelligence?.marketBenchmark.status || 'Legacy'}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-muted">
                    {formatMoney(intelligence?.marketBenchmark.claimedMonthlyAmount, intelligence?.marketBenchmark.currency)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`flex w-full flex-col items-center justify-center p-10 md:w-80 relative overflow-hidden border-t md:border-t-0 md:border-l border-border-soft ${result.riskScore > 60 ? 'bg-risk-bg/5' : 'bg-safe/5'}`}>
              <div className="bot-scan-line opacity-20" />
              <div className="mb-4 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-muted">Score Trace</div>
              <div className={`text-center text-3xl font-black leading-tight tracking-tighter ${result.riskScore > 60 ? 'text-risk-text' : 'text-safe'}`}>
                {result.riskScore}/100
              </div>
              <div className="mt-6 w-full space-y-2">
                {(intelligence?.scoreTrace || []).slice(-4).map((trace, index) => (
                  <div key={`${trace.step}-${index}`} className="rounded-xl border border-border-soft bg-background p-3 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-normal text-muted">{trace.step}</span>
                      <span className={`text-xs font-black ${trace.delta > 0 ? 'text-risk-text' : trace.delta < 0 ? 'text-safe-text' : 'text-muted'}`}>
                        {trace.delta > 0 ? '+' : ''}{trace.delta}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-semibold leading-5 text-muted">{trace.reason}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-background border border-border-soft shadow-inner">
                {result.riskScore > 60 ? <AlertTriangle className="h-8 w-8 text-risk-text" /> : <ShieldCheck className="h-8 w-8 text-safe" />}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Investigation Timeline Section */}
        <motion.section variants={itemVariants} className="rounded-3xl border border-border-soft bg-surface p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Clock className="h-32 w-32" />
          </div>
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
            <Zap className="h-6 w-6 text-safe" />
            Investigation Timeline
          </h2>
          <div className="relative space-y-8 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border-soft">
            {[
              { time: 'T+0.0s', step: 'Initialization', detail: 'Loading job verification checks.', icon: Bot, color: 'text-muted' },
              { time: 'T+0.4s', step: 'Entity Extraction', detail: `Identified ${result.extractedClaims.company || 'company'} and ${result.extractedClaims.role || 'role'} from raw input.`, icon: FileText, color: 'text-evidence' },
              { time: 'T+1.2s', step: 'Signal Verification', detail: `Reviewing ${result.redFlags.length + result.greenFlags.length} risk and safety signals from the report.`, icon: SearchCheck, color: 'text-caution' },
              { time: 'T+2.1s', step: 'Final Verdict', detail: `Investigation complete. Risk score assigned: ${result.riskScore}/100.`, icon: UserCheck, color: 'text-safe' },
            ].map((step, i) => (
              <div key={i} className="relative pl-12 group">
                <div className={`absolute left-0 top-1 h-9 w-9 rounded-full bg-background border border-border-soft flex items-center justify-center z-10 transition-colors group-hover:border-safe/50 ${step.color}`}>
                  <step.icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest">{step.step}</h4>
                    <p className="text-sm font-medium text-muted mt-1 leading-relaxed">{step.detail}</p>
                  </div>
                  <div className="font-mono text-[10px] font-bold text-muted bg-surface px-2 py-1 rounded-md border border-border-soft">{step.time}</div>
                </div>
              </div>
            ))}
          </div>
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

        {(result.redFlags || []).length > 0 && (
          <motion.section variants={itemVariants}>
            <h2 className="mb-5 flex items-center gap-2 text-2xl font-black text-risk-text">
              <AlertTriangle className="w-5 h-5" />
              Red Flags
            </h2>
            <div className="space-y-2">
              {(result.redFlags || []).map((flag, i) => (
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

        {(result.evidence || []).length > 0 && (
          <motion.section variants={itemVariants}>
            <h2 className="mb-5 text-2xl font-black">Evidence receipts</h2>
            <div className="space-y-3">
              {(result.evidence || []).map((ev, i) => (
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
                  <p className="mb-3 text-sm font-medium leading-6 text-muted">{getEvidenceDisplaySnippet(ev)}</p>
                  {sanitizeUrl(ev.url) && (
                    <a href={sanitizeUrl(ev.url)} target="_blank" rel="noopener noreferrer" className="hireproof-focus text-xs font-black text-evidence hover:text-safe">
                      Open source
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
            Next step
          </h2>
          <ol className="space-y-3 text-sm">
            {result.nextSteps.map((step, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-border-soft bg-background p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-evidence-bg text-xs font-black text-evidence">
                  {i + 1}
                </span>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-normal text-muted">Next step</div>
                  <div className="font-semibold text-muted">{step}</div>
                </div>
              </li>
            ))}
          </ol>
          {result.verdict === 'high-risk' && (
            <div className="mt-6 border-t border-border-soft pt-4">
              <a
                href={buildLegalAbuseReportMailto(result)}
                className="hireproof-focus flex w-full items-center justify-center gap-2 rounded-xl bg-risk px-4 py-3 text-sm font-black text-background hover:opacity-90"
              >
                <AlertTriangle className="h-4 w-4" />
                Generate Legal Abuse Report
              </a>
              <p className="mt-2 text-center text-xs font-semibold text-muted">
                1-Click draft an abuse report to global anti-phishing authorities.
              </p>
            </div>
          )}
        </motion.section>



        <div className="text-center pb-6 print:hidden">
          <div className="mb-10 rounded-2xl border border-border-soft bg-surface/30 p-6">
            <p className="mb-4 text-xs font-black uppercase tracking-wider text-muted">
              {feedbackGiven ? 'Thank you for your feedback!' : 'Was this investigation accurate?'}
            </p>
            {!feedbackGiven && (
              <select
                value={feedbackReason}
                onChange={(event) => setFeedbackReason(event.target.value)}
                className="mb-4 w-full max-w-sm rounded-xl border border-border-soft bg-background px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-safe"
                aria-label="Feedback reason"
              >
                <option value="">Optional reason</option>
                <option value="false_positive">False positive</option>
                <option value="missed_risk">Missed risk</option>
                <option value="stale_evidence">Stale evidence</option>
                <option value="salary_wrong">Salary benchmark wrong</option>
                <option value="company_match_wrong">Company match wrong</option>
                <option value="recruiter_match_wrong">Recruiter match wrong</option>
                <option value="other">Other</option>
              </select>
            )}
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => submitFeedback('helpful')}
                disabled={feedbackGiven || !result.id || !!feedbackLoading}
                className="hireproof-focus flex items-center gap-2 rounded-full border border-border px-6 py-2 text-sm font-bold hover:bg-safe/10 hover:text-safe disabled:opacity-50 disabled:pointer-events-none"
              >
                {feedbackLoading === 'helpful' ? <Loader2 className="w-4 h-4 animate-spin" /> : '👍'} Helpful
              </button>
              <button 
                onClick={() => submitFeedback('incorrect')}
                disabled={feedbackGiven || !result.id || !!feedbackLoading}
                className="hireproof-focus flex items-center gap-2 rounded-full border border-border px-6 py-2 text-sm font-bold hover:bg-risk/10 hover:text-risk disabled:opacity-50 disabled:pointer-events-none"
              >
                {feedbackLoading === 'incorrect' ? <Loader2 className="w-4 h-4 animate-spin" /> : '👎'} Incorrect
              </button>
            </div>
            <div className="mt-6 border-t border-border-soft pt-4">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                Is this your company? <a href="/docs/legal" className="text-safe hover:underline">Report a false positive</a>
              </p>
            </div>
          </div>

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
