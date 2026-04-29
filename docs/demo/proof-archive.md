# HireProof Demo Proof Archive

Last checked: 2026-04-30

This file keeps the judge-facing proof artifacts in one place. It intentionally avoids secrets, request headers, tokens, and private Slack workspace identifiers.

## Production URL

- Stable demo: `https://hireproof-sigma.vercel.app`
- Latest production deployment checked in this pass: `https://hireproof-rcl83qwoo-iron-marks-projects.vercel.app`
- Vercel inspector: `https://vercel.com/iron-marks-projects/hireproof/8rcX1EPKySBDtPTFBCtUS8cEEFaL`

## Readiness Proof

Production `GET /api/integrations/proof` returned:

- Status: `ready`
- ChatSDK Slack: `ready`
- Vercel Workflow / WDK: `ready`
- AI Gateway: `ready`

Production `GET /api/health` returned:

- Status: `ok`
- Storage: `redis`
- Model configured: `true`
- AI Gateway provider: `true`

## ChatSDK Slack Proof

- Proof type: real Slack mention to `@HireProof`
- Result: HireProof returned a High-Risk verdict with score, top red flags, and checked evidence categories.
- Screenshot: [`Screenshot 2026-04-30 024756.jpg`](Screenshot%202026-04-30%20024756.jpg)
- Public webhook route: `POST /api/webhooks/slack`
- Local formatted-reply route for demos: `POST /api/chat/hireproof`

Use this claim in the submission:

> ChatSDK is live-tested in Slack with screenshot proof. A real `@HireProof` mention returned a High-Risk job-scam verdict.

## Vercel Workflow / WDK Proof

Production `POST /api/workflows/audit` returned:

- HTTP status: `202`
- Status: `accepted`
- Track: `Vercel Workflow`
- Run ID: `wrun_01KQD9H6AND3W7YZBHHKAH2KV5`
- Message: `Workflow run accepted by WDK.`
- Callback URL used for proof: `https://example.com/hireproof-callback`
- Report base URL: `https://hireproof-sigma.vercel.app/audit/[id]`

Vercel logs showed the WDK request:

- Log ID: `bjphw-1777488925775-e90c0f5c6010`
- Deployment ID: `dpl_GbQ2SAk34UZgnKvfr3eK3GVJRXAo`
- Domain: `hireproof-sigma.vercel.app`
- Method/path: `POST /api/workflows/audit`
- Response: `202`
- Environment: `production`

Use this claim in the submission:

> WDK has a production-accepted workflow run. The route started a deployed workflow and returned run ID `wrun_01KQD9H6AND3W7YZBHHKAH2KV5`.

Do not claim a completed durable report callback unless a callback result is captured separately.

## Final Demo Order

1. Open `https://hireproof-sigma.vercel.app/audit`.
2. Paste the suspicious remote frontend internship sample.
3. Show the High-Risk report, red flags, and evidence sections.
4. Show the Slack screenshot proof.
5. Mention the WDK accepted run ID and the `/api/workflows/audit` proof route.

## Final Smoke Commands

```powershell
$base='https://hireproof-sigma.vercel.app'
Invoke-RestMethod -Uri "$base/api/health"
Invoke-RestMethod -Uri "$base/api/integrations/proof"
```
