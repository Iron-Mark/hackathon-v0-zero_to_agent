import type { Metadata } from 'next'
import { Image, Scale, ShieldCheck, Target, Workflow } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Competitive Roadmap | HireProof Docs',
  description: 'Judge-safe positioning and roadmap for HireProof as an employment-fraud trust-and-safety agent.',
}

const roadmap = [
  {
    title: 'Near-term proof',
    icon: ShieldCheck,
    body: 'Capture Discord live-provider proof and recapture the Telegram full-report-link screenshot.',
  },
  {
    title: 'Durable workflow',
    icon: Workflow,
    body: 'Turn the accepted WDK run into a visible investigation timeline with intake, evidence checks, scoring, report creation, callback delivery, and retry history.',
  },
  {
    title: 'Risk model',
    icon: Scale,
    body: 'Explore calibrated learning from reviewed cases as roadmap-only work while preserving explainable red flags, green flags, and evidence receipts.',
  },
  {
    title: 'Multimodal evidence',
    icon: Image,
    body: 'Improve screenshot/OCR handling and integrate specialist image or deepfake forensics providers only where independently verified proof adds trustworthy evidence.',
  },
]

export default function CompetitiveRoadmapPage() {
  return (
    <div className="space-y-12 pb-24 text-foreground">
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-safe/30 bg-safe/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-safe">
          <Target className="h-4 w-4" />
          Roadmap strategy
        </div>
        <h1 className="text-4xl font-black tracking-tight lg:text-5xl">Competitive Roadmap</h1>
        <p className="max-w-3xl text-xl font-medium leading-relaxed text-muted">
          HireProof should not pivot into a generic fraud platform for submission. The strongest story is a focused employment-fraud trust-and-safety agent with a credible roadmap toward broader protection.
        </p>
      </section>

      <section className="rounded-2xl border border-border-soft bg-surface p-6">
        <h2 className="text-2xl font-black">Submission Position</h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-muted">
          HireProof focuses on employment fraud first because job scams happen in urgent, personal, high-risk moments where users need an actionable verdict, not a generic fraud dashboard. The narrow domain is the wedge, not the ceiling: the same evidence core already runs through the web app, API, MCP tools, ChatSDK agents, and WDK workflow entrypoint.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border-soft bg-surface p-6">
          <h2 className="text-xl font-black">Current Risk Model</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted">
            The current scorer is a transparent evidence-weighted safety policy. It does not claim continuous learning today; it shows which red flags, green flags, and evidence receipts drove the verdict so users can understand the reason before acting.
          </p>
        </article>
        <article className="rounded-2xl border border-border-soft bg-surface p-6">
          <h2 className="text-xl font-black">Current WDK Proof</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted">
            The current WDK proof is a production-accepted workflow run. Claim accepted execution only until a completed workflow transcript, callback result, and retry evidence are captured.
          </p>
        </article>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-black">Roadmap</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {roadmap.map((item) => (
            <article key={item.title} className="rounded-2xl border border-border-soft bg-surface p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-safe/10 text-safe">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black">{item.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-caution/30 bg-caution/5 p-6">
        <h2 className="text-2xl font-black">Do Not Overclaim</h2>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm font-semibold leading-6 text-muted">
          <li>Do not call HireProof a generic security platform.</li>
          <li>Do not claim adaptive ML, continuous learning, or in-house deepfake detection as shipped.</li>
          <li>Do not claim completed WDK workflow proof until a completed result is captured.</li>
          <li>Keep competitor comparisons high-level unless the competitor claims have been independently verified.</li>
        </ul>
      </section>
    </div>
  )
}

