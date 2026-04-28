export const metadata = { title: 'Rate Limiting — HireProof' }
export default function Page() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-black tracking-tight">Rate Limiting</h1>
      <p className="mb-8 text-lg font-semibold text-muted">In-memory token bucket rate limiter to prevent abuse.</p>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Tiers</h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-border-soft bg-surface p-5">
            <div className="flex items-center gap-3 mb-2"><span className="rounded-md bg-safe/10 px-2.5 py-1 text-xs font-black text-safe">Public UI</span><code className="text-xs font-mono text-muted">POST /api/audit</code></div>
            <p className="text-sm font-semibold text-muted">5 requests per minute per IP address. Keyed by <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">x-forwarded-for</code> header.</p>
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-5">
            <div className="flex items-center gap-3 mb-2"><span className="rounded-md bg-evidence/10 px-2.5 py-1 text-xs font-black text-evidence">Agent API</span><code className="text-xs font-mono text-muted">POST /api/v1/audit</code></div>
            <p className="text-sm font-semibold text-muted">20 requests per minute per API key. Keyed by the <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">x-api-key</code> header value.</p>
          </div>
        </div>
      </section>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Implementation</h2>
        <p className="mb-4 text-sm font-semibold text-muted leading-6">Uses a sliding window counter stored in an in-memory <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">Map</code>. Each key tracks the number of requests and the window start timestamp. When the window expires, the counter resets.</p>
        <div className="rounded-lg border border-caution/20 bg-caution/5 px-4 py-3 text-xs font-bold text-caution-text">⚠️ The in-memory Map resets on server restart. For production, replace with <code>@upstash/ratelimit</code> or Redis-backed storage.</div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-black">Error Response</h2>
        <div className="rounded-xl border border-border-soft bg-surface overflow-hidden shadow-sm">
          <div className="border-b border-border-soft px-4 py-2 text-xs font-black text-muted">429 Too Many Requests</div>
          <pre className="overflow-x-auto p-4 text-xs leading-6"><code>{`{
  "error": "Rate limit exceeded. Please try again later."
}`}</code></pre>
        </div>
      </section>
    </div>
  )
}
