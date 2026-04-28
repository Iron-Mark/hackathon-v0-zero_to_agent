export const metadata = { title: 'Architecture — HireProof' }

export default function ArchitecturePage() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-black tracking-tight">Architecture</h1>
      <p className="mb-8 text-lg font-semibold text-muted">How HireProof is structured end-to-end.</p>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Tech Stack</h2>
        <div className="overflow-hidden rounded-xl border border-border-soft">
          <table className="w-full text-sm">
            <tbody>
              {[
                ['Framework', 'Next.js 16 (App Router)'],
                ['Language', 'TypeScript 6'],
                ['Styling', 'Tailwind CSS 4 + Custom Design Tokens'],
                ['AI SDK', 'Vercel AI SDK 6 (ai, @ai-sdk/openai)'],
                ['Animation', 'Framer Motion 12'],
                ['Charts', 'Recharts'],
                ['PDF', 'jsPDF'],
                ['Search', 'SerpApi (Google Search, News, Jobs, Maps)'],
                ['Protocol', 'Model Context Protocol (MCP)'],
              ].map(([layer, tech]) => (
                <tr key={layer} className="border-b border-border-soft last:border-0">
                  <td className="px-4 py-3 font-black w-40">{layer}</td>
                  <td className="px-4 py-3 text-muted font-semibold">{tech}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Directory Structure</h2>
        <div className="rounded-xl border border-border-soft bg-surface overflow-hidden shadow-sm">
          <pre className="overflow-x-auto p-5 text-xs leading-6"><code>{`app/
├── page.tsx                    # Landing page
├── audit/page.tsx              # Investigation workspace (SSE consumer)
├── audit/[id]/page.tsx         # Shareable permalink view
├── history/page.tsx            # Local report history
├── docs/                       # Documentation hub
│   ├── layout.tsx              # Sidebar + tabbed nav
│   ├── page.tsx                # Docs overview
│   ├── api-reference/page.tsx  # Full API reference
│   ├── quickstart/page.tsx     # Getting started guide
│   └── ...                     # Additional doc pages
├── api/
│   ├── audit/route.ts          # SSE streaming endpoint
│   ├── v1/audit/route.ts       # Headless agent JSON API
│   └── mcp/route.ts            # MCP tool server
components/
├── audit-form.tsx              # Omni-modal input (text + image + voice)
├── result-screen.tsx           # Animated verdict display
├── risk-radar-chart.tsx        # 5-axis Recharts radar
├── voice-input-button.tsx      # Web Speech API input
├── theme-toggle.tsx            # Dark mode switch
├── site-header.tsx             # Global navigation
lib/
├── schemas.ts                  # Zod schemas and types
├── risk-scorer.ts              # Deterministic scoring engine
├── serpapi.ts                  # SerpApi wrapper functions
├── mcp-tools.ts                # MCP tool definitions
├── rate-limit.ts               # In-memory rate limiter
├── db.ts                       # JSON file persistence
├── generate-pdf.ts             # PDF dossier generator
├── fixtures.ts                 # Demo data
extension/
├── manifest.json               # Chrome Manifest V3
├── popup.html/js/css           # Extension popup UI`}</code></pre>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Data Flow</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Input Layer', desc: 'User submits via text textarea, image upload, or voice dictation. The AuditForm component normalizes all inputs into an AuditRequest object.' },
            { step: '2', title: 'Claims Extraction', desc: 'GPT-4o-mini (via Vercel AI SDK generateObject) extracts structured claims: company, role, salary, contact method, application path. Supports multi-modal image input.' },
            { step: '3', title: 'Evidence Gathering', desc: 'An autonomous agent loop (generateText with tools) calls 4 MCP tools via the internal /api/mcp server. Each tool wraps a SerpApi search type.' },
            { step: '4', title: 'Risk Scoring', desc: 'A deterministic scorer assigns weighted penalties for red flags and bonuses for green flags, producing a 0-100 risk score and verdict.' },
            { step: '5', title: 'Output Layer', desc: 'Results stream to the UI via SSE, or return as JSON via the headless API. Reports are persisted to disk and accessible via permalinks.' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 rounded-xl border border-border-soft bg-surface p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-safe text-sm font-black text-white">{item.step}</span>
              <div>
                <div className="text-sm font-black">{item.title}</div>
                <p className="mt-1 text-xs font-semibold text-muted leading-5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
