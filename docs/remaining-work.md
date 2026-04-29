# HireProof Remaining Work

Last checked: 2026-04-29

The runtime wiring pass is now in place. The remaining items below are the real follow-through work that is still not finished, plus a few docs/hardening items that should be kept honest in the repo.

## Verified Runtime Wiring

- `explore` now reads from the intelligence reports path used by the API.
- `trends` now maps the stored report shape into the UI sections it renders.
- Missing-user auth now uses a valid dummy `scrypt` hash path.
- `/lab` now streams real `/api/audit` SSE events instead of timed fake telemetry.
- ChatSDK package wiring exists for Slack mentions and subscribed messages.
- WDK package wiring exists for `startAuditWorkflow` through `/api/workflows/audit`.

## P1 - Product Wiring Still Incomplete

- **BYOK settings are verified but not used by server-side live audits**
  - Current UI: developer portal stores OpenAI/SerpApi keys in `localStorage` and can verify them through `/api/developer/verify-infrastructure`.
  - Current server: `/api/audit`, `/api/v1/audit`, and MCP tools still read provider keys from server env vars.
  - Fix: either persist per-user infrastructure keys securely server-side or relabel the current BYOK panel as local verification only.
  - Acceptance: a user-provided key can actually power that user account's live audits, or the UI stops implying that it does.

- **Webhook sandbox sends mock payloads**
  - Current route: `app/api/developer/webhook-test/route.ts` sends a test payload only.
  - Missing: signature parity with production audit webhooks and a real event preview based on the user's latest audit.
  - Fix: sign sandbox payloads with the same scheme as `/api/v1/audit` webhook delivery and show the exact headers/body in the UI.
  - Acceptance: webhook receivers can validate sandbox and production webhook signatures the same way.

- **Verified badge endpoint validates only key existence plus domain presence**
  - Current route: `/api/verified-badge`.
  - Missing: domain ownership, allowed-domain records, badge script asset, and browser embed flow.
  - Fix: add account-level allowed domains and a small script endpoint, or keep the docs framed as API validation only.
  - Acceptance: a third-party career page can embed the badge and receive a true/false verified state tied to its domain.

- **Live ChatSDK and WDK proof still needs credentials**
  - Current code: Slack webhook and WDK route are implemented and locally verified at the route/build level.
  - Missing: real Slack app credentials, Redis state URL, Vercel Workflow deployment credentials, and captured platform events.
  - Fix: configure `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `REDIS_URL`, `WORKFLOW_SECRET`, `AI_GATEWAY_API_KEY`, and `HIREPROOF_MODEL` in the target Vercel project.
  - Acceptance: a real Slack mention creates a HireProof reply with a report link, and `/api/workflows/audit` returns a real WDK run ID from a deployed environment.

## P2 - Polish, Docs, and Hardening

- **Chrome extension distribution claim needs verification**
  - Current docs mention Chrome Web Store availability.
  - Fix: replace with local install wording until a real store listing exists.
  - Acceptance: docs only claim distribution channels that are live.

- **Report phishing mailto uses wrong claim keys**
  - Current component references capitalized claim fields such as `Company` and `Role`.
  - Schema uses lowercase fields: `company`, `role`, `salary`, `location`, `contactMethod`, `applicationPath`.
  - Fix: update the mailto body to use lowercase schema keys.
  - Acceptance: generated report emails include the actual company and role.

- **Trend export is not a PDF report**
  - Current plan expected downloadable trend output.
  - Current UI should be checked for whether export exists and whether it is JSON, print, or PDF.
  - Fix: implement a clear export format and label the button accurately.
  - Acceptance: the export button downloads exactly the format named in the UI.

- **Local JSON storage needs cleanup controls**
  - Current local fallback writes users, keys, usage, and reports under `data/`.
  - Missing: retention policy controls for users/usage and a maintenance command.
  - Fix: add retention limits and a documented cleanup flow.
  - Acceptance: local development data does not grow unbounded.

## Verification Checklist

Before closing this punch list, run:

```powershell
node --test test/auth-core.test.mjs
node --test test/runtime-wiring.test.mjs
npm run lint
npm run build
```

Then smoke test:

```powershell
$base='http://localhost:3002'
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Invoke-RestMethod -Uri "$base/api/auth/register" -Method Post -ContentType 'application/json' -Body (@{email='smoke@example.test'; password='Password123!'; name='Smoke'} | ConvertTo-Json) -WebSession $session
$key = Invoke-RestMethod -Uri "$base/api/developer/keys" -Method Post -ContentType 'application/json' -Body (@{name='Smoke Key'} | ConvertTo-Json) -WebSession $session
Invoke-RestMethod -Uri "$base/api/v1/audit" -Method Post -ContentType 'application/json' -Headers @{'x-api-key'=$key.rawKey} -Body (@{text='Remote frontend intern. PHP 80,000/week. No interview. Message us on Telegram.'; mode='demo'} | ConvertTo-Json)
Invoke-RestMethod -Uri "$base/api/intelligence/reports" -Method Get
Invoke-RestMethod -Uri "$base/api/intelligence/trends" -Method Get
```
