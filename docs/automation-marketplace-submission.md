# Automation Marketplace Submission Runbook

Last checked: 2026-05-04

This runbook turns the repo-shipped automation packs into external marketplace submissions. Do not mark any marketplace as live until the matching account-backed submission and approval evidence exists.

## Prerequisites

- Production URL verified: `https://hireproof-sigma.vercel.app`
- Demo API key verified: `hireproof_agent_demo_key`
- Source bundle generated: `public/downloads/hireproof-native-integrations.zip`
- Validation passed:

```powershell
pnpm integrations:build
pnpm integrations:test
pnpm integrations:package
pnpm lint
pnpm build
```

## n8n Community Node

Source: `integrations/n8n-nodes-hireproof`

Submission steps:

1. Build or pack from the source folder.
2. Install into a local n8n instance.
3. Add the `HireProof API` credential with the demo API key and production base URL.
4. Create one workflow with `HireProof > Run audit`.
5. Create one workflow with `HireProof > Run async audit` and a public callback URL.
6. Capture screenshots:
   - Node search result showing `HireProof`.
   - Credential form.
   - Run audit operation fields.
   - Successful execution output with `verdict`, `riskScore`, and `summary`.
   - Async `202 processing` response and callback receiver output.
7. Submit to n8n community-node review only after local install and screenshots are complete.

Current claim: source package implemented and validated. Not yet approved by n8n.

## Make Custom App

Source: `integrations/make-hireproof`

Submission steps:

1. Import or recreate the app from the source pack in Make's Custom Apps builder.
2. Configure API-key connection using `x-api-key`.
3. Add modules:
   - `Audit job post`
   - `Audit job post async`
   - `Get API health`
4. Run module tests with the demo API key.
5. Capture screenshots:
   - App metadata.
   - Connection setup.
   - Audit module input fields.
   - Successful audit output fields.
   - Async module response.
   - Health module response.
6. Submit to Make review after the module tests pass.

Current claim: source pack implemented and static-validated. Not yet approved by Make.

## LangChain Package

Source: `packages/hireproof-langchain`

Submission steps:

1. Run `node packages/hireproof-langchain/test-smoke.mjs`.
2. Test the example in `packages/hireproof-langchain/examples/basic-agent.mjs`.
3. Run `npm pack --workspace @hireproof/langchain` or pack from the package directory.
4. Install the packed tarball into a separate sample app.
5. Confirm `createHireProofAuditTool` can be imported and invoked.
6. Publish to npm only from an account that should own the package name.
7. Add the npm URL to `/docs/automations` only after publish succeeds.

Current claim: package source implemented and smoke-tested. Not yet published to npm.

## Post-Submission Evidence

Save evidence under `docs/demo/` or a future `docs/evidence/` folder:

- Marketplace submission confirmation screenshots.
- Review status URLs.
- Published package/listing URLs.
- One working live execution screenshot per platform.

Only after that evidence exists should public copy say `marketplace submitted`, `under review`, or `published`.
