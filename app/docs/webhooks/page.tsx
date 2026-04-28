export const metadata = { title: 'Webhooks — HireProof' }
export default function Page() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-black tracking-tight">Webhooks</h1>
      <p className="mb-8 text-lg font-semibold text-muted">Fire-and-forget async investigations with callback delivery.</p>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">How It Works</h2>
        <div className="space-y-3">
          {[
            { s: '1', t: 'Your agent sends a POST to /api/v1/audit with a webhook_url field' },
            { s: '2', t: 'HireProof immediately returns 202 Accepted' },
            { s: '3', t: 'The investigation runs in the background (10-30 seconds)' },
            { s: '4', t: 'Once complete, HireProof POSTs the full AuditReport to your webhook_url' },
          ].map(({ s, t }) => (
            <div key={s} className="flex gap-3 rounded-xl border border-border-soft bg-surface p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-evidence text-xs font-black text-white">{s}</span>
              <p className="text-sm font-semibold text-muted">{t}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-black">Webhook Payload</h2>
        <p className="mb-4 text-sm font-semibold text-muted leading-6">Your webhook endpoint will receive a <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">POST</code> with <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">Content-Type: application/json</code> containing the full <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">AuditReport</code> object — identical to the synchronous response format.</p>
        <div className="rounded-lg border border-caution/20 bg-caution/5 px-4 py-3 text-xs font-bold text-caution-text">Note: There is currently no retry mechanism if your webhook returns a non-2xx status. In production, implement retry with exponential backoff.</div>
      </section>
    </div>
  )
}
