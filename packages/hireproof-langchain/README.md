# @hireproof/langchain

LangChain tool package for gating job-application agents with HireProof audits.

## Install

```bash
npm install @hireproof/langchain @langchain/core zod
```

## Usage

```ts
import { createHireProofAuditTool } from '@hireproof/langchain'

const hireProofTool = createHireProofAuditTool({
  apiKey: process.env.HIREPROOF_API_KEY,
  baseUrl: 'https://hireproof-sigma.vercel.app',
  safeRiskThreshold: 40,
})

const result = await hireProofTool.func({
  text: 'Remote frontend intern. PHP 80,000/week. No interview. Message us on Telegram.',
  location: 'Philippines',
  mode: 'demo',
})
```

## Exports

- `createHireProofAuditTool`
- `HireProofAuditTool`
- `HireProofAuditInputSchema`
- `runHireProofAudit`
- `isSafeEnough`

## Publishing Boundary

This package source is repo-shipped and testable. Publishing to npm requires maintainer account access and is not claimed until completed.
