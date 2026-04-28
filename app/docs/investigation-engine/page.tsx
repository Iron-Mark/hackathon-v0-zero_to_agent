export const metadata = { title: 'AI Investigation Engine — HireProof' }
export default function Page() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-black tracking-tight">AI Investigation Engine</h1>
      <p className="mb-8 text-lg font-semibold text-muted">How HireProof&apos;s autonomous agent investigates job posts end-to-end.</p>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Autonomous Agent Loop</h2>
        <p className="mb-4 text-sm font-semibold text-muted leading-6">
          HireProof uses the Vercel AI SDK&apos;s <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">generateText</code> function
          with multi-step tool orchestration. The agent is given 4 MCP tools and autonomously decides which to call, in what order,
          and how to interpret the results — up to a maximum of 5 tool-calling steps.
        </p>
        <div className="rounded-xl border border-border-soft bg-surface overflow-hidden shadow-sm">
          <div className="border-b border-border-soft px-4 py-2 text-xs font-black text-muted">Agent Configuration</div>
          <pre className="overflow-x-auto p-4 text-xs leading-6"><code>{`const result = await generateText({
  model: openai('gpt-4o-mini'),
  stopWhen: stepCountIs(5),
  tools: {
    search_company,   // Check web presence
    news_check,       // Search scam reports
    jobs_compare,     // Find comparable listings
    local_presence,   // Verify local footprint
  },
  prompt: \`You are HireProof Agent...
    Company: \${claims.company}
    Role: \${claims.role}
    Location: \${claims.location}
    Use all tools.\`,
})`}</code></pre>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Claims Extraction</h2>
        <p className="mb-4 text-sm font-semibold text-muted leading-6">
          Before evidence gathering, the AI extracts structured claims from the raw job post using <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">generateObject</code> with a Zod schema.
          This works with text, images (via multi-modal vision), or both.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {['Company Name', 'Job Title', 'Salary', 'Location', 'Contact Method', 'Application Path'].map((claim) => (
            <div key={claim} className="rounded-lg border border-border-soft bg-surface px-4 py-3 text-sm font-black">{claim}</div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-black">Fallback Strategy</h2>
        <p className="text-sm font-semibold text-muted leading-6">
          If the AI SDK is unavailable (no <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">MODEL_PROVIDER_KEY</code>),
          the engine falls back to regex-based extraction. If the agent loop fails, it falls back to direct SerpApi calls.
          If SerpApi is unavailable, it falls back to demo fixtures. The app never crashes — it always produces a result.
        </p>
      </section>
    </div>
  )
}
