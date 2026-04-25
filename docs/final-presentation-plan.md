# Final Presentation Plan: HireProof

## Decision Summary

Build **HireProof** for the **v0 + MCPs** track.

HireProof is a proof-backed AI agent that audits suspicious job posts before someone applies. The user pastes a job post, recruiter message, or job URL. The agent extracts the claims, researches live evidence, checks company footprint, compares similar openings, and returns a clear verdict: **Safe**, **Caution**, or **High-Risk**.

The final positioning should be simple:

> Not another chatbot. A job-post investigator that checks whether an opportunity is legit before you apply.

## Why This Idea Wins

The research reports converge on the same opportunity: trust-safety for job seekers is more memorable than another planning assistant or generic productivity agent. It has a clear audience, visible value, and a screenshot-friendly result.

HireProof is strong because it:

- solves a real, high-anxiety decision for students, fresh grads, and job seekers
- produces visible proof instead of vague AI advice
- fits SerpApi naturally through Search, News, Jobs, and Local data
- gives judges a credible runtime MCP story
- gives voters a result they understand in one screen

## Core Demo Flow

Use one dramatic sample:

> Remote frontend intern. PHP 80,000/week. No interview. Message us on Telegram.

Demo sequence:

1. Open HireProof on Vercel.
2. Paste the suspicious job pitch or click the sample.
3. Click **Investigate**.
4. Show the investigation timeline: extract claims, search presence, check news, compare jobs, check local footprint, score risk.
5. Reveal a **High-Risk** verdict with risk score.
6. Open evidence cards showing red flags and source links.
7. Show safer alternative jobs.
8. End with the export/share result card.

## MVP Scope

Must ship:

- landing page with the hook: “Paste a job post. Know if it’s legit before you apply.”
- audit workspace with pasted text, optional URL, optional location
- visible investigation timeline
- structured result report with verdict, score, confidence, flags, evidence, and next steps
- safer alternatives section
- demo mode with three seeded examples
- result screenshot/export card
- Vercel deployment with no auth wall

Cut from MVP:

- user accounts
- resumes, IDs, or document uploads
- Slack, Discord, or chat-platform bots
- Web3, wallets, or payments
- large dashboards
- multi-agent architecture

## Technical Plan

Recommended stack:

- Next.js App Router
- TypeScript
- Tailwind CSS and shadcn/ui
- AI SDK structured outputs
- runtime MCP route inside the app
- AI SDK MCP client over HTTP
- SerpApi for Google Search, News, Jobs, and Local
- localStorage for MVP history
- Vercel deployment

Core routes and files:

- `app/page.tsx` - landing page
- `app/audit/page.tsx` - main product flow
- `app/history/page.tsx` - local report history
- `app/api/audit/route.ts` - audit endpoint
- `app/api/mcp/route.ts` - MCP tools
- `lib/agent/hireproof-agent.ts` - agent orchestration
- `lib/serpapi.ts` - server-only SerpApi wrappers
- `lib/schema/audit.ts` - typed report schema
- `lib/demo/*.json` - reliable demo fixtures

## Presentation Script

### 15 Seconds

Sketchy job post? Paste it. HireProof researches it live and tells you if it is safe, caution, or high-risk before you waste your time.

### 60 Seconds

Job posts can look real until you spot the gaps. HireProof does that background check for you. Paste the post, and it checks company presence, recent news, comparable roles, and local footprint. Then it returns a clear verdict, proof links, red flags, and safer alternatives.

### 5 Minutes

Start with the pain: job seekers usually verify suspicious opportunities manually across multiple tabs. Then show the sample post, run the investigation, and reveal the high-risk result. Explain the technical story only after the value is obvious: v0 built the polished interface, the app runs on Vercel, the agent uses structured outputs, and runtime MCP tools call SerpApi for live evidence.

Close with:

> HireProof turns job anxiety into evidence.

## Build Order

1. Scaffold landing page, audit page, and result UI with mock data.
2. Add three demo fixtures: high-risk, caution, and safer listing.
3. Build the investigation timeline and structured report components.
4. Add localStorage history.
5. Implement server-side SerpApi wrappers.
6. Add runtime MCP route with four tools: `search_company`, `news_check`, `jobs_compare`, `local_presence`.
7. Connect AI SDK structured output to the audit endpoint.
8. Add fallback from live mode to labeled demo mode.
9. Polish mobile layout, loading states, errors, and export card.
10. Deploy, record demo clips, and submit using the result screen as the cover image.

## Submission Copy

**Title:** HireProof

**Short description:** A proof-backed AI agent that audits job posts before you apply.

**Long description:** HireProof verifies suspicious job opportunities using live evidence. Users paste a job post, recruiter pitch, or job URL, and the agent checks web presence, recent news, comparable openings, and local business signals. It returns a structured risk report with a verdict, evidence cards, red flags, and safer alternatives. Built with v0, deployed on Vercel, and powered by runtime MCP tools plus SerpApi.

## Final Recommendation

Build the smallest complete version of HireProof that makes one moment undeniable: paste a suspicious job post, run the investigation, and reveal a proof-backed verdict. The project should win on clarity first, then technical credibility.
