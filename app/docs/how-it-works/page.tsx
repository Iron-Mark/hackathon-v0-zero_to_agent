import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  BadgeCheck,
  Binary,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  DatabaseZap,
  FileSearch,
  Gauge,
  Link2,
  MonitorCheck,
  ReceiptText,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react'

export const metadata = {
  title: 'How HireProof Works - HireProof Docs',
  description: 'Current HireProof audit behavior, live evidence flow, demo fixture boundaries, and trust controls.',
}

type IconItem = {
  icon: LucideIcon
  title: string
  body: string
}

const proofChips = [
  { icon: BriefcaseBusiness, label: 'Input: post, URL, screenshot, or pitch' },
  { icon: FileSearch, label: 'Live evidence when credentials are available' },
  { icon: ReceiptText, label: 'Explainable verdict with receipts' },
]

const flow: IconItem[] = [
  {
    icon: Workflow,
    title: '1. Input intake',
    body: 'A user submits pasted text, a job URL, a screenshot, or voice-derived text. Screenshot audits run OCR first so visible job details can be included in the same evidence flow.',
  },
  {
    icon: Binary,
    title: '2. Claim extraction',
    body: 'HireProof extracts company, role, salary, location, contact method, application path, and recruiter identity fields into a typed audit contract.',
  },
  {
    icon: SearchCheck,
    title: '3. Live evidence mode',
    body: 'Live evidence mode can call model providers, SerpApi search, Google Jobs, News, Maps, local footprint checks, job page enrichment, and OCR evidence depending on the input.',
  },
  {
    icon: Gauge,
    title: '4. Evidence-weighted scoring',
    body: 'The scorer combines red flags, green flags, source quality, freshness, company identity, recruiter identity, apply-path consistency, salary benchmarks, and local context.',
  },
  {
    icon: ReceiptText,
    title: '5. Report rendering',
    body: 'The result shows the verdict, score trace, evidence receipts, extracted claims, operational notes, feedback controls, and next steps.',
  },
]

const liveLanes: IconItem[] = [
  {
    icon: FileSearch,
    title: 'Evidence gathering',
    body: 'The audit route enriches job URLs, extracts claims, runs optional OCR, calls search/local/jobs/news evidence tools, and falls back gracefully when a provider is unavailable.',
  },
  {
    icon: Gauge,
    title: 'Scoring intelligence',
    body: 'Intelligence v2 records source quality, evidence freshness, company profile mode, recruiter identity, salary anomaly ratio, local context, and score trace.',
  },
  {
    icon: MonitorCheck,
    title: 'Operational evidence',
    body: 'When live search is throttled or the SerpApi circuit breaker opens, the report carries an operational note instead of silently acting like every check ran.',
  },
]

const trustControls: IconItem[] = [
  {
    icon: BadgeCheck,
    title: 'Demo fixture mode',
    body: 'Demo fixture mode is explicitly labeled. It uses prebuilt examples, shows a warning snackbar, removes fake source links, and does not pretend to run live source checks.',
  },
  {
    icon: Clock,
    title: 'Timeline honesty',
    body: 'The visible timeline uses the stream events captured by the browser when live mode runs. Demo mode shows fixture events instead of precise fake timings.',
  },
  {
    icon: Link2,
    title: 'Verified-only safer alternatives',
    body: 'Safer alternatives appear only when comparable job evidence has a real source URL or provider-backed job metadata. Unsourced snippets and demo placeholders are hidden.',
  },
  {
    icon: CheckCircle2,
    title: 'Remote startup mode',
    body: 'Remote startup mode explains why missing local-office evidence may not hurt a score when digital footprint, apply path, and company signals are otherwise consistent.',
  },
  {
    icon: Sparkles,
    title: 'Feedback reasons',
    body: 'Users can mark an investigation helpful or incorrect and provide a structured reason such as false positive, stale evidence, salary wrong, company match wrong, or recruiter match wrong.',
  },
  {
    icon: ShieldCheck,
    title: 'Abuse and quota controls',
    body: 'Live audits use queue throttling, per-user or per-IP limits, a SerpApi circuit breaker, cache telemetry, persistent cache hooks, and similarity cache reuse to reduce waste.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="space-y-14 pb-24 text-foreground">
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-safe/25 bg-safe/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-safe-text">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Evidence first
        </div>
        <div className="max-w-4xl space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            How HireProof Works
          </h1>
          <p className="max-w-3xl text-lg font-semibold leading-8 text-muted sm:text-xl">
            HireProof is an employment-fraud trust-and-safety agent. It turns a job post, recruiter pitch, screenshot, or apply URL into a structured report with evidence receipts and an explainable verdict.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {proofChips.map((item) => (
            <div key={item.label} className="flex min-h-14 items-center gap-3 rounded-xl border border-border-soft bg-surface px-4 py-3 shadow-sm">
              <item.icon className="h-4 w-4 shrink-0 text-safe" aria-hidden="true" />
              <span className="text-sm font-bold leading-5 text-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-foreground">Investigation flow</h2>
          <p className="text-sm font-semibold leading-6 text-muted">
            The audit moves from raw opportunity details to source-backed evidence, then turns that evidence into a verdict the user can inspect.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-5">
          {flow.map((item, index) => (
            <article key={item.title} className="relative rounded-xl border border-border-soft bg-surface p-5 shadow-sm">
              {index < flow.length - 1 && (
                <div className="absolute right-[-1rem] top-10 hidden h-px w-4 bg-border-soft 2xl:block" aria-hidden="true" />
              )}
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-safe/10 text-safe">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="rounded-full border border-border-soft bg-background px-2.5 py-1 text-[11px] font-black text-muted">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="text-base font-black leading-6 text-foreground">{item.title.replace(/^\d+\.\s*/, '')}</h3>
              <p className="mt-3 text-sm font-medium leading-6 text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 border-b border-border-soft pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-3">
              <SearchCheck className="h-5 w-5 text-safe" aria-hidden="true" />
              <h2 className="text-2xl font-black tracking-tight">Live mode data flow</h2>
            </div>
            <p className="text-sm font-semibold leading-6 text-muted">
              Live mode separates evidence collection, scoring, and operational status so the report can explain both what was checked and what could not be checked.
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full border border-evidence/25 bg-evidence/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-evidence">
            Live when configured
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {liveLanes.map((item) => (
            <article key={item.title} className="rounded-xl border border-border-soft bg-surface p-5 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-evidence/10 text-evidence">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-black text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm font-medium leading-6 text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="max-w-3xl space-y-2 border-b border-border-soft pb-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-safe" aria-hidden="true" />
            <h2 className="text-2xl font-black tracking-tight">Trust controls</h2>
          </div>
          <p className="text-sm font-semibold leading-6 text-muted">
            These controls keep the product honest about demo data, live-provider limits, sourced alternatives, and user feedback.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {trustControls.map((item) => (
            <article key={item.title} className="grid gap-4 rounded-xl border border-border-soft bg-surface p-5 shadow-sm sm:grid-cols-[2.75rem_minmax(0,1fr)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-safe/10 text-safe">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-black leading-6 text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-muted">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-caution/30 bg-caution-bg/20 p-5">
          <AlertTriangle className="mb-4 h-5 w-5 text-caution-text" aria-hidden="true" />
          <h2 className="text-base font-black text-foreground">What demo means</h2>
          <p className="mt-3 text-sm font-medium leading-6 text-muted">
            Demo reports are for product walkthroughs and offline testing. They are not proof that a listed employer, recruiter, review, or job alternative was checked at request time.
          </p>
        </article>
        <article className="rounded-xl border border-evidence/30 bg-evidence/5 p-5">
          <Clock className="mb-4 h-5 w-5 text-evidence" aria-hidden="true" />
          <h2 className="text-base font-black text-foreground">What timeline means</h2>
          <p className="mt-3 text-sm font-medium leading-6 text-muted">
            Browser audits keep the latest stream messages and pass them to the result screen. If no live stream exists, the report shows an honest fallback instead of exact fake durations.
          </p>
        </article>
        <article className="rounded-xl border border-safe/30 bg-safe/5 p-5">
          <DatabaseZap className="mb-4 h-5 w-5 text-safe" aria-hidden="true" />
          <h2 className="text-base font-black text-foreground">What cache saves</h2>
          <p className="mt-3 text-sm font-medium leading-6 text-muted">
            Redis and in-memory caches can reuse equivalent SerpApi searches and similar company-role-location audits, reducing repeated external searches across hot and cold paths.
          </p>
        </article>
      </section>
    </div>
  )
}
