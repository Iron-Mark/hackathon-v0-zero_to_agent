import { Terminal, FileText, HeartPulse, Settings, Braces, Package, Gauge } from 'lucide-react'
import { CodeBlock } from '@/components/ui/code-block'

export const metadata = {
  title: 'CLI — HireProof Docs',
  description: 'Run HireProof audits from a terminal, CI job, or local automation script.',
}

export default function CliDocsPage() {
  return (
    <div className="space-y-12 pb-24 text-foreground">
      <section className="space-y-4">
        <div className="inline-block rounded-full bg-safe/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-safe">
          Repo-shipped package
        </div>
        <h1 className="text-4xl font-black tracking-tight lg:text-5xl">HireProof CLI</h1>
        <p className="max-w-3xl text-xl font-medium leading-relaxed text-muted">
          A branded terminal command for running HireProof audits without opening the web app. It wraps the same headless API used by agents and automation tools, with rich human output by default and clean JSON when scripts need it.
        </p>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border-soft pb-2">
          <Package className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-black">Status</h2>
        </div>
        <div className="rounded-3xl border border-border-soft bg-surface p-6">
          <p className="text-sm font-semibold leading-relaxed text-muted">
            The CLI source is included in the repo at <code className="rounded bg-background px-1.5 py-0.5">packages/hireproof-cli</code> and is tested locally. It is not published to npm until the owner completes the external publish step.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border-soft pb-2">
          <Terminal className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-black">Run From The Repo</h2>
        </div>
        <CodeBlock
          title="PowerShell"
          code={`npm install
node packages\\hireproof-cli\\bin\\hireproof.mjs --help
node packages\\hireproof-cli\\bin\\hireproof.mjs health
node packages\\hireproof-cli\\bin\\hireproof.mjs audit --text "Remote frontend intern. PHP 80,000/week. No interview. Telegram only." --mode demo`}
        />
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border-soft pb-2">
          <Gauge className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-black">Rich Terminal Report</h2>
        </div>
        <p className="max-w-3xl text-sm font-semibold leading-relaxed text-muted">
          The default audit output is designed for humans: verdict first, risk bar next, then the claims and evidence that explain the result. Interactive terminals use HireProof's green brand accent plus verdict colors, while the layout stays ASCII-safe for PowerShell and CI logs.
        </p>
        <CodeBlock
          title="Example"
          code={`+----------------------------------------------------------+
| HIREPROOF TERMINAL REPORT                                |
+----------------------------------------------------------+
| Target: demo                                             |
| Report: report_demo_high_risk                            |
+----------------------------------------------------------+

Verdict High-Risk   Score: 92/100 [##################--]

+ Summary -------------------------------------------------+
| High-pressure remote offer with off-platform messaging,   |
| unusually high pay, and no normal interview path.         |
+----------------------------------------------------------+

+ Claims --------------------------------------------------+
| Company            Unknown                               |
| Role               Remote frontend intern                |
| Salary             PHP 80,000/week                       |
| Contact            Telegram only                         |
+----------------------------------------------------------+`}
        />
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border-soft pb-2">
          <FileText className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-black">Audit A File</h2>
        </div>
        <CodeBlock
          title="PowerShell"
          code={`node packages\\hireproof-cli\\bin\\hireproof.mjs audit --file .\\job-post.txt --location Philippines
node packages\\hireproof-cli\\bin\\hireproof.mjs audit .\\job-post.txt --json`}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border-soft bg-surface p-6">
          <HeartPulse className="mb-4 h-6 w-6 text-safe" />
          <h2 className="mb-3 text-xl font-black">Health Checks</h2>
          <p className="mb-4 text-sm font-semibold leading-relaxed text-muted">
            Check whether the target HireProof API is reachable before wiring it into a script or CI job.
          </p>
          <CodeBlock title="Terminal" code="hireproof health --base-url https://hireproof-sigma.vercel.app" />
        </div>

        <div className="rounded-3xl border border-border-soft bg-surface p-6">
          <Settings className="mb-4 h-6 w-6 text-safe" />
          <h2 className="mb-3 text-xl font-black">Local Config</h2>
          <p className="mb-4 text-sm font-semibold leading-relaxed text-muted">
            Store default API settings locally, then keep normal audit commands short.
          </p>
          <CodeBlock
            title="Terminal"
            code={`hireproof config set baseUrl https://hireproof-sigma.vercel.app
hireproof config set apiKey hireproof_agent_demo_key
hireproof config list`}
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border-soft pb-2">
          <Terminal className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-black">Output Modes</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border-soft bg-surface p-5">
            <h3 className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-foreground">Rich</h3>
            <p className="text-sm font-semibold leading-relaxed text-muted">
              Default mode for people reading in a terminal. Includes boxes, status labels, a risk bar, and truncated evidence.
            </p>
          </div>
          <div className="rounded-3xl border border-border-soft bg-surface p-5">
            <h3 className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-foreground">JSON</h3>
            <p className="text-sm font-semibold leading-relaxed text-muted">
              Automation-safe output. No banners, no ANSI color, no extra text, and parseable directly by scripts.
            </p>
          </div>
          <div className="rounded-3xl border border-border-soft bg-surface p-5">
            <h3 className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-foreground">Plain</h3>
            <p className="text-sm font-semibold leading-relaxed text-muted">
              Compact text for narrow logs or environments where boxed layout is unwanted.
            </p>
          </div>
        </div>
        <CodeBlock
          title="Terminal"
          code={`hireproof audit --file .\\job-post.txt --plain
hireproof audit --file .\\job-post.txt --no-color
hireproof audit --file .\\job-post.txt --verbose`}
        />
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border-soft pb-2">
          <Braces className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-black">JSON For Automation</h2>
        </div>
        <CodeBlock
          title="Terminal"
          code={`hireproof audit --file .\\job-post.txt --mode demo --json
hireproof audit --text "Suspicious recruiter message..." --webhook-url https://example.com/hireproof-callback --json`}
        />
      </section>
    </div>
  )
}
