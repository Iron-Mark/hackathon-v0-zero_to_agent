'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { ArrowRight, CheckCircle2, AlertCircle, Globe, TrendingUp, MapPin, ShieldAlert, SearchCheck, FileText, Sparkles, Zap, Bot, Terminal, Cpu, RefreshCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SpotTheBot } from '@/components/spot-the-bot'
import { BrandMark } from '@/components/brand-mark'
import { ImpactTicker } from '@/components/impact-ticker'
import { WorldMap } from '@/components/world-map'
import { DEMO_FIXTURES } from '@/lib/fixtures'

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

const heroEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

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
  show: (i: number) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { delay: i * 0.12, duration: 0.5, ease: heroEase } 
  }),
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [activeDemo, setActiveDemo] = useState<'high-risk' | 'caution' | 'safe'>('high-risk')

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const [activeReports, setActiveReports] = useState<any[]>([
    { company: 'Meta (Simulation)', role: 'Senior UX Designer', status: 'verified', time: '2m ago' },
    { company: 'Apex Crypto', role: 'Remote Trader', status: 'high-risk', time: '14m ago' },
    { company: 'Global Logistics', role: 'Admin Assistant', status: 'caution', time: '21m ago' },
    { company: 'TechStart Inc', role: 'DevOps Intern', status: 'verified', time: '38m ago' },
  ])

  useEffect(() => {
    fetch('/api/intelligence/reports?limit=4')
      .then(res => res.json())
      .then(data => {
        if (data.reports?.length > 0) {
          setActiveReports(data.reports.slice(0, 4).map((r: any) => ({
            company: r.extractedClaims.company,
            role: r.extractedClaims.role,
            status: r.verdict,
            time: 'Recently'
          })))
        }
      })
      .catch(() => {})
  }, [])
  const demoData = {
    'high-risk': {
      fixture: DEMO_FIXTURES.highRisk,
      shortDesc: 'Unrealistic pay, no interview, Telegram contact.',
      colorClass: 'text-high-risk',
      bgClass: 'bg-risk-bg',
      progressClass: 'bg-high-risk'
    },
    'caution': {
      fixture: DEMO_FIXTURES.caution,
      shortDesc: 'Some legitimacy, but incomplete details.',
      colorClass: 'text-caution',
      bgClass: 'bg-caution-bg',
      progressClass: 'bg-caution'
    },
    'safe': {
      fixture: DEMO_FIXTURES.safe,
      shortDesc: 'Established company and professional path.',
      colorClass: 'text-safe',
      bgClass: 'bg-safe-bg',
      progressClass: 'bg-safe'
    }
  }

  const current = demoData[activeDemo]
  const fixture = current.fixture

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ImpactTicker />
      <SiteHeader />

      <section ref={heroRef} className="hireproof-grid border-b border-border-soft overflow-hidden relative group">
        <div 
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, var(--hireproof-safe-bg), transparent 80%)`,
          }}
        />
        <div className="mx-auto grid max-w-[1600px] gap-10 px-6 md:px-12 lg:px-20 xl:px-32 py-12 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:py-16 relative z-10">
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
              <div className="mt-3 rounded-xl border border-border-soft bg-surface/80 dark:bg-black p-4 font-mono text-xs shadow-2xl relative overflow-hidden group backdrop-blur-md">
                <div className="absolute top-0 left-0 w-1 h-full bg-safe/50" />
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <div className="h-2 w-2 rounded-full bg-risk-text" />
                  <div className="h-2 w-2 rounded-full bg-caution" />
                  <div className="h-2 w-2 rounded-full bg-safe" />
                  <span className="ml-2 text-[8px] uppercase tracking-widest text-muted dark:text-white/70">hireproof-terminal v1.0.4</span>
                </div>
                <div className="text-foreground dark:text-white/90">
                  <span className="text-safe mr-2">investigator@hireproof:~$</span><TypewriterEffect />
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/audit"
                className="hireproof-focus inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-2.5 font-bold text-background shadow-lg hover:bg-safe transition-colors"
              >
                Start investigation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/audit?demo=high-risk"
                className="hireproof-focus inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface/85 px-5 py-2.5 font-bold hover:bg-background transition-colors"
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

          <div className="flex flex-col gap-6">
            <div className="p-1.5 bg-surface border border-border-soft rounded-[20px] flex items-center w-full shadow-inner">
              {(['high-risk', 'caution', 'safe'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveDemo(tab)}
                  className={`relative flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    activeDemo === tab ? 'text-background' : 'text-muted hover:text-foreground'
                  }`}
                >
                  <span className="relative z-10">{tab.replace('-', ' ')}</span>
                  {activeDemo === tab && (
                    <motion.div 
                      layoutId="activeTabPill"
                      transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.35 }}
                      className="absolute inset-0 bg-foreground rounded-[14px] shadow-lg"
                    />
                  )}
                </button>
              ))}
            </div>

            <motion.div
              key={activeDemo}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                perspective: '1000px',
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div className="px-1">
                <p className="text-sm font-bold text-muted">
                  {demoData[activeDemo].shortDesc}
                </p>
              </div>

              <motion.div 
                whileHover={{ rotateX: 2, rotateY: -2, scale: 1.01 }}
                className="hireproof-card relative rounded-3xl p-6 border border-border-soft shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-safe/20"
              >
                <div className={`absolute top-0 left-0 w-full h-1 ${current.progressClass}`} />
                
                <div className="mb-6 flex items-center justify-between gap-4 border-b border-border-soft pb-4">
                <div>
                  <p className="text-sm font-black">Investigation report</p>
                  <p className="text-xs font-semibold text-muted">{fixture.extractedClaims.role}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-black uppercase ${current.bgClass} ${current.colorClass}`}>
                  {fixture.verdict.replace('-', ' ')}
                </span>
              </div>
              <div className="space-y-5">
                <div className="rounded-xl border border-border-soft bg-background p-4">
                  <div className="mb-2 flex items-end justify-between text-sm">
                    <span className="font-semibold text-muted">Risk score</span>
                    <span className={`text-3xl font-black ${current.colorClass}`}>
                      {fixture.riskScore}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-border-soft">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${fixture.riskScore}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${current.progressClass}`}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  {(fixture.redFlags.length > 0 ? fixture.redFlags.slice(0, 3) : fixture.greenFlags.slice(0, 3)).map((flag, i) => (
                    <motion.div
                      key={flag}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                      className={`flex gap-3 rounded-xl border p-3 text-sm font-semibold ${
                        fixture.verdict === 'safe' 
                          ? 'border-safe-bg bg-safe-bg/70 text-safe-text' 
                          : fixture.verdict === 'caution'
                            ? 'border-caution-bg bg-caution-bg/70 text-caution-text'
                            : 'border-risk-bg bg-risk-bg/70 text-risk-text'
                      }`}
                    >
                      {fixture.verdict === 'safe' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                      <span>{flag}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-xl border border-safe-bg bg-safe-bg p-4 text-sm text-safe-text"
                >
                  <div className="mb-2 flex items-center gap-2 font-black">
                    <CheckCircle2 className="h-4 w-4" />
                    Next step
                  </div>
                  {fixture.nextSteps[0]}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Live Intelligence Stream */}
    <section className="border-b border-border-soft bg-background/50 py-20 relative overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#10b98105,transparent_50%)]" />
      
      {/* Dynamic Background Map */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-5xl">
          <WorldMap />
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-20 xl:px-32 relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-safe"></span>
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-safe">Real-time Forensic Telemetry</h3>
            </div>
            <h2 className="text-3xl font-black lg:text-4xl tracking-tight">Global Investigative Activity</h2>
            <p className="mt-4 text-sm font-medium text-muted leading-relaxed">
              Monitoring programmatic hiring patterns across 142 discrete job networks. Our autonomous agents are actively neutralizing high-risk phishing vectors.
            </p>
          </div>
          <Link href="/explore" className="hireproof-focus inline-flex items-center gap-3 rounded-2xl bg-foreground px-6 py-3 text-xs font-black text-background hover:bg-safe transition-all shadow-xl">
            Open Intelligence Hub
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activeReports.map((audit, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl border border-border-soft bg-surface/50 p-5 backdrop-blur-sm transition-all hover:border-safe/30 hover:shadow-2xl hover:shadow-safe/5">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-safe/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="mb-4 flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                  audit.status === 'verified' || audit.status === 'safe' ? 'bg-safe/10 text-safe border border-safe/20' : 
                  audit.status === 'high-risk' || audit.status === 'risk' ? 'bg-risk-bg/10 text-risk-text border border-risk-bg/20' : 
                  'bg-caution-bg/10 text-caution-text border border-caution-bg/20'
                }`}>
                  {audit.status}
                </span>
                <span className="text-[10px] font-bold text-muted">{audit.time}</span>
              </div>
              <div className="text-sm font-black text-foreground group-hover:text-safe transition-colors truncate">{audit.role}</div>
              <div className="text-xs font-medium text-muted mt-1">{audit.company}</div>
              <div className="absolute -right-4 -bottom-4 opacity-0 transition-all group-hover:opacity-5 group-hover:-translate-x-2">
                <BrandMark className="h-16 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>


      {/* How it works */}
      <section className="border-b border-border-soft bg-surface">
        <div className="mx-auto grid max-w-[1600px] gap-8 px-6 md:px-12 lg:px-20 xl:px-32 py-14 lg:grid-cols-[360px_1fr]">
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
            <Link href="/audit?demo=high-risk" className="hireproof-focus mt-5 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-bold text-background hover:bg-safe transition-colors">
              Run quick demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border-soft">
        <div className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-20 xl:px-32 py-14">
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
        <div className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-20 xl:px-32 py-14">
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
                <motion.div key={signal.title} variants={cardReveal} className="group relative flex gap-4 rounded-2xl border border-border-soft bg-background p-5 overflow-hidden transition-all hover:border-evidence/50 hover:shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-evidence/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-evidence-bg text-evidence relative z-10 shadow-inner group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black">{signal.title}</h3>
                      <div className="h-1 w-1 rounded-full bg-evidence animate-pulse opacity-0 group-hover:opacity-100" />
                    </div>
                    <p className="mt-1 text-sm font-medium leading-6 text-muted">{signal.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Dead Internet Theory Section */}
      <section className="relative overflow-hidden bg-background py-24 text-foreground border-b border-border-soft">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 text-foreground">
          <div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>
        
        <div className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-20 xl:px-32 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-risk-bg bg-risk-bg/50 px-3 py-1 text-xs font-black uppercase tracking-widest text-risk-text">
                <Bot className="h-4 w-4" />
                The Dead Internet is Real
              </div>
              <h2 className="text-4xl font-black leading-tight sm:text-5xl">
                40% of the internet <br />
                <span className="text-risk-text">is now bots.</span>
              </h2>
              <p className="mt-6 text-lg font-medium leading-relaxed text-muted">
                The job market is the new frontier for automated phishing. AI is posting jobs, AI is sending messages, and AI is interviewing you. HireProof is the human filter.
              </p>
              
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-risk-bg text-risk-text">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-foreground">LLM Forensics</h3>
                  <p className="text-sm text-muted">Our engine identifies linguistic patterns unique to generative AI models.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-safe-bg text-safe">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-foreground">Bot-Speed Detection</h3>
                  <p className="text-sm text-muted">We flag listings that appear across hundreds of domains in milliseconds.</p>
                </div>
              </div>
              
              <Link
                href="/docs/dead-internet"
                className="mt-10 inline-flex items-center gap-2 font-black text-foreground hover:text-safe transition-colors"
              >
                Learn about our bot-defense <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="relative rounded-2xl border border-border-soft bg-surface/80 p-8 backdrop-blur-sm shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs text-muted">
                  <span className="h-2 w-2 rounded-full bg-risk-text animate-pulse"></span>
                  SCANNING FOR AUTOMATION...
                </div>
                <div className="text-xs font-black text-risk-text">DETECTION ACTIVE</div>
              </div>
              
              <div className="space-y-4 font-mono">
                <div className="rounded border border-border bg-background p-3 text-xs leading-relaxed text-foreground">
                  <span className="text-risk-text">MATCH:</span> "We are looking for a highly motivated individual..." <br/>
                  <span className="text-muted">// Probability of GPT-4 origin: 98.4%</span>
                </div>
                <div className="rounded border border-border bg-background p-3 text-xs leading-relaxed text-foreground">
                  <span className="text-risk-text">MATCH:</span> "Salary: $5000/week" <br/>
                  <span className="text-muted">// Pattern: Unrealistic compensation outlier</span>
                </div>
                <div className="rounded border border-border bg-background p-3 text-xs leading-relaxed text-foreground">
                  <span className="text-risk-text">MATCH:</span> Domain created 2 hours ago. <br/>
                  <span className="text-muted">// Status: High-risk throwaway infrastructure</span>
                </div>
              </div>
              
              <div className="mt-8 relative rounded-xl bg-risk-bg/50 border border-risk-bg p-4 text-center overflow-hidden">
                <div className="bot-scan-line"></div>
                <div className="text-2xl font-black text-risk-text glitch-hover uppercase">Bot Signature Found</div>
                <div className="text-[10px] uppercase tracking-widest text-risk-text/80 mt-1">Isolating human footprint: 0%</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="relative overflow-hidden bg-foreground py-24 text-background">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
        </div>
        <div className="mx-auto max-w-5xl px-6 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-safe text-background shadow-[0_0_40px_rgba(16,185,129,0.4)]"
          >
            <Globe className="h-8 w-8" />
          </motion.div>
          <h2 className="mb-6 text-4xl font-black lg:text-7xl tracking-tighter">Built for the People.</h2>
          <p className="mx-auto mb-12 max-w-2xl text-xl font-medium opacity-80 leading-relaxed">
            HireProof is more than a tool—it's a collective defense. Every audit you run trains our agentic models and protects the next candidate from fraud.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { label: 'Community Audits', value: '14.2k+' },
              { label: 'Scams Thwarted', value: '2,891' },
              { label: 'Verified Human Jobs', value: '8,402' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md hover:bg-white/10 transition-colors">
                <div className="text-5xl font-black text-safe mb-3">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link href="/audit" className="w-full sm:w-auto rounded-2xl bg-safe px-12 py-5 text-lg font-black text-background hover:scale-105 transition-all shadow-xl hover:shadow-safe/20">
              Join the Network
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 w-12 rounded-full border-4 border-foreground bg-surface/20 backdrop-blur-sm flex items-center justify-center text-[10px] font-black text-white/50">H{i}</div>
                ))}
              </div>
              <div className="text-left">
                <div className="text-sm font-black text-white">1,200+ Active Investigators</div>
                <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Real-time collaboration</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browser Extension Section */}
      <section className="py-24 border-y border-border-soft bg-surface/30 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-safe/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-safe-bg px-4 py-1.5 text-xs font-black uppercase tracking-widest text-safe-text border border-safe/20">
                <Globe className="h-3.5 w-3.5" />
                Now available for Chrome & Edge
              </div>
              <h2 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
                Protection that follows <span className="text-safe italic underline decoration-safe/30 underline-offset-8">you</span>.
              </h2>
              <p className="text-lg font-medium text-muted leading-relaxed max-w-xl">
                The HireProof browser extension works silently in the background on LinkedIn, Indeed, and Telegram. It automatically flags high-risk profiles and verifies recruiter identities in real-time.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border-soft shadow-sm">
                    <Zap className="h-5 w-5 text-safe" />
                  </div>
                  <h4 className="font-black">Instant Verification</h4>
                  <p className="text-sm text-muted leading-relaxed">See the risk score of any job listing directly on the job board without leaving the page.</p>
                </div>
                <div className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border-soft shadow-sm">
                    <Bot className="h-5 w-5 text-risk-text" />
                  </div>
                  <h4 className="font-black">Bot Pattern Blocker</h4>
                  <p className="text-sm text-muted leading-relaxed">Automatically hide listings that match known automated scam patterns across our global network.</p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/docs/chrome-extension"
                  className="hireproof-focus inline-flex items-center justify-center gap-3 rounded-2xl bg-foreground px-8 py-4 text-base font-black text-background transition-all hover:bg-safe hover:scale-105 shadow-xl"
                >
                  Download Extension
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 overflow-hidden rounded-[32px] border border-border-soft shadow-[0_32px_64px_-12px_rgba(17,24,39,0.2)] bg-surface p-2">
                <img 
                  src="/browser_extension_preview_1777460701226.png" 
                  alt="HireProof Browser Extension in Action" 
                  className="w-full h-auto rounded-[24px]"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 h-32 w-32 bg-safe/20 blur-3xl rounded-full z-0" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-evidence/10 blur-3xl rounded-full z-0" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Spot the Bot Section */}
      <SpotTheBot />

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden bg-foreground text-background">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]"></div>
        </div>
        <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-safe text-background shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)]"
          >
            <ShieldAlert className="h-10 w-10" />
          </motion.div>
          <h2 className="text-4xl font-black md:text-5xl lg:text-6xl tracking-tight">
            Ready to stop the bots?
          </h2>
          <p className="mt-6 text-lg md:text-xl font-medium opacity-80 max-w-2xl mx-auto leading-relaxed">
            Don't let automated phishing steal your future. Verify your next opportunity with the world's first agentic recruitment forensic engine.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/audit"
              className="hireproof-focus cta-glow w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-safe px-8 py-4 text-lg font-black text-background transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            >
              Start Your First Audit
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/docs"
              className="hireproof-focus w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-lg font-black text-white transition-all hover:bg-white/10"
            >
              Read the Whitepaper
            </Link>
          </div>
          <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] opacity-40">
            Secure · Anonymous · Free for Individuals
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
