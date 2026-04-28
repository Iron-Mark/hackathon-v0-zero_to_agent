export const metadata = { title: 'Quickstart — HireProof' }

export default function QuickstartPage() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-black tracking-tight">Quickstart</h1>
      <p className="mb-8 text-lg font-semibold text-muted">Get HireProof running locally in under 2 minutes.</p>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">1. Clone & Install</h2>
        <div className="rounded-xl border border-border-soft bg-surface overflow-hidden shadow-sm">
          <div className="border-b border-border-soft px-4 py-2 text-xs font-black text-muted">Terminal</div>
          <pre className="overflow-x-auto p-4 text-sm leading-7"><code>{`git clone https://github.com/Iron-Mark/hackathon-v0-zero_to_agent.git
cd hackathon-v0-zero_to_agent
npm install`}</code></pre>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">2. Configure Environment</h2>
        <div className="rounded-xl border border-border-soft bg-surface overflow-hidden shadow-sm">
          <div className="border-b border-border-soft px-4 py-2 text-xs font-black text-muted">.env.local</div>
          <pre className="overflow-x-auto p-4 text-sm leading-7"><code>{`# Required for live AI-powered investigations
MODEL_PROVIDER_KEY=your_openai_api_key
SERPAPI_API_KEY=your_serpapi_key
APP_BASE_URL=http://localhost:3000

# Optional: API key for headless agent access
AGENT_API_KEY=hireproof_agent_demo_key`}</code></pre>
        </div>
        <div className="mt-4 rounded-lg border border-safe/20 bg-safe/5 px-4 py-3 text-xs font-bold text-safe">
          💡 Demo mode works without any API keys. You can skip this step to try the app immediately.
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">3. Run</h2>
        <div className="rounded-xl border border-border-soft bg-surface overflow-hidden shadow-sm">
          <div className="border-b border-border-soft px-4 py-2 text-xs font-black text-muted">Terminal</div>
          <pre className="overflow-x-auto p-4 text-sm leading-7"><code>{`npm run dev

# Open http://localhost:3000/audit`}</code></pre>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">4. Try the Demo</h2>
        <p className="mb-4 text-sm font-semibold text-muted">Three seeded scenarios work immediately without API keys:</p>
        <div className="space-y-3">
          <div className="rounded-xl border border-risk-bg bg-risk-bg/30 p-4">
            <div className="text-sm font-black text-risk-text">🔴 High-Risk Demo</div>
            <p className="mt-1 text-xs font-semibold text-muted">&quot;Remote frontend intern. PHP 80,000/week. No interview. Message us on Telegram.&quot;</p>
          </div>
          <div className="rounded-xl border border-caution-bg bg-caution-bg/30 p-4">
            <div className="text-sm font-black text-caution-text">🟡 Caution Demo</div>
            <p className="mt-1 text-xs font-semibold text-muted">Ambiguous listing with incomplete company signals.</p>
          </div>
          <div className="rounded-xl border border-safe-bg bg-safe-bg/30 p-4">
            <div className="text-sm font-black text-safe-text">🟢 Safe Demo</div>
            <p className="mt-1 text-xs font-semibold text-muted">Credible listing from an established company with verified presence.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-black">5. Test the Headless API</h2>
        <div className="rounded-xl border border-border-soft bg-surface overflow-hidden shadow-sm">
          <div className="border-b border-border-soft px-4 py-2 text-xs font-black text-muted">Terminal</div>
          <pre className="overflow-x-auto p-4 text-sm leading-7"><code>{`curl -X POST http://localhost:3000/api/v1/audit \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: hireproof_agent_demo_key" \\
  -d '{"text": "Remote frontend intern. PHP 80,000/week. No interview. Message us on Telegram."}'`}</code></pre>
        </div>
      </section>
    </div>
  )
}
