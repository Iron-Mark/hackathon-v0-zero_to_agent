# HireProof Platform Proof Status

Last checked: 2026-04-30

## Summary

Option C is closed for local platform proof and remains blocked for live Slack/production proof.

- Vercel Production now has `WORKFLOW_SECRET` and `HIREPROOF_MODEL` configured.
- Local WDK proof passed: `/api/workflows/audit` accepted a run and returned `wrun_01KQD72F2DVABS2KSFKABWAKXR`.
- Local ChatSDK reply proof passed through `/api/chat/hireproof` and returned a formatted HireProof verdict plus report link.
- Local platform readiness passed for Workflow and AI Gateway with the local proof environment.
- Production proof is still blocked until the checkpoint commit is pushed and Vercel redeploys.
- Real Slack proof is still blocked until `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, and `REDIS_URL` are configured.
- Production AI Gateway proof is still blocked until `AI_GATEWAY_API_KEY` or `VERCEL_AI_GATEWAY_API_KEY` is configured in Vercel.

## Vercel Environment State

Configured in Production:

- `WORKFLOW_SECRET`
- `HIREPROOF_MODEL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `MODEL_PROVIDER_KEY`
- `SERPAPI_API_KEY`

Still missing for full live Option C:

- `SLACK_BOT_TOKEN`
- `SLACK_SIGNING_SECRET`
- `REDIS_URL`
- `AI_GATEWAY_API_KEY` or `VERCEL_AI_GATEWAY_API_KEY`

## Local Proof Results

Local route checks were run against `http://localhost:3002`.

### Readiness

`/api/integrations/proof` returned:

- Overall status: `credential-gated`
- Slack: `credential-gated`
- Workflow: `ready`
- AI Gateway: `ready`

### WDK

`POST /api/workflows/audit` with a local-only workflow secret returned:

- Status: `accepted`
- Track: `Vercel Workflow`
- Run ID: `wrun_01KQD72F2DVABS2KSFKABWAKXR`
- Message: `Workflow run accepted by WDK.`
- Callback URL: `https://example.com/hireproof-callback`

### ChatSDK

`POST /api/chat/hireproof` returned:

- Status: `ChatSDK Agents verdict formatted.`
- Platform: `local`
- A formatted verdict reply
- A local report URL under `/audit/chat_...`

This proves the shared ChatSDK reply path, but not a real Slack event.

## Verification Gates

The current working tree passed:

- `node --test test/polish-hardening.test.mjs test/runtime-wiring.test.mjs`
- `npm run lint`
- `npm run build`
- `git diff --check` with only CRLF warnings

## Production Proof Blockers

1. Create a checkpoint commit using the repository trigger phrase.
2. Push the checkpoint commit to GitHub.
3. Let Vercel deploy the commit that contains:
   - `/api/integrations/proof`
   - `/api/webhooks/slack`
   - `/api/workflows/audit`
4. Add real Slack and Redis credentials:
   - `SLACK_BOT_TOKEN`
   - `SLACK_SIGNING_SECRET`
   - `REDIS_URL`
5. Add AI Gateway credentials if the submission should claim AI Gateway specifically:
   - `AI_GATEWAY_API_KEY`
   - `HIREPROOF_MODEL`
6. Re-run production smoke checks:

```powershell
Invoke-RestMethod https://hireproof-sigma.vercel.app/api/integrations/proof
Invoke-RestMethod https://hireproof-sigma.vercel.app/api/chat/hireproof
Invoke-RestMethod https://hireproof-sigma.vercel.app/api/workflows/audit
```

For real Slack proof, send an app mention in the configured workspace and capture the bot reply plus report link.
