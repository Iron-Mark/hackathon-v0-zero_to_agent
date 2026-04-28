import Link from 'next/link'
import { Shield, Zap, Globe, Mic, Image, FileText, Code2, Webhook } from 'lucide-react'

export const metadata = { title: 'Documentation — HireProof' }

const quickLinks = [
  { icon: Zap, title: 'Quickstart', desc: 'Get running in under 2 minutes', href: '/docs/quickstart' },
  { icon: Code2, title: 'API Reference', desc: 'Explore all API endpoints', href: '/docs/api-reference' },
  { icon: Shield, title: 'MCP Server', desc: 'Connect your AI agent directly', href: '/docs/mcp' },
  { icon: Webhook, title: 'Webhooks', desc: 'Async investigation with callbacks', href: '/docs/webhooks' },
]

const features = [
  { icon: Globe, title: 'Headless Agent API', desc: 'Authenticated REST endpoint for external AI agents and CLI tools.' },
  { icon: Mic, title: 'Voice Input', desc: 'Dictate job posts using browser Speech-to-Text.' },
  { icon: Image, title: 'Image Upload', desc: 'Upload screenshots of fake offers for AI vision analysis.' },
  { icon: FileText, title: 'PDF Dossier', desc: 'Export multi-page, color-coded investigation reports.' },
]

export default function DocsOverview() {
  return (
    <div>
      <div className="mb-10">
        <div className="mb-2 inline-block rounded-full bg-safe/10 px-3 py-1 text-xs font-black text-safe">v1.0</div>
        <h1 className="mb-4 text-4xl font-black tracking-tight">HireProof Documentation</h1>
        <p className="text-lg font-semibold leading-8 text-muted">
          Proof-backed job verification with an AI agent. Paste a job post, upload a screenshot, or dictate it — 
          HireProof investigates the opportunity with live evidence and returns a verdict with receipts.
        </p>
      </div>

      {/* Code example */}
      <div className="mb-10 rounded-2xl border border-border-soft bg-surface overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 border-b border-border-soft px-4 py-2.5">
          <div className="h-3 w-3 rounded-full bg-risk-text/40" />
          <div className="h-3 w-3 rounded-full bg-caution/40" />
          <div className="h-3 w-3 rounded-full bg-safe/40" />
          <span className="ml-2 text-xs font-black text-muted">curl</span>
        </div>
        <pre className="overflow-x-auto p-5 text-sm leading-7 text-foreground"><code>{`curl -X POST https://yourapp.vercel.app/api/v1/audit \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: hireproof_agent_demo_key" \\
  -d '{
    "text": "Remote frontend intern. PHP 80,000/week. No interview. Message us on Telegram.",
    "location": "Philippines"
  }'`}</code></pre>
      </div>

      {/* Quick links grid */}
      <h2 className="mb-5 text-2xl font-black">Getting Started</h2>
      <div className="mb-12 grid gap-4 sm:grid-cols-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-2xl border border-border-soft bg-surface p-5 shadow-sm transition-all hover:border-safe hover:shadow-md"
          >
            <link.icon className="mb-3 h-5 w-5 text-safe" />
            <div className="text-sm font-black group-hover:text-safe">{link.title}</div>
            <div className="mt-1 text-xs font-semibold text-muted">{link.desc}</div>
          </Link>
        ))}
      </div>

      {/* Features */}
      <h2 className="mb-5 text-2xl font-black">Platform Capabilities</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((feat) => (
          <div key={feat.title} className="rounded-2xl border border-border-soft bg-surface p-5 shadow-sm">
            <feat.icon className="mb-3 h-5 w-5 text-evidence" />
            <div className="text-sm font-black">{feat.title}</div>
            <div className="mt-1 text-xs font-semibold text-muted">{feat.desc}</div>
          </div>
        ))}
      </div>

      {/* Architecture summary */}
      <div className="mt-12 rounded-2xl border border-border-soft bg-safe/5 p-6">
        <h3 className="mb-3 text-lg font-black">How It Works</h3>
        <ol className="space-y-3 text-sm font-semibold text-muted">
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-safe text-xs font-black text-white">1</span> User submits a job post via text, image, or voice</li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-safe text-xs font-black text-white">2</span> AI extracts claims: company, role, salary, contact method</li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-safe text-xs font-black text-white">3</span> Autonomous agent calls 4 MCP tools to gather live evidence</li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-safe text-xs font-black text-white">4</span> Risk scorer produces a weighted verdict: Safe, Caution, or High-Risk</li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-safe text-xs font-black text-white">5</span> Results streamed in real-time with evidence, flags, and next steps</li>
        </ol>
      </div>
    </div>
  )
}
