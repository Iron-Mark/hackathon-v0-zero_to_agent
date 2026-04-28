export const metadata = { title: 'MCP Server — HireProof' }
export default function Page() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-black tracking-tight">MCP Server</h1>
      <p className="mb-8 text-lg font-semibold text-muted">HireProof exposes 4 investigation tools via the Model Context Protocol, allowing external AI agents to call them directly.</p>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Available Tools</h2>
        <div className="space-y-4">
          {[
            { name: 'search_company', desc: 'Searches Google for the company website, LinkedIn page, and overall web presence. Returns evidence items with source URLs.', params: 'company_name (required), role (optional)' },
            { name: 'news_check', desc: 'Searches Google News for scam reports, fraud warnings, and reputation signals about the company.', params: 'company_name (required), keywords (optional array)' },
            { name: 'jobs_compare', desc: 'Searches job boards for comparable roles to benchmark salary and requirements against the market.', params: 'role (required), location (optional), level (optional)' },
            { name: 'local_presence', desc: 'Searches Google Maps for the company\'s physical address, office registration, and local business footprint.', params: 'company_name (required), location (optional)' },
          ].map((tool) => (
            <div key={tool.name} className="rounded-xl border border-border-soft bg-surface p-5">
              <code className="text-sm font-black text-evidence">{tool.name}</code>
              <p className="mt-2 text-xs font-semibold text-muted leading-5">{tool.desc}</p>
              <div className="mt-2 text-[10px] font-bold text-muted">Params: {tool.params}</div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-black">Usage</h2>
        <div className="rounded-xl border border-border-soft bg-surface overflow-hidden shadow-sm">
          <div className="border-b border-border-soft px-4 py-2 text-xs font-black text-muted">List all tools</div>
          <pre className="overflow-x-auto p-4 text-xs leading-6"><code>{`curl https://yourapp.vercel.app/api/mcp \\
  -H "x-api-key: hireproof_agent_demo_key"`}</code></pre>
        </div>
        <div className="mt-4 rounded-xl border border-border-soft bg-surface overflow-hidden shadow-sm">
          <div className="border-b border-border-soft px-4 py-2 text-xs font-black text-muted">Call a tool</div>
          <pre className="overflow-x-auto p-4 text-xs leading-6"><code>{`curl -X POST https://yourapp.vercel.app/api/mcp \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: hireproof_agent_demo_key" \\
  -d '{"method":"tools/call","name":"search_company","arguments":{"company_name":"Accenture"}}'`}</code></pre>
        </div>
      </section>
    </div>
  )
}
