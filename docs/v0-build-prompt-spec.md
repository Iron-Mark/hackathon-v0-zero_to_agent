# v0 Build Prompt Spec

This is the copy-ready v0 prompt plan for building the Zero to Agent project.

Canonical product name: **HireProof**  
Alternate name if preferred: **OfferProof**

Use the prompts in order. After each v0 output, inspect the generated app, fix obvious breakage, and snapshot the working state before moving to the next prompt.

## Build Goal

Build a production-ready Next.js App Router app for the Zero to Agent hackathon.

HireProof is an AI verification agent for job opportunities. A user pastes a suspicious job post, recruiter pitch, or job URL, and the app investigates it using live evidence, structured scoring, and visible agent steps.

The finished demo should show:

- a clear verdict: Safe, Caution, or High-Risk
- a 0-100 risk score
- extracted claims from the job post
- red flags and green flags
- an investigation timeline
- evidence cards with source links
- safer alternative jobs
- exportable/shareable result summary
- demo-mode fallback for reliable presentations

## Prompt 0: PRD-Only Planning Prompt

Paste this first if you want v0 to plan before writing code.

```text
Build "HireProof," a production-ready Next.js App Router app for the Vercel Zero to Agent hackathon.

Purpose:
HireProof is an AI verification agent for job opportunities. A user pastes a suspicious job post, recruiter pitch, or job URL. The app investigates it and returns a structured trust report with a Safe, Caution, or High-Risk verdict.

Core workflow:
1. Extract claims from the pasted job post or URL.
2. Search company and role presence.
3. Check recent news and reputation signals.
4. Compare against similar legitimate jobs.
5. Check local/company footprint.
6. Score the risk and produce a clear report.

Required app surfaces:
- Landing page at /
- Main audit workspace at /audit
- History page at /history
- Demo mode using seeded data

Technical target:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Vercel deployment
- AI SDK structured outputs later
- Runtime MCP server route later
- SerpApi-backed evidence tools later
- localStorage history
- no auth
- no database for MVP

First output only:
- PRD
- route map
- component tree
- state model
- data schema
- server action/API plan
- MCP tool plan
- SerpApi integration plan
- demo fallback plan
- step-by-step build order

Do not generate code yet.
```

## Prompt 1: Full UI Scaffold

```text
Build a production-looking Next.js App Router web app called HireProof.

Product:
HireProof is an AI verification agent for job opportunities.
A user pastes a suspicious job post, recruiter pitch, or job URL.
The app investigates it and returns:
1. a verdict badge: Safe / Caution / High-Risk
2. a numeric risk score from 0 to 100
3. a short plain-language summary
4. extracted claims like company, role, location, salary, contact method
5. red flags
6. green flags
7. an investigation timeline UI showing the agent checked search, news, comparable jobs, and local presence
8. evidence cards with title, snippet, source label, and positive/neutral/negative signal
9. safer alternative jobs
10. next steps

Design goals:
- not a generic AI chatbot
- editorial investigative feel, clean and premium
- strong hierarchy, asymmetrical spacing, serious trust signals
- use Next.js, TypeScript, Tailwind, shadcn/ui
- responsive and accessible
- no auth
- no fake analytics dashboard
- no giant sidebar by default
- no glassmorphism overload
- no excessive gradients

Pages:
- landing page at /
- main audit workspace at /audit
- history page at /history

Landing page requirements:
- hero headline: "Paste a job post. Know if it's legit before you apply."
- clear sample suspicious input card
- CTA to open /audit
- concise sections: how it works, why it matters, what evidence it checks
- polished social-proof style layout even without logos
- include a "demo mode available" note

Audit workspace requirements:
- large textarea for pasted job text or recruiter message
- optional URL field
- optional location field defaulting to Philippines
- primary CTA: Investigate
- sample input chips
- loading state with visible investigation steps
- result layout with verdict panel, timeline, evidence grid, safer alternatives, and export/share buttons
- clean empty state before first run

History page:
- simple clean list of previous local reports
- cards showing verdict, company, role, score, timestamp
- empty state

Implementation requirements:
- create reusable components
- structure app cleanly for later integration with AI SDK, MCP, and SerpApi
- use mock data first so the full experience is demoable immediately
- include polished empty, loading, error, and success states
- generate all code needed for the UI and routing
- include comments marking where runtime logic will plug in later

Do not:
- add authentication
- add chat bubbles
- add unnecessary settings pages
- add database complexity yet
- overcomplicate the first version

Return the full app scaffold with routes, components, and mock data wired in.
```

Expected output:

- A working Next.js app scaffold.
- `/`, `/audit`, and `/history` routes.
- Mock data wired into the audit result screen.
- A visible product experience before live APIs exist.

## Prompt 2: Route Map, State, and TODOs

```text
Refine HireProof into a concise PRD inside the codebase comments and scaffold the final route map, component tree, and state model. Keep the existing UI. Add a technical TODO checklist for AI SDK, MCP server route, SerpApi wrappers, localStorage history, and demo mode.
```

Inspect:

- route map
- TODO placement
- component ownership
- no unwanted redesign

## Prompt 3: Design System

```text
Apply a custom design system for HireProof: editorial investigative feel, neutral base palette, semantic risk colors, strong typography, thin borders, subtle shadows, custom badges, and non-generic cards. Keep everything Tailwind + shadcn/ui compatible.
```

Inspect:

- verdict colors are consistent
- typography feels serious and readable
- UI does not look like a generic chatbot or dashboard template

## Prompt 4: Landing Page

```text
Improve the landing page so it sells the product in under 10 seconds. Add a premium hero, a real sample suspicious job post card, a three-step how-it-works section, and a clear CTA to /audit. Keep copy sharp and non-generic.
```

Inspect:

- headline is immediately understandable
- CTA is visible on desktop and mobile
- sample post makes the product obvious

## Prompt 5: Audit Workspace

```text
Build the /audit workspace as the main product screen. Use a large input area, optional URL and location fields, sample chips, and a two-column result-ready layout that can show verdict, timeline, evidence, and alternatives.
```

Inspect:

- input flow is obvious
- result regions have clear hierarchy
- mobile stacks cleanly

## Prompt 6: Validation

```text
Add strong form validation with zod-style client feedback. Validate that at least one of pasted text or URL is present. Add inline helper text and polished disabled/loading CTA behavior.
```

Inspect:

- empty submit is blocked
- validation copy is helpful
- CTA behavior is clear

## Prompt 7: Investigation Timeline

```text
Create a visible investigation timeline component for the audit flow. Show steps for Extract Claims, Search Presence, Check News, Compare Jobs, Check Local Footprint, Score Risk. Add loading, active, success, and failure visual states.
```

Inspect:

- the timeline proves the agent is doing work
- step labels are visible in screenshots
- loading state is more than a spinner

## Prompt 8: Structured Result Screen

```text
Build the result screen UI using mock structured data. Include a verdict badge, risk score ring, confidence label, summary block, extracted claims table, red flags, green flags, evidence cards, safer alternatives, and next steps.
```

Inspect:

- verdict and score are visible immediately
- red flags and evidence are easy to scan
- safer alternatives feel useful, not decorative

## Prompt 9: Export and Share Card

```text
Add an export/share result card UI. It should generate a compact visual summary that can be screenshotted or shared: verdict, score, 3 top red flags, and "safer alternatives found" indicator.
```

Inspect:

- card works as a submission/social screenshot
- card does not break the main result layout

## Prompt 10: History

```text
Create the /history page using local mock records first. Use a clean list or masonry card layout with filters for all, safe, caution, high-risk. Add an empty state and clear actions to re-open a report.
```

Inspect:

- no heavy dashboard feel
- filters are simple
- report cards are easy to compare

## Prompt 11: Demo Mode

```text
Add demo mode to HireProof. Create 3 polished sample cases: an obvious scammy recruiter pitch, a caution-level ambiguous listing, and a safer legitimate listing. Add a visible badge when demo data is being shown.
```

Inspect:

- sample cases are realistic
- verdict contrast is obvious
- demo mode is reliable for presentations

## Prompt 12: localStorage History

```text
Implement localStorage persistence for completed audits and history. Persist only the structured report and timestamp. Add hydration-safe logic and graceful fallback if storage is unavailable.
```

Inspect:

- refresh keeps completed reports
- no hydration warnings
- unavailable storage does not crash the app

## Prompt 13: Schemas and Types

```text
Create the HireProof structured types and zod schemas in a central file. Define AuditReport, EvidenceItem, AlternativeJob, and ExtractedClaims. Wire the result screen to consume these typed objects cleanly.
```

Inspect:

- schema matches the UI
- optional fields are handled
- types are not duplicated across components

## Prompt 14: Runtime MCP Shape

```text
Add a runtime MCP server route for HireProof using a Next.js-compatible structure. It should expose four tools: search_company, news_check, jobs_compare, local_presence. For now, return mocked data objects in each tool so the server shape is working.
```

Inspect:

- tool names are exactly stable
- route is server-only
- mocked responses match the schema

## Prompt 15: SerpApi Wrappers

```text
Replace the mocked MCP tool internals with SerpApi-backed wrappers. Create a server-only helper file for SerpApi requests. Each tool should return normalized data shaped for HireProof rather than raw API responses.
```

Inspect:

- `SERPAPI_API_KEY` is never exposed client-side
- helpers handle timeout and empty results
- normalized responses keep the same shape

## Prompt 16: AI SDK Audit Action

```text
Integrate AI SDK into HireProof. Add a server-side audit action that:
1. extracts claims from user input
2. connects to the MCP server with createMCPClient over HTTP
3. makes the model use the MCP tools
4. returns a final structured AuditReport object
Use a clear placeholder for the model provider environment variable.
```

Inspect:

- no API keys leak to client components
- action signature stays stable
- structured output validates against the schema

## Prompt 17: Risk Scoring

```text
Add a robust risk-scoring layer after tool results. Convert evidence into a final verdict using explicit heuristics plus the model's explanation. Make the output deterministic enough that obvious scam cases reliably score high-risk.
```

Inspect:

- scam demo consistently returns High-Risk
- legitimate demo avoids false panic
- explanation and score agree

## Prompt 18: Live Mode and Fallback

```text
Upgrade the audit action to support live mode and demo mode. If live API calls fail, automatically fall back to demo fixtures with a visible "Demo Data" badge and a user-friendly notice.
```

Inspect:

- live failure path is graceful
- demo badge is visible
- app remains usable without keys

## Prompt 19: Loading, Empty, and Error States

```text
Add polished loading, empty, and error states across HireProof. The loading state should feel like a real investigation, not a spinner. The error state should offer retry and demo mode.
```

Inspect:

- loading communicates progress
- error state gives a next action
- empty state teaches by example without long instructions

## Prompt 20: Mobile Polish

```text
Polish mobile responsiveness across all screens. Keep the verdict and CTA visible early on mobile. Make evidence cards and timeline stack cleanly without looking like a dashboard.
```

Inspect:

- first mobile viewport shows the product value
- buttons and cards do not overflow
- result content is readable

## Prompt 21: Accessibility

```text
Polish accessibility across HireProof: semantic headings, keyboard navigation, visible focus states, label associations, contrast improvements, and status announcements for investigation progress.
```

Inspect:

- keyboard flow works
- form labels are associated
- status changes are announced
- contrast is strong

## Prompt 22: Final Visual Polish

```text
Add final visual polish: microinteractions, subtle motion, refined spacing, stronger empty states, cleaner section labels, and a more premium result card. Keep the product serious and trustworthy.
```

Inspect:

- motion is subtle
- seriousness is preserved
- no distracting decorative clutter

## Prompt 23: Metadata and Social Assets

```text
Create metadata and social assets for HireProof. Add page metadata, Open Graph content, Twitter/X card copy, and an OG image direction that clearly shows the verdict + score + red flags.
```

Inspect:

- title and description are submission-ready
- OG content communicates the verdict/result view
- product name is consistent

## Prompt 24: Vercel Deployment Prep

```text
Prepare HireProof for deployment on Vercel. Verify environment variable placeholders, server-only imports, route handlers, and build safety. Remove dead code and add notes for required variables:
SERPAPI_API_KEY
MODEL_PROVIDER_KEY
APP_BASE_URL
```

Inspect:

- build passes
- env vars are documented
- server-only code does not enter client bundles

## Prompt 25: README and Submission Pack

```text
Generate a concise README and hackathon submission pack inside the repo. Include:
- what HireProof does
- why it is agentic
- how MCP is used at runtime
- how SerpApi is used
- how to run locally
- required environment variables
- demo script summary
- screenshots needed for Showcase
Keep it hackathon-ready and polished.
```

Inspect:

- README is under 120 lines
- submission copy is judge-friendly
- screenshot checklist favors the result screen, not only the landing page

## Final Acceptance Checklist

- App runs locally.
- App deploys on Vercel.
- `/audit` works in demo mode with no API keys.
- Live mode uses server-side environment variables only.
- Result screen shows verdict, score, evidence, and alternatives.
- Timeline visibly proves multi-step agent work.
- Export/share card is screenshot-ready.
- README explains v0, MCP, SerpApi, and AI SDK usage.
- Submission screenshot uses the result view.
- No auth, database, giant dashboard, or unrelated settings pages were added.
