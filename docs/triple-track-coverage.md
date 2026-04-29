# HireProof Triple-Track Coverage

## Positioning

HireProof should be presented as one product: a proof-backed job-post verification agent.

The tracks are delivery layers for the same agent, not separate product directions:

- Web users paste a suspicious job post and get a verdict.
- Other agents call the same checks through MCP or API.
- Chat communities can ask the same agent to review suspicious posts in Slack or Discord.
- Longer investigations can run asynchronously and notify users when the report is ready.

## Track Map

### v0 + MCPs

Current strongest implemented track.

- v0-style Next.js app experience.
- Runtime MCP tools for company presence, news reputation, job comparison, and local presence.
- Live evidence via SerpApi when configured.
- Shareable report UI and deterministic demo scenarios.

Submission line:

> HireProof is a v0-built AI app that connects to MCP investigation tools to verify suspicious job posts with live evidence.

### ChatSDK Agents

Planned expansion track.

- ChatSDK is not integrated in the repo yet.
- The intended use case is Slack or Discord job communities.
- A user posts or mentions a suspicious job listing, and the HireProof bot replies with verdict, score, evidence bullets, and a full report link.

Submission line after implementation:

> HireProof runs as a ChatSDK Agent for job-seeker communities, using Vercel AI SDK, AI Gateway, and ChatSDK adapters to verify suspicious posts inside chat.

### Vercel Workflow / WDK

Planned async workflow track.

- Best fit is durable background investigations.
- Long-running evidence gathering, retries, webhook delivery, and report generation can move into a workflow.
- The existing `/api/v1/audit` webhook behavior is the natural bridge.

Submission line after implementation:

> HireProof uses durable workflows to run longer job-post investigations in the background and notify users when evidence-backed reports are ready.

## Demo Strategy

Lead with the working product:

1. Paste a suspicious job post into `/audit`.
2. Show the agent extracting claims and calling evidence tools.
3. Open the final Safe, Caution, or High-Risk report.
4. Explain that MCP/API, ChatSDK, and WDK are three surfaces for the same verification core.

If submitting before ChatSDK or WDK code exists, describe those as planned or documented integrations, not live features.

## Guardrails

- Do not describe HireProof as a generic security platform.
- Do not claim ChatSDK or WDK integration is live until package and route code exist.
- Keep the product sentence centered on job posts, recruiter messages, evidence, and apply-before-you-trust decisions.
