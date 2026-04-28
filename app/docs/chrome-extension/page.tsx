export const metadata = { title: 'Chrome Extension — HireProof' }
export default function Page() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-black tracking-tight">Chrome Extension</h1>
      <p className="mb-8 text-lg font-semibold text-muted">Scan any webpage for job scams directly from the browser toolbar.</p>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Installation</h2>
        <div className="space-y-3">
          {['Open chrome://extensions in Chrome or Edge', 'Enable "Developer mode" (top right toggle)', 'Click "Load unpacked"', 'Select the extension/ folder from the project root', 'The HireProof icon appears in the browser toolbar'].map((step, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-border-soft bg-surface p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-safe text-xs font-black text-white">{i + 1}</span>
              <p className="text-sm font-semibold text-muted">{step}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Features</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border-soft bg-surface p-5">
            <div className="text-sm font-black">🔍 Scan This Page</div>
            <p className="mt-2 text-xs font-semibold text-muted">Extracts job description text from the active tab (LinkedIn, Indeed, Glassdoor, generic pages) and sends it to the Headless API.</p>
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-5">
            <div className="text-sm font-black">📋 Paste & Check</div>
            <p className="mt-2 text-xs font-semibold text-muted">Manual input for pasting job posts, recruiter messages, or emails directly into the popup.</p>
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-5">
            <div className="text-sm font-black">⚙️ Configurable</div>
            <p className="mt-2 text-xs font-semibold text-muted">Server URL and API key fields so it works against localhost or production deployments.</p>
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-5">
            <div className="text-sm font-black">🔗 Full Report Link</div>
            <p className="mt-2 text-xs font-semibold text-muted">Click through to the full permalink report in the main HireProof web app.</p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-black">Technical Details</h2>
        <p className="text-sm font-semibold text-muted leading-6">Built with Manifest V3. Uses <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">chrome.scripting.executeScript</code> to extract page content. Requires <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">activeTab</code> and <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">scripting</code> permissions. No background service worker required.</p>
      </section>
    </div>
  )
}
