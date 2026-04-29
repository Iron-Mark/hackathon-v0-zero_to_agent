# ChatSDK Agents Integration Plan

## Current Status

Implemented as a credential-gated integration path.

- `chat`, `@chat-adapter/slack`, `@chat-adapter/state-redis`, `@ai-sdk/gateway`, and `workflow` are installed.
- `/api/webhooks/slack` routes Slack events through `Chat.webhooks.slack`.
- `lib/hireproof-bot.ts` registers ChatSDK mention and subscribed-message handlers.
- `lib/ai-model.ts` prefers AI Gateway when `AI_GATEWAY_API_KEY` is present and falls back to the existing OpenAI-compatible key.
- Live proof still requires Slack credentials, Redis state, and deployed webhook testing.

## Decision

Integrate ChatSDK as an additional HireProof surface, not as a replacement for the current app.

The repo already has the stronger core for a trust-safety submission: a Next.js app, a streaming audit route, a headless REST API, MCP-compatible investigation tools, saved reports, and a polished proof-backed UI. ChatSDK should make that agent available inside chat platforms where job scams actually spread: Slack, Discord, Teams, and similar communities.

This shifts the project from only `v0 + MCPs` toward the `ChatSDK Agents` track while preserving the existing demo.

## Track Fit

The ChatSDK Agents track expects an agent built with:

- Vercel AI SDK
- AI Gateway
- ChatSDK
- Cross-platform chat surfaces such as Slack, Discord, Teams, GitHub, and more

HireProof already satisfies part of that:

- It uses Vercel AI SDK through `ai`, `generateText`, `generateObject`, and tool orchestration.
- It has real agent behavior through claims extraction, MCP-style tools, deterministic scoring, and report output.
- It has agent-facing APIs: `/api/v1/audit` and `/api/mcp`.

Implemented pieces:

- ChatSDK core package and Slack adapter wiring.
- AI Gateway model routing.
- One real chat adapter route: `/api/webhooks/slack`.
- Chat-native response formatting through `formatChatVerdict`.
- Submission copy that clearly explains the ChatSDK architecture.

## Product Angle

### Current Product

HireProof answers:

> "Is this job post safe enough to apply to?"

### ChatSDK Extension

HireProof Chat Agent answers the same question inside a team or community chat:

> "Can someone verify this job post before people apply?"

Best demo scenarios:

- A Discord job-board channel where a suspicious remote internship is posted.
- A Slack community where someone mentions `@HireProof` under a recruiter message.
- A student/alumni group where the bot replies with a risk card and evidence.

This is stronger than adding a generic chat UI because the value is social and contextual: the agent protects a whole channel, not just one user.

## Architecture

```text
Slack / Discord / Teams mention
        |
        v
ChatSDK platform adapter
        |
        v
lib/bot.ts
        |
        v
lib/hireproof-agent.ts
        |
        +--> claims extraction
        +--> company web presence tool
        +--> news / scam report tool
        +--> salary / role comparison tool
        +--> local business footprint tool
        +--> deterministic risk score
        |
        v
Chat-native verdict card
        |
        +--> short channel reply
        +--> full report permalink
        +--> optional follow-up actions
```

## Implementation Phases

### Phase 1 - Extract Shared Agent Core

Goal: stop duplicating logic between the web route, headless route, and future chat bot.

Create:

- `lib/hireproof-agent.ts`
- `lib/hireproof-tools.ts`
- `lib/hireproof-report.ts`

Move reusable pieces out of:

- `app/api/audit/route.ts`
- `app/api/v1/audit/route.ts`

Target exports:

```ts
export async function investigateJobPost(input: {
  text: string
  mode?: 'demo' | 'live'
  source?: 'web' | 'api' | 'chat'
}): Promise<AuditReport>

export async function* streamInvestigation(input: {
  text: string
  mode?: 'demo' | 'live'
  source?: 'web' | 'api' | 'chat'
}): AsyncGenerator<InvestigationEvent>
```

Keep the existing routes working by making them call this shared module.

Acceptance criteria:

- `/audit` still streams progress.
- `/api/v1/audit` still returns JSON.
- No logic fork for chat.
- `npm run lint` and `npm run build` pass.

### Phase 2 - Add AI Gateway Routing

Goal: meet the track requirement and simplify model switching.

Add env vars:

```env
AI_GATEWAY_API_KEY=
HIREPROOF_MODEL=openai/gpt-5-mini
```

Create:

- `lib/ai-model.ts`

Example shape:

```ts
import { gateway } from 'ai'

export function getHireProofModel() {
  return gateway(process.env.HIREPROOF_MODEL || 'openai/gpt-5-mini')
}
```

Then replace direct model construction inside agent code with `getHireProofModel()`.

Important note: keep current `MODEL_PROVIDER_KEY` fallback until AI Gateway is verified in production. This prevents breaking the current live-mode path during the hackathon.

Acceptance criteria:

- AI Gateway path works when `AI_GATEWAY_API_KEY` is present.
- Current OpenAI-compatible key path still works as fallback.
- README and `.env.example` include the new env vars.

### Phase 3 - Install ChatSDK Packages

Recommended MVP install:

```bash
npm install chat @chat-adapter/slack @chat-adapter/discord @chat-adapter/state-redis
```

Start with Slack first. Add Discord after Slack works.

Why Slack first:

- Stronger professional/job-community context.
- Cleaner demo story for job verification.
- ChatSDK has mature Slack adapter documentation.

Why Discord second:

- Stronger hackathon/student/community demo.
- More emotionally aligned with scam-post moderation.

Acceptance criteria:

- `package.json` includes `chat` and at least one `@chat-adapter/*`.
- No unused adapter credentials are required for local build.
- App still builds without Slack/Discord env vars.

### Phase 4 - Create the Bot Core

Create:

- `lib/bot.ts`

Responsibilities:

- Define one ChatSDK `Chat` instance.
- Register Slack and optional Discord adapters.
- Subscribe to mentions or direct messages.
- Call `streamInvestigation`.
- Post a compact verdict first, then evidence details.

High-level example:

```ts
import { Chat } from 'chat'
import { createSlackAdapter } from '@chat-adapter/slack'
import { createRedisState } from '@chat-adapter/state-redis'
import { investigateJobPost } from '@/lib/hireproof-agent'
import { formatChatVerdict } from '@/lib/chat-verdict'

export const bot = new Chat({
  userName: 'HireProof',
  adapters: {
    slack: createSlackAdapter(),
  },
  state: createRedisState(),
})

bot.onNewMention(async (thread, message) => {
  await thread.subscribe()
  await thread.post('Checking this job post with HireProof...')

  const report = await investigateJobPost({
    text: message.text,
    source: 'chat',
  })

  await thread.post(formatChatVerdict(report))
})
```

Acceptance criteria:

- The bot can be imported without side effects that break `next build`.
- A mention handler calls the shared HireProof agent module.
- Errors return a useful chat reply instead of failing silently.

### Phase 5 - Add Platform Webhook Routes

Create:

- `app/api/webhooks/slack/route.ts`
- `app/api/webhooks/discord/route.ts` as stretch

Slack route responsibilities:

- Initialize the bot.
- Verify and route incoming Slack events through the ChatSDK adapter.
- Return the response expected by the adapter.

Optional Slack socket mode route:

- `app/api/slack/socket-mode/route.ts`

Use socket mode only if webhook setup becomes painful during the demo. Webhooks are a cleaner production story, but socket mode can be useful while testing.

Acceptance criteria:

- Slack app can send an event to `/api/webhooks/slack`.
- Mentioning the bot triggers a HireProof investigation.
- The bot replies in-thread, not as a detached message.
- A failed investigation posts a clear fallback response.

### Phase 6 - Chat-Native Response Design

Do not paste the full report into chat.

Use this message structure:

```text
HireProof verdict: High-Risk (92/100)

Top reasons:
1. Salary is far above comparable listings.
2. Hiring path uses Telegram-only contact.
3. Company footprint could not be verified.

Safer next step:
Do not send documents or payment. Verify through the official company careers page.

Full report:
https://...
```

For Slack, convert this into Block Kit/card-like output when practical:

- Verdict pill
- Risk score
- Top evidence bullets
- "Open full report" link button
- "Explain this verdict" button as stretch
- "Mark as reviewed" reaction/action as stretch

For Discord:

- Use an embed-style response if the adapter supports it.
- Otherwise use concise Markdown.

Acceptance criteria:

- First reply is readable in under 10 seconds.
- Evidence is summarized, not dumped.
- Full report link exists when persistence succeeds.
- No sensitive API keys or internal logs appear in chat.

### Phase 7 - Persist Chat-Origin Reports

Goal: make chat results shareable in the existing web app.

When a chat investigation completes:

- Save the report through the existing persistence path.
- Generate `/audit/[id]`.
- Include the permalink in the chat reply.
- Store metadata: platform, channel/thread ID, createdAt.

Potential file:

- `lib/chat-report-store.ts`

Acceptance criteria:

- Slack/Discord result links open in the web UI.
- Reports created from chat are not indexed by search engines.
- Report history/persistence does not require a logged-in user.

### Phase 8 - Add Docs and Submission Proof

Add app docs page:

- `app/docs/chat-sdk-agents/page.tsx`

Add or update repo docs:

- `docs/chat-sdk-agents-integration-plan.md`
- `README.md`
- `DEVPOST.md`
- `.env.example`

Docs page sections:

- What the ChatSDK agent does
- Supported platforms
- Required environment variables
- Slack setup
- Discord setup
- Architecture diagram
- Example mention and response
- Security/rate-limit notes

Acceptance criteria:

- A judge can understand the ChatSDK track fit from docs alone.
- README explicitly says: "ChatSDK Agents: Slack/Discord bot powered by Vercel AI SDK + AI Gateway + ChatSDK."
- Demo script includes the chat surface.

## Environment Variables

Core:

```env
AI_GATEWAY_API_KEY=
HIREPROOF_MODEL=openai/gpt-5-mini
APP_BASE_URL=
AGENT_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Slack:

```env
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
SLACK_APP_TOKEN=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
```

Discord:

```env
DISCORD_BOT_TOKEN=
DISCORD_PUBLIC_KEY=
DISCORD_APPLICATION_ID=
```

Operational:

```env
CRON_SECRET=
CHATSDK_ENABLED=true
CHATSDK_PLATFORM_SLACK=true
CHATSDK_PLATFORM_DISCORD=false
```

## File Plan

New files:

```text
lib/ai-model.ts
lib/hireproof-agent.ts
lib/hireproof-tools.ts
lib/chat-verdict.ts
lib/bot.ts
app/api/webhooks/slack/route.ts
app/api/webhooks/discord/route.ts
app/docs/chat-sdk-agents/page.tsx
docs/chat-sdk-agents-integration-plan.md
```

Modified files:

```text
app/api/audit/route.ts
app/api/v1/audit/route.ts
app/api/mcp/route.ts
app/docs/layout.tsx
README.md
DEVPOST.md
.env.example
package.json
package-lock.json
```

## MVP Cut

Build only this for the first pass:

1. Extract shared agent core.
2. Add AI Gateway helper with fallback.
3. Install ChatSDK core plus Slack adapter.
4. Add `lib/bot.ts`.
5. Add Slack webhook route.
6. Reply with a concise Markdown verdict.
7. Include full report permalink.
8. Add `/docs/chat-sdk-agents`.

Delay these until the Slack path is proven:

- Discord adapter.
- Teams adapter.
- Rich interactive buttons.
- Socket mode.
- Multi-platform install UI.
- Per-workspace billing or auth.

## Demo Script

### 15-second version

1. Show a Slack channel with a suspicious job post.
2. Mention `@HireProof verify this`.
3. Bot replies: "High-Risk, 92/100" with three evidence bullets.
4. Click "Open full report" to show the existing HireProof dossier.

### 60-second version

1. Post a scam-like job in Slack.
2. Mention `@HireProof`.
3. Show the bot posting "checking web presence, news, salary, local footprint."
4. Show final verdict card.
5. Open the full web report.
6. Mention the architecture: ChatSDK adapter, Vercel AI SDK, AI Gateway, HireProof tools.

### 5-minute judge demo

1. Start in the web app to show the polished existing product.
2. Move to Slack to show the same agent running inside a community.
3. Show logs or docs proving the ChatSDK adapter route.
4. Show the full report permalink.
5. Explain the safety model: rate limiting, SSRF checks, no secret leakage, deterministic scoring.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Slack app setup takes too long | Demo blocked | Build a local mock route and keep web app demo intact |
| Adapter env vars break production build | High | Lazy-initialize bot only inside webhook routes |
| Chat reply becomes too long | Medium | Always post summary first, link to full report |
| AI Gateway auth fails locally | Medium | Keep existing `MODEL_PROVIDER_KEY` fallback |
| Platform webhook verification fails | Medium | Use official adapter verification, do not hand-roll signatures |
| Redis missing | Medium | Keep local/in-memory fallback where possible, document Redis as recommended |
| Report persistence fails | Low | Reply with verdict even without permalink |

## Definition of Done

The ChatSDK integration is submission-ready when:

- `npm run lint` passes.
- `npm run build` passes.
- `package.json` contains `chat` and `@chat-adapter/slack`.
- `lib/bot.ts` defines the ChatSDK bot.
- `app/api/webhooks/slack/route.ts` receives platform events.
- Slack mention triggers a HireProof investigation.
- Chat reply includes verdict, score, evidence, and full report link.
- Agent uses AI Gateway when configured.
- Existing `/audit`, `/api/audit`, `/api/v1/audit`, and `/api/mcp` still work.
- README and Devpost mention ChatSDK Agents clearly.

## Submission Positioning

Use this line:

> HireProof is a ChatSDK Agent that protects job-seeker communities from recruitment scams across web, API, MCP, and Slack. It uses Vercel AI SDK + AI Gateway for investigation, ChatSDK for chat-platform delivery, and a proof-backed report UI for evidence review.

Avoid saying:

> We added a chatbot.

Say instead:

> We turned HireProof into a chat-native safety agent for job communities.

## Source Notes

- ChatSDK describes itself as a unified TypeScript SDK for building bots across Slack, Microsoft Teams, Google Chat, Discord, Telegram, GitHub, Linear, WhatsApp, and more: https://chat-sdk.dev/docs
- ChatSDK adapter docs explain that adapters verify platform webhooks, normalize incoming messages, route handlers through `Chat`, and convert outgoing content to platform-native formats: https://chat-sdk.dev/docs/adapters
- AI Gateway can be used from the AI SDK with model strings or the `gateway` provider and supports `AI_GATEWAY_API_KEY`: https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway
- Slack adapter docs cover webhook/socket-mode handling and streaming into Slack threads: https://chat-sdk.dev/adapters/slack
