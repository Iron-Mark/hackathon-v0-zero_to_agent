'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Building2, CheckCircle2, ClipboardCheck, Mail, ShieldAlert, UsersRound } from 'lucide-react'
import { trackProductEvent } from '@/components/analytics/product-event-tracker'

const pilotTypes = ['Career community', 'School or bootcamp', 'Recruiter or job board', 'Developer/API integration']

export function PilotIntakeClient() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [pilotType, setPilotType] = useState(pilotTypes[0])
  const [workflow, setWorkflow] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(`HireProof pilot request - ${organization || pilotType}`)
    const body = encodeURIComponent([
      `Name: ${name}`,
      `Email: ${email}`,
      `Organization: ${organization}`,
      `Pilot type: ${pilotType}`,
      '',
      'Workflow to validate:',
      workflow,
    ].join('\n'))
    return `mailto:hello@hireproof.tech?subject=${subject}&body=${body}`
  }, [email, name, organization, pilotType, workflow])

  const canSubmit = name.trim() && email.trim() && workflow.trim().length >= 20 && status !== 'saving'

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)]">
      <section className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-safe/30 bg-safe/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-safe">
          <UsersRound className="h-4 w-4" />
          Pilot intake
        </div>
        <h1 className="text-4xl font-black tracking-tight md:text-5xl">Test HireProof with a real job-safety workflow.</h1>
        <p className="text-base font-semibold leading-7 text-muted">
          Use this for career communities, schools, recruiters, job boards, and builders who want a small proof run
          before adding billing or broad live provider access.
        </p>
        <div className="grid gap-3">
          {[
            ['Public demo stays available', 'Seeded reports and proof pages keep evaluation low-friction.'],
            ['Live checks go BYOK-first', 'Serious provider usage should use owner credentials and cost limits.'],
            ['Pilot decides the roadmap', 'Repeat use, false positives, exports, and API demand determine the next build.'],
          ].map(([title, body]) => (
            <div key={title} className="flex gap-3 rounded-2xl border border-border-soft bg-surface p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-safe" />
              <div>
                <h2 className="text-sm font-black">{title}</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!canSubmit) return
          setStatus('saving')
          setMessage('')
          fetch('/api/pilot/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              organization,
              pilotType,
              workflow,
              sourcePath: '/pilot',
            }),
          })
            .then(async (response) => {
              const data = await response.json().catch(() => ({}))
              if (!response.ok) throw new Error(data.error || 'Could not save pilot request.')
              setStatus('saved')
              setMessage('Pilot request saved. You can also send the email draft if you want a direct inbox copy.')
              trackProductEvent('pilot_request_client_saved', { pilotType })
            })
            .catch((error) => {
              setStatus('error')
              setMessage(error instanceof Error ? error.message : 'Could not save pilot request. Use the email fallback below.')
            })
        }}
        className="rounded-2xl border border-border-soft bg-surface p-5 shadow-2xl shadow-safe/10 md:p-6"
      >
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-safe-bg text-safe">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black">Request a pilot</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-muted">Stores the request for follow-up and keeps an email fallback for direct outreach.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-black">
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} className="hireproof-focus mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm font-semibold outline-none focus:border-safe" autoComplete="name" />
          </label>
          <label className="text-sm font-black">
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="hireproof-focus mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm font-semibold outline-none focus:border-safe" autoComplete="email" />
          </label>
          <label className="text-sm font-black sm:col-span-2">
            Organization
            <input value={organization} onChange={(event) => setOrganization(event.target.value)} className="hireproof-focus mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm font-semibold outline-none focus:border-safe" autoComplete="organization" placeholder="Community, school, company, or project" />
          </label>
          <label className="text-sm font-black sm:col-span-2">
            Pilot type
            <select value={pilotType} onChange={(event) => setPilotType(event.target.value)} className="hireproof-focus mt-2 w-full rounded-xl border border-border bg-background p-3 text-sm font-semibold outline-none focus:border-safe">
              {pilotTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label className="text-sm font-black sm:col-span-2">
            Workflow to validate
            <textarea
              value={workflow}
              onChange={(event) => setWorkflow(event.target.value)}
              rows={5}
              className="hireproof-focus mt-2 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm font-semibold leading-6 outline-none focus:border-safe"
              placeholder="Example: members post suspicious recruiter messages in Discord and moderators need a repeatable evidence report before warning the group."
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="hireproof-focus hireproof-cta-primary mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'saving' ? 'Saving request...' : 'Save pilot request'} <ArrowRight className="h-4 w-4" />
        </button>

        <a
          href={mailtoHref}
          onClick={() => trackProductEvent('pilot_email_fallback_opened', { pilotType })}
          className="hireproof-focus mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border-soft bg-background px-4 py-3 text-sm font-black hover:bg-surface"
        >
          Open email fallback <Mail className="h-4 w-4" />
        </a>

        {message && (
          <div className={`mt-4 flex gap-3 rounded-xl border p-3 text-sm font-semibold leading-6 ${
            status === 'error'
              ? 'border-risk-bg/30 bg-risk-bg/10 text-risk-text'
              : 'border-safe/25 bg-safe/10 text-safe'
          }`}>
            <Mail className="mt-0.5 h-4 w-4 shrink-0" />
            {message}
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border-soft bg-background p-4">
            <Building2 className="mb-3 h-5 w-5 text-safe" />
            <h3 className="text-sm font-black">Best first pilot</h3>
            <p className="mt-1 text-xs font-semibold leading-5 text-muted">3-5 groups with real suspicious posts and one repeatable review flow.</p>
          </div>
          <div className="rounded-xl border border-border-soft bg-background p-4">
            <ShieldAlert className="mb-3 h-5 w-5 text-caution" />
            <h3 className="text-sm font-black">Guardrail</h3>
            <p className="mt-1 text-xs font-semibold leading-5 text-muted">No broad fraud promises, no unlimited public live-provider spend.</p>
          </div>
        </div>
      </form>
    </div>
  )
}
