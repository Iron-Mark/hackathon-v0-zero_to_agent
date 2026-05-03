# Final Live vs Pending Status

Last checked: 2026-05-04

This is the concise status boundary for submission, demos, and reviewer conversations.

## Live / Repo-Controlled

| Area | Status | Evidence path |
| --- | --- | --- |
| Stable production site | Live | `https://hireproof-sigma.vercel.app` |
| Web audit flow | Implemented | `/audit` and demo scenarios |
| Demo audit API | Live | `POST /api/v1/audit` with `hireproof_agent_demo_key` |
| MCP investigation tools | Implemented | `/api/mcp` and docs |
| ChatSDK shared bot path | Implemented | `/api/chat/hireproof`, `/api/webhooks/*` |
| Slack proof | Screenshot-proven | `docs/demo/Screenshot 2026-04-30 024756.jpg` |
| Telegram proof | Live delivery proven | `docs/platform-proof-status.md` |
| WDK route | Production accepted-run proven | run ID `wrun_01KQD9H6AND3W7YZBHHKAH2KV5` |
| Native automation packs | Repo-shipped and validated | `integrations/`, `packages/hireproof-langchain`, `/docs/automations` |
| Native integrations ZIP | Live download | `/downloads/hireproof-native-integrations.zip` |
| Chrome extension ZIP | Live download fallback | `/downloads/hireproof-extension.zip` |
| Docker packaging | Implemented | `Dockerfile`, `docker-compose.yml`, `npm run docker:*` |
| PDF/PNG/CSV exports | Implemented | result screen and trends dashboard |

## Pending External Proof

| Area | Pending item | Why it is pending |
| --- | --- | --- |
| Chrome Web Store | Public listing approval | Requires developer-dashboard submission and Google review |
| Discord | Real message screenshot and matching webhook log | Credentials/webhook are ready, but live event proof is still needed |
| WhatsApp/Zernio | Credentials plus real event proof | Requires Zernio account credentials and provider event |
| npm package | Publish `@hireproof/langchain` | Requires npm account ownership and publish action |
| n8n community node | Community listing approval | Requires n8n review after local install screenshots |
| Make Custom App | Make review approval | Requires Make developer account and review flow |
| WDK completed transcript | Completed durable run with callback proof | Current proof is accepted-run only |

## Safe Submission Wording

Use:

> HireProof is a production-deployed job-post verification agent with web, API, MCP, ChatSDK, WDK, Chrome extension package, and repo-shipped n8n, Make, and LangChain integration surfaces.

Avoid:

> HireProof is published on the Chrome Web Store, npm, n8n marketplace, and Make marketplace.

Avoid:

> The WDK workflow completed a full durable investigation transcript.

Use instead:

> The WDK route has production accepted-run proof; completed timeline and callback evidence are the next milestone.

## Final Pre-Submission Smoke

```powershell
$base='https://hireproof-sigma.vercel.app'
Invoke-RestMethod -Uri "$base/api/health"
Invoke-RestMethod -Uri "$base/api/integrations/proof"
Invoke-RestMethod -Uri "$base/api/v1/audit" -Method Post -ContentType 'application/json' -Headers @{'x-api-key'='hireproof_agent_demo_key'} -Body (@{text='Remote frontend intern. PHP 80,000/week. No interview. Message us on Telegram.'; mode='demo'} | ConvertTo-Json)
Invoke-WebRequest -UseBasicParsing "$base/downloads/hireproof-native-integrations.zip"
Invoke-WebRequest -UseBasicParsing "$base/downloads/hireproof-extension.zip"
```
