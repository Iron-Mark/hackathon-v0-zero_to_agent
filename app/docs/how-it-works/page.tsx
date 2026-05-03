import { AlertTriangle, Clock, DatabaseZap, SearchCheck, ShieldCheck, Workflow } from 'lucide-react'

export const metadata = {
  title: 'How HireProof Works - HireProof Docs',
  description: 'Current HireProof audit behavior, live evidence flow, demo fixture boundaries, and trust controls.',
}

const flow = [
  {
    title: '1. Input intake',
    body: 'A user submits pasted text, a job URL, a screenshot, or voice-derived text. Screenshot audits run OCR first so visible job details can be included in the same evidence flow.',
  },
  {
    title: '2. Claim extraction',
    body: 'HireProof extracts company, role, salary, location, contact method, application path, and recruiter identity fields into a typed audit contract.',
  },
  {
    title: '3. Live evidence mode',
    body: 'Live evidence mode can call model providers, SerpApi search, Google Jobs, News, Maps, local footprint checks, job page enrichment, and OCR evidence depending on the input.',
  },
  {
    title: '4. Evidence-weighted scoring',
    body: 'The scorer combines red flags, green flags, source quality, freshness, company identity, recruiter identity, apply-path consistency, salary benchmarks, and local context.',
  },
  {
    title: '5. Report rendering',
    body: 'The result shows the verdict, score trace, evidence receipts, extracted claims, operational notes, feedback controls, and next steps.',
  },
]

const trustControls = [
  {
    title: 'Demo fixture mode',
    body: 'Demo fixture mode is explicitly labeled. It uses prebuilt examples, shows a warning snackbar, removes fake source links, and does not pretend to run live source checks.',
  },
  {
    title: 'Timeline honesty',
    body: 'The visible timeline uses the stream events captured by the browser when live mode runs. Demo mode shows fixture events instead of precise fake timings.',
  },
  {
    title: 'Verified-only safer alternatives',
    body: 'Safer alternatives appear only when comparable job evidence has a real source URL or provider-backed job metadata. Unsourced snippets and demo placeholders are hidden.',
  },
  {
    title: 'Remote startup mode',
    body: 'Remote startup mode explains why missing local-office evidence may not hurt a score when digital footprint, apply path, and company signals are otherwise consistent.',
  },
  {
    title: 'Feedback reasons',
    body: 'Users can mark an investigation helpful or incorrect and provide a structured reason such as false positive, stale evidence, salary wrong, company match wrong, or recruiter match wrong.',
  },
  {
    title: 'Abuse and quota controls',
    body: 'Live audits use queue throttling, per-user or per-IP limits, a SerpApi circuit breaker, cache telemetry, persistent cache hooks, and similarity cache reuse to reduce waste.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="space-y-12 pb-24 text-foreground">
      <section className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight lg:text-5xl">How HireProof Works</h1>
        <p className="max-w-3xl text-xl font-medium leading-relaxed text-muted">
          HireProof is an employment-fraud trust-and-safety agent. It turns a job post, recruiter pitch, screenshot, or apply URL into a structured report with evidence receipts and an explainable verdict.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        {flow.map((item) => (
          <div key={item.title} className="rounded-2xl border border-border-soft bg-surface p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-safe/10 text-safe">
              <Workflow className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-black">{item.title}</h2>
            <p className="mt-2 text-xs font-semibold leading-5 text-muted">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-border-soft bg-surface p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <SearchCheck className="h-6 w-6 text-safe" />
          <h2 className="text-2xl font-black">Live Mode Data Flow</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border-soft bg-background p-4">
            <h3 className="text-sm font-black">Evidence gathering</h3>
            <p className="mt-2 text-xs font-semibold leading-5 text-muted">
              The audit route enriches job URLs, extracts claims, runs optional OCR, calls search/local/jobs/news evidence tools, and falls back gracefully when a provider is unavailable.
            </p>
          </div>
          <div className="rounded-2xl border border-border-soft bg-background p-4">
            <h3 className="text-sm font-black">Scoring intelligence</h3>
            <p className="mt-2 text-xs font-semibold leading-5 text-muted">
              Intelligence v2 records source quality, evidence freshness, company profile mode, recruiter identity, salary anomaly ratio, local context, and score trace.
            </p>
          </div>
          <div className="rounded-2xl border border-border-soft bg-background p-4">
            <h3 className="text-sm font-black">Operational evidence</h3>
            <p className="mt-2 text-xs font-semibold leading-5 text-muted">
              When live search is throttled or the SerpApi circuit breaker opens, the report carries an operational note instead of silently acting like every check ran.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-3 border-b border-border-soft pb-2">
          <ShieldCheck className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-black">Trust Controls</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {trustControls.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border-soft bg-surface p-5 shadow-sm">
              <h3 className="text-sm font-black">{item.title}</h3>
              <p className="mt-2 text-xs font-semibold leading-5 text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-caution/30 bg-caution-bg/20 p-5">
          <AlertTriangle className="mb-3 h-5 w-5 text-caution-text" />
          <h2 className="text-sm font-black">What demo means</h2>
          <p className="mt-2 text-xs font-semibold leading-5 text-muted">
            Demo reports are for product walkthroughs and offline testing. They are not proof that a listed employer, recruiter, review, or job alternative was checked at request time.
          </p>
        </div>
        <div className="rounded-2xl border border-evidence/30 bg-evidence/5 p-5">
          <Clock className="mb-3 h-5 w-5 text-evidence" />
          <h2 className="text-sm font-black">What timeline means</h2>
          <p className="mt-2 text-xs font-semibold leading-5 text-muted">
            Browser audits keep the latest stream messages and pass them to the result screen. If no live stream exists, the report shows an honest fallback instead of exact fake durations.
          </p>
        </div>
        <div className="rounded-2xl border border-safe/30 bg-safe/5 p-5">
          <DatabaseZap className="mb-3 h-5 w-5 text-safe" />
          <h2 className="text-sm font-black">What cache saves</h2>
          <p className="mt-2 text-xs font-semibold leading-5 text-muted">
            Redis and in-memory caches can reuse equivalent SerpApi searches and similar company-role-location audits, reducing repeated external searches across hot and cold paths.
          </p>
        </div>
      </section>
    </div>
  )
}
