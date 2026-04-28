export const metadata = { title: 'Authentication — HireProof' }
export default function Page() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-black tracking-tight">Authentication</h1>
      <p className="mb-8 text-lg font-semibold text-muted">How HireProof secures its Agent-to-Agent endpoints.</p>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">API Key Authentication</h2>
        <p className="mb-4 text-sm font-semibold text-muted leading-6">The Headless API (<code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">/api/v1/audit</code>) and MCP Server (<code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">/api/mcp</code>) require an <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">x-api-key</code> header on every request.</p>
        <div className="rounded-xl border border-border-soft bg-surface overflow-hidden shadow-sm">
          <div className="border-b border-border-soft px-4 py-2 text-xs font-black text-muted">Header</div>
          <pre className="overflow-x-auto p-4 text-sm leading-7"><code>x-api-key: your_secret_api_key</code></pre>
        </div>
      </section>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Configuration</h2>
        <p className="mb-4 text-sm font-semibold text-muted leading-6">Set the <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">AGENT_API_KEY</code> environment variable. If unset, the system defaults to <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">hireproof_agent_demo_key</code> for local development.</p>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-black">Public vs Protected Endpoints</h2>
        <div className="overflow-hidden rounded-xl border border-border-soft">
          <table className="w-full text-xs"><thead><tr className="border-b border-border-soft bg-surface">
            <th className="px-4 py-2.5 text-left font-black text-muted">Endpoint</th>
            <th className="px-4 py-2.5 text-left font-black text-muted">Auth</th>
            <th className="px-4 py-2.5 text-left font-black text-muted">Rate Limit</th>
          </tr></thead><tbody>
            <tr className="border-b border-border-soft"><td className="px-4 py-2.5 font-mono font-bold">POST /api/audit</td><td className="px-4 py-2.5 text-safe font-black">None (public)</td><td className="px-4 py-2.5 text-muted">5/min per IP</td></tr>
            <tr className="border-b border-border-soft"><td className="px-4 py-2.5 font-mono font-bold">POST /api/v1/audit</td><td className="px-4 py-2.5 text-caution font-black">x-api-key</td><td className="px-4 py-2.5 text-muted">20/min per key</td></tr>
            <tr className="border-b border-border-soft"><td className="px-4 py-2.5 font-mono font-bold">POST /api/mcp</td><td className="px-4 py-2.5 text-caution font-black">x-api-key</td><td className="px-4 py-2.5 text-muted">None</td></tr>
            <tr><td className="px-4 py-2.5 font-mono font-bold">GET /api/mcp</td><td className="px-4 py-2.5 text-caution font-black">x-api-key</td><td className="px-4 py-2.5 text-muted">None</td></tr>
          </tbody></table>
        </div>
      </section>
    </div>
  )
}
