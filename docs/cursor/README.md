# Cursor integration docs

Contributor-facing guides for using **Cursor** with the HireProof repository and product surfaces. Cursor accelerates development, docs hygiene, PR review, and release QA—it does **not** own fraud verdicts or public audit correctness.

| Doc | Purpose |
| --- | --- |
| [orchestration.md](./orchestration.md) | Cursor plans phases; Codex CLI executes; `@cursor/sdk` for cloud agents |
| [overview.md](./overview.md) | Architecture boundaries and what Cursor must never own |
| [deploy.md](./deploy.md) | Vercel env vars, enablement, webhook secret, Bugbot, branch protection |
| [automation.md](./automation.md) | Cron / PowerShell schedulers, Preview URL workflow, smoke script |
| [cloud-environments.md](./cloud-environments.md) | Cloud Agent environment setup, secrets scope, and governance |
| [sdk.md](./sdk.md) | Developer portal SDK flow, server-side key model, example prompts |
| [mcp.md](./mcp.md) | Grounding agents with HireProof MCP tools |
| [bugbot.md](./bugbot.md) | Bugbot rule philosophy and `.cursor/BUGBOT.md` reference |
| [qa.md](./qa.md) | Release checklist, exploratory QA, Playwright fallback |
| [deep-research-report-HPROOF.md](./deep-research-report-HPROOF.md) | Full strategic research export (cleaned) |

**Live site:** [hireproof.tech/docs/cursor](https://hireproof.tech/docs/cursor)

**Related:** [.agents/skills/hireproof/](../../.agents/skills/hireproof/SKILL.md) (job investigation skill), [.cursor/skills/hireproof-architecture/](../../.cursor/skills/hireproof-architecture/SKILL.md) (SDK agent skill), and [.cursor/rules/hireproof-architecture.mdc](../../.cursor/rules/hireproof-architecture.mdc) (Cursor project rule).

## Orchestration phases

Parsed by `npm run cursor:orchestrate` ([orchestration.md](./orchestration.md)).

**Windows (this machine):**

```powershell
npm run cursor:orchestrate
```

Or with explicit Codex defaults: `.\scripts\orchestrate-cursor-phases.ps1`

<!-- cursor-orchestration-phases
[
  {
    "id": 0,
    "name": "baseline",
    "summary": "Lint and Cursor unit tests (CI parity; direct shell, not Codex)",
    "steps": [
      { "type": "npm", "script": "lint" },
      { "type": "cursor-tests" }
    ]
  },
  {
    "id": 1,
    "name": "cursor-config",
    "summary": "Verify .cursor files, rules, skills, hooks, and pretool guard",
    "steps": [
      { "type": "files", "paths": [
        ".cursor/hooks.json",
        ".cursor/environment.json",
        ".cursor/BUGBOT.md",
        ".cursor/rules/hireproof-architecture.mdc",
        ".cursor/skills/hireproof-architecture/SKILL.md",
        "scripts/cursor-pretool-guard.mjs"
      ]}
    ]
  },
  {
    "id": 2,
    "name": "sdk-smoke",
    "summary": "Optional @cursor/sdk import when CURSOR_API_KEY and integration enabled",
    "steps": [
      { "type": "sdk-smoke", "requiresEnv": "CURSOR_API_KEY" }
    ]
  },
  {
    "id": 3,
    "name": "deploy-readiness",
    "summary": "Codex read-only deploy checklist from docs/cursor",
    "runCodex": true,
    "steps": [],
    "codexHandoff": "Read docs/cursor/overview.md and docs/cursor/deploy.md. Output a 10-line deploy readiness checklist for HireProof Cursor integration. Read-only analysis only: do not edit files, run destructive shell, or call production APIs. Respect scripts/cursor-pretool-guard.mjs."
  },
  {
    "id": 4,
    "name": "internal-routes",
    "summary": "Document secured internal routes (no production calls from orchestrator)",
    "steps": [
      { "type": "internal-routes-doc" }
    ]
  }
]
-->
