import { BarChart3, AlertTriangle, ShieldCheck, Scale, Info } from 'lucide-react'

export const metadata = { 
  title: 'Risk Scoring — HireProof Docs',
  description: 'Deep dive into the transparent, evidence-weighted safety policy used by HireProof.'
}

export default function RiskScoringPage() {
  return (
    <div className="space-y-12 pb-24 text-foreground">
      <section className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight lg:text-5xl">Risk Scoring</h1>
        <p className="text-xl font-medium leading-relaxed text-muted">
          HireProof uses a transparent, evidence-weighted scoring policy so every verdict is explainable, repeatable, and tied to visible report evidence.
        </p>
      </section>

      {/* Logic */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border-soft pb-2">
          <Scale className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-black">The Weighted System</h2>
        </div>
        <p className="font-medium text-muted leading-relaxed">
          Risk calculations start at a baseline of <strong>25</strong>. Red flags add risk, green flags subtract risk through capped green-credit, and evidence receipts make small adjustments. The cap keeps one positive signal from erasing concrete scam patterns.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Red Flags */}
          <div className="rounded-2xl border border-risk-bg/30 bg-risk-bg/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-risk-text uppercase tracking-widest">
              <AlertTriangle className="h-4 w-4" />
              Risk Penalties
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Payment or Fee Requested', weight: '+30', desc: 'Training fees, starter kits, deposits, or paid onboarding' },
                { label: 'Unrealistic Pay', weight: '+28', desc: 'Salary far above market outlier' },
                { label: 'Telegram/WhatsApp', weight: '+18', desc: 'Anonymous chat-only contact' },
                { label: 'No Interview Process', weight: '+16', desc: 'No credible screening or hiring process' },
                { label: 'Company Not Verifiable', weight: '+14', desc: 'Unknown or unverifiable company identity' },
              ].map((flag) => (
                <div key={flag.label} className="flex items-center justify-between border-b border-risk-bg/10 pb-2 last:border-0">
                  <div>
                    <div className="text-xs font-bold text-foreground">{flag.label}</div>
                    <div className="text-[10px] text-muted">{flag.desc}</div>
                  </div>
                  <span className="text-sm font-black text-risk-text">{flag.weight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Green Flags */}
          <div className="rounded-2xl border border-safe/30 bg-safe/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-safe uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" />
              Safety Bonuses
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Verified company presence', weight: '-12', desc: 'Company web presence or identity evidence is present' },
                { label: 'Official application path', weight: '-12', desc: 'Application points to an official channel' },
                { label: 'Professional process', weight: '-10', desc: 'Standard recruiter or hiring workflow' },
                { label: 'Standard salary format', weight: '-8', desc: 'Pay is framed as a normal market monthly or annual range' },
                { label: 'Specific location', weight: '-4', desc: 'Useful location context is provided' },
              ].map((flag) => (
                <div key={flag.label} className="flex items-center justify-between border-b border-safe/10 pb-2 last:border-0">
                  <div>
                    <div className="text-xs font-bold text-foreground">{flag.label}</div>
                    <div className="text-[10px] text-muted">{flag.desc}</div>
                  </div>
                  <span className="text-sm font-black text-safe">{flag.weight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'Green-credit cap', body: 'Safety bonuses are capped at -28 so positives help without hiding serious fraud signals.' },
          { title: 'Company check evidence', body: 'Company Check, Local Presence, and Comparable Jobs receipts can reduce risk by small amounts.' },
          { title: 'Negative scam evidence', body: 'Evidence snippets mentioning scam, fraud, fake, impersonation, or phishing increase risk, capped at +16.' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-border-soft bg-surface p-5">
            <h3 className="text-sm font-black">{item.title}</h3>
            <p className="mt-2 text-xs font-semibold leading-5 text-muted">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-caution-bg/60 bg-caution-bg/20 p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="mt-1 h-5 w-5 text-caution-text" />
          <div className="space-y-2">
            <p className="text-sm font-black uppercase tracking-widest text-caution-text">Current boundary</p>
            <p className="text-sm font-medium text-muted leading-relaxed">
              This is not claimed as continuous learning or a black-box fraud model. The current version prioritizes explainability: users can see which red flags, green flags, and evidence receipts affected the verdict. The roadmap is calibrated learning from reviewed cases while preserving visible evidence.
            </p>
          </div>
        </div>
      </section>

      {/* Verdicts */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border-soft pb-2">
          <BarChart3 className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-black">Verdict Thresholds</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-safe-bg bg-safe-bg/30 p-5 text-center">
            <div className="text-2xl font-black text-safe">0 - 34</div>
            <div className="mt-1 text-xs font-black uppercase text-safe-text tracking-widest">Safe ✅</div>
          </div>
          <div className="rounded-2xl border border-caution-bg bg-caution-bg/30 p-5 text-center">
            <div className="text-2xl font-black text-caution">35 - 64</div>
            <div className="mt-1 text-xs font-black uppercase text-caution-text tracking-widest">Caution ⚠️</div>
          </div>
          <div className="rounded-2xl border border-risk-bg bg-risk-bg/30 p-5 text-center">
            <div className="text-2xl font-black text-high-risk">65 - 100</div>
            <div className="mt-1 text-xs font-black uppercase text-risk-text tracking-widest">High-Risk 🔴</div>
          </div>
        </div>
      </section>

      {/* Explainability */}
      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start gap-4">
          <Info className="mt-1 h-5 w-5 text-muted" />
          <div className="space-y-2">
            <p className="text-sm font-black uppercase tracking-widest">Explainable AI</p>
            <p className="text-sm font-medium text-muted leading-relaxed">
              Every point added or subtracted is linked to visible report evidence. This explainable reasoning is what makes HireProof more useful than a simple blacklist.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
