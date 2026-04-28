export const metadata = { title: 'Headless API — HireProof' }
export default function Page() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-black tracking-tight">Headless Agent API</h1>
      <p className="mb-8 text-lg font-semibold text-muted">A dedicated REST endpoint for external AI agents, CLI tools, and automated pipelines.</p>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Why a Separate Endpoint?</h2>
        <p className="text-sm font-semibold text-muted leading-6">The main <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">/api/audit</code> endpoint is designed for the web UI — it streams SSE events. External agents need a simple JSON request → JSON response flow. The headless API at <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">/api/v1/audit</code> provides exactly that, plus webhook support for async processing.</p>
      </section>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Authentication</h2>
        <p className="mb-4 text-sm font-semibold text-muted leading-6">All requests must include an <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">x-api-key</code> header. The key is validated against the <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">AGENT_API_KEY</code> environment variable.</p>
        <div className="rounded-lg border border-caution/20 bg-caution/5 px-4 py-3 text-xs font-bold text-caution-text">For the hackathon demo, the default key is <code>hireproof_agent_demo_key</code>.</div>
      </section>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Synchronous Mode</h2>
        <p className="mb-4 text-sm font-semibold text-muted leading-6">Send a request without <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">webhook_url</code> and the server will hold the connection open while it investigates, then return the full <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">AuditReport</code> as JSON.</p>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-black">Async Mode (Webhooks)</h2>
        <p className="mb-4 text-sm font-semibold text-muted leading-6">Include a <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">webhook_url</code> and the server immediately returns <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">202 Accepted</code>. The investigation runs in the background. Once complete, the full <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">AuditReport</code> is POSTed to your webhook.</p>
        <div className="rounded-xl border border-border-soft bg-surface overflow-hidden shadow-sm">
          <div className="border-b border-border-soft px-4 py-2 text-xs font-black text-muted">Example</div>
          <pre className="overflow-x-auto p-4 text-xs leading-6"><code>{`curl -X POST https://yourapp.vercel.app/api/v1/audit \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: hireproof_agent_demo_key" \\
  -d '{
    "text": "We are hiring...",
    "webhook_url": "https://myagent.com/callback"
  }'

# Immediate response:
# 202 {"status":"processing","message":"Investigation started..."}`}</code></pre>
        </div>
      </section>
    </div>
  )
}
