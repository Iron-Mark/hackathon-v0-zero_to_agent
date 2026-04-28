export const metadata = { title: 'Real-Time Streaming — HireProof' }
export default function Page() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-black tracking-tight">Real-Time Streaming</h1>
      <p className="mb-8 text-lg font-semibold text-muted">Watch the AI agent think and gather evidence in real-time via Server-Sent Events.</p>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">SSE Protocol</h2>
        <p className="mb-4 text-sm font-semibold text-muted leading-6">The <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">POST /api/audit</code> endpoint uses a <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">TransformStream</code> to emit Server-Sent Events. The frontend consumes these with a <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">ReadableStream</code> reader, displaying each agent step as it happens.</p>
        <div className="rounded-xl border border-border-soft bg-surface overflow-hidden shadow-sm">
          <div className="border-b border-border-soft px-4 py-2 text-xs font-black text-muted">Event Types</div>
          <pre className="overflow-x-auto p-4 text-xs leading-6"><code>{`thinking  — Agent progress updates (extracting, searching, scoring)
result    — Final AuditReport JSON payload
error     — Error message if investigation fails`}</code></pre>
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-black">Frontend Consumer</h2>
        <div className="rounded-xl border border-border-soft bg-surface overflow-hidden shadow-sm">
          <div className="border-b border-border-soft px-4 py-2 text-xs font-black text-muted">React Hook Pattern</div>
          <pre className="overflow-x-auto p-4 text-xs leading-6"><code>{`const response = await fetch('/api/audit', { method: 'POST', body })
const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  
  const lines = decoder.decode(value).split('\\n')
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const parsed = JSON.parse(line.slice(6))
      if (parsed.type === 'thinking') setSteps(prev => [...prev, parsed])
      else if (parsed.type === 'result') setResult(parsed.data)
    }
  }
}`}</code></pre>
        </div>
      </section>
    </div>
  )
}
