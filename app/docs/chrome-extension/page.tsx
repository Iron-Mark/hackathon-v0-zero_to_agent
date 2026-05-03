import { Download, Info, MousePointer2, PackageCheck, Puzzle, ShieldCheck, Zap } from 'lucide-react'

export const metadata = { 
  title: 'Chrome Extension — HireProof Docs',
  description: 'Learn how to use the HireProof Chrome Extension to scan job posts directly from your browser.'
}

export default function ChromeExtensionPage() {
  return (
    <div className="space-y-12 pb-24 text-foreground">
      <section className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight lg:text-5xl">Chrome Extension</h1>
        <p className="text-xl font-medium leading-relaxed text-muted">
          The fastest way to verify a job post. Scan any listing on LinkedIn, Indeed, or Telegram without ever leaving the page.
        </p>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <a
            href="/api/downloads/hireproof-extension.zip"
            download
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-black text-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-safe/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Download className="h-4 w-4" />
            Download Chrome ZIP
          </a>
          <span
            aria-disabled="true"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-soft bg-surface px-5 py-3 text-sm font-black text-muted"
          >
            <ShieldCheck className="h-4 w-4" />
            Chrome Web Store coming soon
          </span>
        </div>
        <p className="text-xs font-bold leading-relaxed text-muted">
          Chrome Web Store publication is still pending review. Until then, use the ZIP for manual Developer mode install.
        </p>
      </section>

      {/* Installation */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border-soft pb-2">
          <Puzzle className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-black">Getting Started</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border-soft bg-surface p-8 shadow-sm">
            <h3 className="mb-2 font-black">1. Install</h3>
            <p className="text-sm font-medium text-muted leading-relaxed">
              Download <code className="bg-background px-1 rounded">hireproof-extension.zip</code>, unzip it, then load the unzipped folder in Chrome Developer mode.
            </p>
          </div>
          <div className="rounded-3xl border border-border-soft bg-surface p-8 shadow-sm">
            <h3 className="mb-2 font-black">2. Pin it</h3>
            <p className="text-sm font-medium text-muted leading-relaxed">
              Pin HireProof to your toolbar for instant access to the investigation console.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border-soft pb-2">
          <Zap className="h-6 w-6 text-foreground" />
          <h2 className="text-2xl font-black">Core Features</h2>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4 rounded-2xl border border-border-soft bg-surface p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-safe/10 text-safe">
              <MousePointer2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-black">Right-Click to Scan</h4>
              <p className="text-xs font-medium text-muted leading-relaxed">
                Highlight any text on a webpage, right-click, and select <strong>"Scan with HireProof"</strong>. The extension will automatically extract claims and start the investigation.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-2xl border border-border-soft bg-surface p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-evidence/10 text-evidence">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-black">Job Check Popup</h4>
              <p className="text-xs font-medium text-muted leading-relaxed">
                Open the extension popup to see the live Risk Score and Verdict without switching tabs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Spec */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border-soft pb-2">
          <Info className="h-6 w-6 text-muted" />
          <h2 className="text-2xl font-black">Technical Specifications</h2>
        </div>
        <p className="font-medium text-muted leading-relaxed">
          The extension is built on <strong>Manifest V3</strong>, ensuring compatibility with the latest browser privacy standards. It utilizes a background service worker to handle API communications securely.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-border-soft bg-surface p-6">
        <div className="flex items-center gap-3">
          <PackageCheck className="h-6 w-6 text-safe" />
          <h2 className="text-2xl font-black">Local Package</h2>
        </div>
        <p className="font-medium text-muted leading-relaxed">
          HireProof now ships a validated browser-extension ZIP at <code className="bg-background px-1 rounded">/downloads/hireproof-extension.zip</code>. The package is generated from <code className="bg-background px-1 rounded">extension/</code> with <code className="bg-background px-1 rounded">npm run package:extension</code>, then published to <code className="bg-background px-1 rounded">public/downloads/</code> for the site download.
        </p>
        <ol className="space-y-2 text-sm font-semibold leading-relaxed text-muted">
          <li>1. Download and unzip the package.</li>
          <li>2. Open <code className="bg-background px-1 rounded">chrome://extensions</code>.</li>
          <li>3. Enable Developer mode.</li>
          <li>4. Click Load unpacked and select the unzipped <code className="bg-background px-1 rounded">hireproof-extension</code> folder.</li>
        </ol>
        <p className="text-sm font-semibold leading-relaxed text-muted">
          Public Chrome Web Store publication still depends on a developer account, privacy form, screenshots, and Google review.
        </p>
      </section>
    </div>
  )
}
