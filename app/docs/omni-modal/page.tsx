export const metadata = { title: 'Omni-Modal Input — HireProof' }
export default function Page() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-black tracking-tight">Omni-Modal Input</h1>
      <p className="mb-8 text-lg font-semibold text-muted">HireProof accepts job posts through three input modalities.</p>
      <div className="space-y-8">
        <section className="rounded-2xl border border-border-soft bg-surface p-6">
          <h2 className="mb-3 text-xl font-black">📝 Text</h2>
          <p className="text-sm font-semibold text-muted leading-6">Paste any job post, recruiter message, email, or chat conversation into the textarea. The AI extracts claims regardless of format.</p>
        </section>
        <section className="rounded-2xl border border-border-soft bg-surface p-6">
          <h2 className="mb-3 text-xl font-black">📸 Image Upload</h2>
          <p className="mb-3 text-sm font-semibold text-muted leading-6">Upload screenshots of WhatsApp chats, Telegram messages, PDF offer letters, or social media posts. The image is converted to base64 and sent to GPT-4o-mini&apos;s vision capabilities for claim extraction.</p>
          <div className="rounded-lg border border-caution/20 bg-caution/5 px-4 py-3 text-xs font-bold text-caution-text">Max file size: 5MB. Accepted formats: PNG, JPG, WebP, GIF.</div>
        </section>
        <section className="rounded-2xl border border-border-soft bg-surface p-6">
          <h2 className="mb-3 text-xl font-black">🎤 Voice Input</h2>
          <p className="mb-3 text-sm font-semibold text-muted leading-6">Click the microphone button to dictate job posts using the browser&apos;s native Web Speech API. Supports continuous dictation — text appends to the textarea as you speak.</p>
          <div className="rounded-lg border border-evidence/20 bg-evidence/5 px-4 py-3 text-xs font-bold text-evidence">Supported browsers: Chrome, Edge, Safari. Gracefully hidden in Firefox and unsupported browsers.</div>
        </section>
      </div>
    </div>
  )
}
