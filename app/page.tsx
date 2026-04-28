'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { ArrowRight, CheckCircle2, AlertCircle, Globe, TrendingUp, MapPin, ShieldAlert, SearchCheck, FileText, Sparkles, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { SiteHeader } from '@/components/site-header'
import { BrandMark } from '@/components/brand-mark'

const flags = [
  'PHP 80,000/week for an internship',
  'No interview or formal application path',
  'Telegram-only contact',
]

const steps = [
  { icon: FileText, title: 'Extract claims', description: 'Pull out role, pay, company, location, contact path, and urgency signals.' },
  { icon: SearchCheck, title: 'Check receipts', description: 'Compare the post against company footprint, reputation, job boards, and local signals.' },
  { icon: ShieldAlert, title: 'Return verdict', description: 'Show Safe, Caution, or High-Risk with a risk score and next steps.' },
]

const evidenceSignals = [
  { icon: Globe, title: 'Company web presence', description: 'Official sites, hiring pages, LinkedIn profiles, and domain details.' },
  { icon: AlertCircle, title: 'Recent reputation', description: 'News, reviews, scam reports, media mentions, and public complaints.' },
  { icon: TrendingUp, title: 'Comparable listings', description: 'Similar legitimate jobs to catch unrealistic pay or role expectations.' },
  { icon: MapPin, title: 'Local footprint', description: 'Maps, directories, registrations, and location consistency.' },
]

const pitchDemos = [
  { href: '/audit?demo=high-risk', icon: AlertCircle, label: 'High-risk', description: 'Unrealistic pay, no interview, Telegram contact.', className: 'border-risk-bg bg-risk-bg text-risk-text' },
  { href: '/audit?demo=caution', icon: Zap, label: 'Caution', description: 'Some legitimacy, but incomplete details.', className: 'border-caution-bg bg-caution-bg text-caution-text' },
  { href: '/audit?demo=safe', icon: CheckCircle2, label: 'Safe', description: 'Established company and professional path.', className: 'border-safe-bg bg-safe-bg text-safe-text' },
]

const typingPhrases = [
  'Remote frontend intern. PHP 80,000/week...',
  'Join our team at TechStart Solutions...',
  'Senior Software Engineer at Microsoft...',
  'Urgent! Data entry clerk needed, $5000/week...',
]

function TypewriterEffect() {
  const [text, setText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const phrase = typingPhrases[phraseIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(phrase.slice(0, charIndex + 1))
        setCharIndex(charIndex + 1)
        if (charIndex + 1 >= phrase.length) {
          setTimeout(() => setIsDeleting(true), 1800)
        }
      } else {
        setText(phrase.slice(0, charIndex - 1))
        setCharIndex(charIndex - 1)
        if (charIndex <= 1) {
          setIsDeleting(false)
          setPhraseIndex((phraseIndex + 1) % typingPhrases.length)
        }
      }
    }, isDeleting ? 30 : 55)
    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, phraseIndex])

  return (
    <span className="text-safe">
      {text}<span className="animate-pulse">|</span>
    </span>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const cardReveal = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 20 } },
}

export default function Home() {
  const heroRef = useRef<HTMLElement>(null)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section ref={heroRef} className="hireproof-grid border-b border-border-soft overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:py-16">
          <motion.div
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.div variants={fadeUp} custom={0} className="mb-6 flex items-center gap-3">
              <BrandMark className="h-14 w-14 shrink-0 shadow-lg" />
              <div>
                <p className="text-sm font-black uppercase tracking-normal text-safe">HireProof</p>
                <p className="text-sm font-semibold text-muted">Job-post verification with receipts</p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} className="mb-5 inline-flex items-center gap-2 rounded-full border border-risk-bg bg-risk-bg px-3 py-1 text-sm font-bold text-risk-text">
              <ShieldAlert className="h-4 w-4" />
              Built for suspicious job posts
            </motion.div>

            <motion.h1 variants={fadeUp} custom={2} className="text-4xl font-black leading-tight text-balance sm:text-5xl">
              Know if a job post is legit before you apply.
            </motion.h1>

            <motion.div variants={fadeUp} custom={3} className="mt-5 max-w-xl text-lg font-medium leading-8 text-muted">
              <p>Paste a recruiter message, job listing, or apply URL.</p>
              <div className="mt-3 rounded-xl border border-border-soft bg-surface px-4 py-3 font-mono text-sm">
                <span className="text-muted">&gt; </span><TypewriterEffect />
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/audit"
                className="hireproof-focus inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-6 py-3 font-bold text-white shadow-lg hover:bg-safe transition-colors"
              >
                Start investigation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/audit?demo=high-risk"
                className="hireproof-focus inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface/85 px-6 py-3 font-bold hover:bg-white transition-colors"
              >
                Quick demo
              </Link>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mt-6 grid gap-2 sm:grid-cols-3">
              {pitchDemos.map((demo) => {
                const Icon = demo.icon
                return (
                  <motion.div key={demo.href} variants={cardReveal}>
                    <Link
                      href={demo.href}
                      className={`hireproof-focus block rounded-xl border p-3 text-left shadow-sm transition hover:shadow-md ${demo.className}`}
                    >
                      <div className="mb-2 flex items-center gap-2 text-sm font-black">
                        <Icon className="h-4 w-4" />
                        {demo.label}
                      </div>
                      <p className="text-xs font-semibold leading-5">{demo.description}</p>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>

          {/* Report card with staggered animation */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: -8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hireproof-card rounded-2xl p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-border-soft pb-4">
              <div>
                <p className="text-sm font-black">Investigation report</p>
                <p className="text-xs font-semibold text-muted">Remote Frontend Intern</p>
              </div>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.8, stiffness: 300 }}
                className="rounded-full bg-risk-bg px-3 py-1 text-sm font-black text-risk-text"
              >
                High-Risk
              </motion.span>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-border-soft bg-background p-4">
                <div className="mb-2 flex items-end justify-between text-sm">
                  <span className="font-semibold text-muted">Risk score</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-3xl font-black text-high-risk"
                  >
                    92
                  </motion.span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-border-soft">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full bg-high-risk"
                  />
                </div>
              </div>
              {flags.map((flag, i) => (
                <motion.div
                  key={flag}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + i * 0.15, duration: 0.4 }}
                  className="flex gap-3 rounded-xl border border-risk-bg bg-risk-bg/70 p-3 text-sm font-semibold text-risk-text"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{flag}</span>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="rounded-xl border border-safe-bg bg-safe-bg p-4 text-sm text-safe-text"
              >
                <div className="mb-2 flex items-center gap-2 font-black">
                  <CheckCircle2 className="h-4 w-4" />
                  Safer next step
                </div>
                Compare the opportunity against verified job boards before replying.
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border-soft bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[360px_1fr]">
          <div>
            <div className="mb-3 inline-flex rounded-full bg-evidence-bg px-3 py-1 text-xs font-black uppercase tracking-normal text-evidence">
              Example input
            </div>
            <h2 className="text-2xl font-black">Suspicious opportunity</h2>
          </div>
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <p><strong>Position:</strong> Remote Frontend Intern</p>
              <p><strong>Salary:</strong> PHP 80,000 per week</p>
              <p><strong>Location:</strong> Remote</p>
              <p><strong>Contact:</strong> Message us on Telegram</p>
              <p className="sm:col-span-2"><strong>Requirements:</strong> Basic HTML/CSS knowledge, no interview needed</p>
            </div>
            <Link href="/audit?demo=high-risk" className="hireproof-focus mt-5 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-bold text-white hover:bg-safe transition-colors">
              Run quick demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border-soft">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-safe">Workflow</p>
              <h2 className="text-2xl font-black">How it works</h2>
            </div>
            <p className="max-w-xl text-sm font-semibold leading-6 text-muted">
              The interface is intentionally report-first: every verdict should feel backed by visible evidence.
            </p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-4 md:grid-cols-3"
          >
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div key={step.title} variants={cardReveal} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-safe-bg text-safe">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mb-2 text-xs font-black uppercase tracking-normal text-muted">Step {index + 1}</div>
                  <h3 className="font-black">{step.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-muted">{step.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      <section className="border-b border-border-soft bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-8 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-evidence" />
            <h2 className="text-2xl font-black">Evidence signals</h2>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-5 md:grid-cols-2"
          >
            {evidenceSignals.map((signal) => {
              const Icon = signal.icon
              return (
                <motion.div key={signal.title} variants={cardReveal} className="flex gap-4 rounded-2xl border border-border-soft bg-background p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-evidence-bg text-evidence">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black">{signal.title}</h3>
                    <p className="mt-1 text-sm font-medium leading-6 text-muted">{signal.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      <footer className="bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm font-semibold text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>HireProof. Job-post verification with receipts.</p>
          <Link href="/audit?demo=high-risk" className="hireproof-focus inline-flex items-center gap-2 rounded-lg text-foreground hover:text-safe transition-colors">
            Try demo mode <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </div>
  )
}
