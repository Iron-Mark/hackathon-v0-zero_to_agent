# LangChain Package Publishing Checklist

Package name: `@hireproof/langchain`

Before publishing:

1. Run from the repo root:

```powershell
pnpm integrations:test
node packages/hireproof-langchain/test-smoke.mjs
```

2. Pack locally:

```powershell
npm pack --workspace @hireproof/langchain
```

3. Install the tarball into a clean sample project with `@langchain/core` and `zod`.
4. Import `createHireProofAuditTool`.
5. Run the demo API request and confirm a High-Risk fixture result.
6. Publish only from the npm account that should own the package scope.
7. Add the npm package URL to public docs only after publish succeeds.

Current status: source implemented and smoke-tested, not published to npm.
