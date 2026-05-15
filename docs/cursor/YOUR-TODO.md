# Cursor integration — YOUR-TODO

Last updated by agent: 2026-05-15 (branch `feature/cursor-integration`).

**Multi-machine:** run `.\scripts\sync-cursor-branch.ps1` before editing.

## Done by agent

- Staged and committed cursor integration polish: Turbopack `*.LICENSE.txt` rule in `next.config.js`, pretool guard + tests, `.cursor/environment.json` + rules, cloud-environments doc + site page, cursor docs updates (`deploy.md`, `automation.md`, `sdk.md`, `overview.md`, `bugbot.md`).
- Pushed `feature/cursor-integration` to `origin`; PR [#2](https://github.com/Iron-Mark/Hackathon-HireProof/pull/2) includes all commits (see PR comment for SHAs).
- **CI fix:** `package-lock.json` regenerated with `npx npm@10.8.2 install --package-lock-only`; `overrides` for `@swc/helpers@0.5.21` and `chokidar@5.0.0` (commit after `6c0b727`).
- **Verify:** `npm run lint` pass; `node --test test/cursor*.test.mjs` **10/10** pass; `npm run cursor:orchestrate -- --no-codex` pass; full `npm run cursor:orchestrate` pass (Codex deploy checklist phase 3).
- **Build:** `npm run build` — Turbopack compiles; on Windows, delete `.next` if a stale workflow `.map` write fails, then rebuild.
- **Vercel CLI:** `vercel whoami` → `iron-mark`; project linked (`iron-marks-projects/hireproof`). `vercel env ls` — **no `CURSOR_*` variables yet** (existing app secrets only; values **Encrypted** in CLI).
- Interactive env script: `scripts/setup-cursor-secrets.ps1` (prompts for API key, auto-generates webhook secret, sets Preview + Production).
- Non-interactive / example: `scripts/vercel-cursor-env-setup.ps1` or `scripts/vercel-cursor-env-setup.ps1.example`.
- PR comment posted with commit SHAs, doc links, test summary, and manual `CURSOR_API_KEY` note.

## You must do

1. **Review and merge PR #2** when CI is green — [https://github.com/Iron-Mark/Hackathon-HireProof/pull/2](https://github.com/Iron-Mark/Hackathon-HireProof/pull/2). Do not merge until you approve. (Lockfile sync pushed by agent; re-check `lint-build-cursor-tests`.)
2. **Set Vercel secrets** — From repo root run `.\scripts\setup-cursor-secrets.ps1` (interactive; Preview + Production). Or copy `scripts/vercel-cursor-env-setup.ps1.example` → `scripts/vercel-cursor-env-setup.ps1`, fill placeholders. Paste `CURSOR_API_KEY` from Cursor Cloud Agents (never commit).
3. **Generate and set** `CURSOR_WEBHOOK_SECRET` (32-byte hex) on Preview + schedulers; see [deploy.md](./deploy.md).
4. **Set** `CURSOR_INTEGRATION_ENABLED=true` only after Preview smoke passes; redeploy.
5. **Enable Cursor Bugbot** in the Cursor dashboard for this repo (rules in `.cursor/BUGBOT.md`).
6. **Schedule cron** for nightly repo health / UI QA per [automation.md](./automation.md) (header `x-cursor-job-secret`).
7. **Smoke** Developer portal → Cursor Agents and optional `node scripts/cursor-smoke.mjs` against Preview.
8. **Optional** — Phase 2 SDK smoke needs local or Preview env: `CURSOR_API_KEY` + `CURSOR_INTEGRATION_ENABLED=true`, then re-run `npm run cursor:orchestrate`.

### Quick secrets (PowerShell, from repo root)

Preferred:

```powershell
.\scripts\setup-cursor-secrets.ps1
```

Dry-run (no `vercel env add`):

```powershell
.\scripts\setup-cursor-secrets.ps1 -DryRun
```

## CI note (check PR)

| Check | Status |
| --- | --- |
| `lint-build-cursor-tests` | See PR checks |
| Vercel Preview | See PR |
| Bugbot | Manual — Cursor dashboard |

## Links

- Deploy runbook: [deploy.md](./deploy.md)
- Automation / cron: [automation.md](./automation.md)
- Orchestration phases: [orchestration.md](./orchestration.md)
- Cloud environments: [cloud-environments.md](./cloud-environments.md)
