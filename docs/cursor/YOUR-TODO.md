# Cursor integration — YOUR-TODO

Last updated by agent: 2026-05-15 (branch `feature/cursor-integration`).

## Done by agent

- Committed cursor ops runbooks and orchestration: `deploy.md`, `automation.md`, `orchestration.md`, `scripts/orchestrate-cursor-phases.{mjs,ps1}`, `scripts/cursor-smoke.mjs` (commit `f3c809e`).
- Pushed `feature/cursor-integration` to `origin`; PR [#2](https://github.com/Iron-Mark/Hackathon-HireProof/pull/2) includes the new commit.
- Local verification passed: `npm run lint`, `node --test test/cursor*.test.mjs` (8/8), `node scripts/orchestrate-cursor-phases.mjs --no-codex`.
- Vercel CLI: `vercel whoami` → `iron-mark`; project already linked (`iron-marks-projects/hireproof`). `vercel env ls` — **no `CURSOR_*` variables yet** (only existing app secrets; all values **Encrypted** in CLI output).
- Added example env script: `scripts/vercel-cursor-env-setup.ps1.example` (placeholders only).
- Codex on PATH: read-only merge checklist run attempted (see PR comment / agent summary).
- PR comment posted with deploy doc link and test plan (if `gh` succeeded).

## You must do

1. **Fix CI before merge** — GitHub Actions `Cursor Integration` failed: `npm ci` — `package-lock.json` out of sync with `package.json` (missing `@swc/helpers@0.5.21`, `chokidar@5.0.0`, etc.). On your machine: `npm install`, commit updated `package-lock.json`, push to `feature/cursor-integration`.
2. **Review and merge PR #2** when CI is green — [https://github.com/Iron-Mark/Hackathon-HireProof/pull/2](https://github.com/Iron-Mark/Hackathon-HireProof/pull/2). Do not merge until you approve.
3. **Enable Cursor Bugbot** in the Cursor dashboard for this repo (rules in `.cursor/BUGBOT.md`).
4. **Set Vercel env** — Copy `scripts/vercel-cursor-env-setup.ps1.example` → `scripts/vercel-cursor-env-setup.ps1`, fill placeholders, run on **Preview** first; or use Dashboard → Settings → Environment Variables. Paste `CURSOR_API_KEY` from Cursor Cloud Agents (never commit).
5. **Generate and set** `CURSOR_WEBHOOK_SECRET` (32-byte hex) on Preview + schedulers; see `docs/cursor/deploy.md`.
6. **Set** `CURSOR_INTEGRATION_ENABLED=true` only after Preview smoke passes; redeploy.
7. **Schedule cron** for nightly repo health / UI QA per `docs/cursor/automation.md` (header `x-cursor-job-secret`).
8. **Test** Developer portal → Cursor Agents and optional `node scripts/cursor-smoke.mjs` against Preview.
9. **Optional** — Full orchestration with Codex:  
   `node scripts/orchestrate-cursor-phases.mjs`  
   (omit `--no-codex`; requires `CURSOR_API_KEY` + flag for phase 2 SDK smoke).

## CI note (current)

| Check | Status |
| --- | --- |
| `lint-build-cursor-tests` | **fail** — lockfile sync (`npm ci`) |
| Vercel Preview | check PR |
| Vercel Preview Comments | pass |

## Links

- Deploy runbook: [deploy.md](./deploy.md)
- Automation / cron: [automation.md](./automation.md)
- Orchestration phases: [orchestration.md](./orchestration.md)
