import Link from 'next/link'
import { ShieldAlert, Cpu, Bot, UserCheck, AlertTriangle, Zap, BarChart3, Fingerprint, Network, Globe } from 'lucide-react'

export default function DeadInternetPage() {
  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header Section */}
      <div className="mb-12 border-b border-border-soft pb-12">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-risk-bg text-risk-text shadow-lg">
            <Bot className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface border border-border-soft px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted">
              Technical Whitepaper v2.4
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              The Dead Internet Theory
            </h1>
          </div>
        </div>
        <p className="text-xl leading-relaxed text-muted font-medium max-w-2xl">
          An in-depth analysis of automated recruitment fraud and the emergence of "Ghost Hiring" in the age of generative AI.
        </p>
      </div>

      <div className="prose prose-slate prose-invert max-w-none space-y-12">
        {/* Executive Summary */}
        <section>
          <h2 className="text-2xl font-black flex items-center gap-3">
            <Fingerprint className="h-6 w-6 text-evidence" />
            Executive Summary
          </h2>
          <p className="text-lg leading-relaxed text-muted">
            The <span className="text-foreground font-bold">Dead Internet Theory</span> suggests that the internet has been almost entirely overtaken by artificial intelligence, bots, and automated content. In recruitment, this has manifested as a 1,000% surge in fraudulent listings. HireProof's whitepaper explores the technical signatures of this phenomenon and outlines our forensic methodology for re-establishing human trust.
          </p>
        </section>

        {/* The Crisis Section */}
        <section className="rounded-3xl border border-risk-bg/30 bg-risk-bg/5 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle className="h-32 w-32" />
          </div>
          <h2 className="mt-0 flex items-center gap-3 text-2xl font-black text-risk-text">
            <ShieldAlert className="h-6 w-6" />
            The 2025 Recruitment Crisis
          </h2>
          <div className="grid gap-8 md:grid-cols-3 mt-8">
            <div className="space-y-2">
              <div className="text-4xl font-black text-risk-text">237%</div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">Rise in Job Scams</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-black text-risk-text">$893M</div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">Losses to AI Fraud</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-black text-risk-text">1 in 4</div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">Inauthentic Profiles</p>
            </div>
          </div>
          <p className="mt-8 text-sm font-medium leading-relaxed text-muted/80">
            Attackers are leveraging LLMs to generate high-fidelity job descriptions, automated LinkedIn profiles, and programmatic outreach scripts that bypass traditional keyword-based security filters.
          </p>
        </section>

        {/* Architecture Image */}
        <section className="space-y-4 text-center">
          <div className="overflow-hidden rounded-3xl border border-border-soft bg-surface shadow-2xl">
            <img 
              src="/technical_architecture_fraud_1777460510551.png" 
              alt="Technical Architecture of Automated Fraud" 
              className="w-full object-cover"
            />
          </div>
          <p className="text-xs font-bold text-muted uppercase tracking-widest">Fig 1.1: Schematic of Programmatic Recruitment Fraud Infrastructure</p>
        </section>

        {/* Detection Methodology */}
        <section>
          <h2 className="text-2xl font-black flex items-center gap-3 mb-8">
            <Network className="h-6 w-6 text-safe" />
            Detection Methodology
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border p-6 bg-surface shadow-sm hover:border-evidence transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-background border border-border-soft">
                <Cpu className="h-6 w-6 text-evidence" />
              </div>
              <h4 className="text-lg font-black">Linguistic Forensics</h4>
              <p className="text-sm text-muted leading-relaxed mt-2">
                Our engine uses custom NLP models to detect "Automated Politeness"—a specific marker of LLM output characterized by high perplexity and low variance in professional tone.
              </p>
            </div>
            <div className="rounded-2xl border border-border p-6 bg-surface shadow-sm hover:border-risk-text transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-background border border-border-soft">
                <Bot className="h-6 w-6 text-risk-text" />
              </div>
              <h4 className="text-lg font-black">Programmatic Velocity</h4>
              <p className="text-sm text-muted leading-relaxed mt-2">
                We monitor "Burst Deployment" patterns where identical listings appear across hundreds of disparate domains and messaging platforms (Telegram, WhatsApp) in milliseconds.
              </p>
            </div>
            <div className="rounded-2xl border border-border p-6 bg-surface shadow-sm hover:border-safe transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-background border border-border-soft">
                <Globe className="h-6 w-6 text-safe" />
              </div>
              <h4 className="text-lg font-black">Infrastructure Tracing</h4>
              <p className="text-sm text-muted leading-relaxed mt-2">
                Cross-referencing domain age, hosting proximity to known bot farms, and SSL certificate patterns to identify "throwaway" hiring infrastructure.
              </p>
            </div>
            <div className="rounded-2xl border border-border p-6 bg-surface shadow-sm hover:border-caution transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-background border border-border-soft">
                <BarChart3 className="h-6 w-6 text-caution" />
              </div>
              <h4 className="text-lg font-black">Market Anomalies</h4>
              <p className="text-sm text-muted leading-relaxed mt-2">
                Flagging unrealistic compensation outliers (e.g., ₱80,000/week for interns) by comparing real-time salary indices across verified job boards.
              </p>
            </div>
          </div>
        </section>

        {/* Proof of Human Protocol */}
        <section className="bg-foreground text-background rounded-3xl p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
          </div>
          <h2 className="mt-0 flex items-center gap-3 text-2xl font-black text-background relative z-10">
            <UserCheck className="h-6 w-6 text-safe" />
            The "Proof of Human" Protocol
          </h2>
          <p className="text-lg font-medium opacity-80 mt-4 relative z-10">
            HireProof re-establishes trust through technically enforced verification of human agency.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 relative z-10">
            <div className="space-y-2">
              <h4 className="font-black text-safe">Biometric Verification</h4>
              <p className="text-sm opacity-70">Optional recruiter identity checks using facial biometrics and official credentials.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-black text-safe">History Graphing</h4>
              <p className="text-sm opacity-70">Analyzing the historical "digital footprint" of a recruiter to ensure they aren't a synthetic persona.</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <div className="mt-20 rounded-3xl border border-border-soft bg-surface p-12 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-safe text-background">
            <Zap className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-black">Reclaim the Human Internet.</h3>
          <p className="text-muted text-lg mt-2 max-w-xl mx-auto font-medium">
            Join the effort to filter out automated fraud. Use the HireProof engine to verify every opportunity.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/audit" className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-foreground px-8 py-4 text-base font-black text-background hover:bg-safe transition-all shadow-lg hover:scale-105 active:scale-95">
              Run Forensic Audit
            </Link>
            <Link href="/docs/api-reference" className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-border-soft bg-background px-8 py-4 text-base font-black text-foreground hover:bg-surface transition-all">
              API Reference
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
